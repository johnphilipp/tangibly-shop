// other imports
import { z, ZodError } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"; // Adjust the import based on your project structure
import axios from "axios";
import { TRPCError } from "@trpc/server";
import {
  fromStravaActivity,
  type StravaActivity,
} from "~/utils/fromStravaActivity";
import { db as prisma } from "~/server/db";

const getAllSavedActivities = async (userId: string) => {
  const response = prisma.activity.findMany({
    where: { athlete: userId },
    orderBy: { start_date: "desc" },
  });

  return response;
};

export const activitiesRouter = createTRPCRouter({
  fetchActivities: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .query(async ({ ctx, input }) => {
      // const accessToken = await getAccessToken(ctx.session.user.id);
      const accessToken = input.accessToken;
      if (!accessToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No access token found",
        });
      }

      // btw, this is how yo add to DB: ctx.db.user.create({});
      let foundActivities = 0;
      let after = 0;
      const perPage = 200;

      console.log("User id: ", ctx.session.user.id);

      const savedActivities = await getAllSavedActivities(ctx.session.user.id);

      after =
        new Date(savedActivities[0]?.start_date ?? new Date(0)).getTime() /
        1000;

      let before = Date.now() / 1000;

      do {
        let url = `https://www.strava.com/api/v3/athlete/activities?`;

        if (after > 0) {
          url += `before=${before}&after=${after + 1}&per_page=${perPage}`;
        } else {
          url += `before=${before}&per_page=${perPage}`;
        }

        const config = {
          method: "get",
          url: url,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        try {
          const response = await axios(config);
          const activities = response.data as StravaActivity[];

          if (!activities) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No activities found",
            });
          }

          foundActivities = activities.length;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          before =
            new Date(
              activities[activities.length - 1]?.start_date ?? Date.now(),
            ).getTime() / 1000;

          const flattenedActivity = activities.map((value) =>
            fromStravaActivity(value),
          );

          // check if activity id ends with "n", if so, replace n with 0
          flattenedActivity.forEach((activity) => {
            if (activity.id.toString().endsWith("n")) {
              activity.id = BigInt(activity.id.toString().replace("n", "0"));
            }
          });

          // push to db
          await ctx.db.activity.createMany({
            data: flattenedActivity,
            skipDuplicates: true,
          });
        } catch (error) {
          // If there's an HTTP error, throw a TRPCError with the message from the error
          if (axios.isAxiosError(error)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          } else if (error instanceof ZodError) {
            // If there's a validation error, throw a TRPCError with details
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          } else {
            // For any other errors, throw a generic server error
            console.log(error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
        }
      } while (foundActivities === perPage);

      return getAllSavedActivities(ctx.session.user.id);
    }),
});

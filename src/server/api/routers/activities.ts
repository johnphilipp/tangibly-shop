// other imports
import { z, ZodError } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"; // Adjust the import based on your project structure
import axios from "axios";
import {TRPCError} from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { type Activity } from "@prisma/client";
import {fromStravaActivity, type StravaActivity} from "~/utils/fromStravaActivity";


// TODO:
// Fetch activities until all are fetched by using after=timestamp (unix) from last activity in every response until response length is 0
// Add Activity to Prisma model
// Check if user has activites
// If yes, get latest timestamp from db --> Fetch api with after=timestamp --> save to db
// If no, fetch api --> save to db
// Return allactivities from db
// Look into conditional query stuff


const getAllSavedActivities = async (userId: string) => {
    const prisma = new PrismaClient();
    const response = prisma.activity.findMany({
        where: {athlete: userId},
        orderBy: {start_date: "desc"},
    });

    return response;
}

    export const activitiesRouter = createTRPCRouter({
        fetchActivities: protectedProcedure
            .input(z.object({accessToken: z.string()}))
            .query(async ({ctx, input}) => {
                // const accessToken = await getAccessToken(ctx.session.user.id);
                const accessToken = input.accessToken;
                if (!accessToken) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "No access token found",
                    });
                }

                // btw, this is how yo add to DB: ctx.db.user.create({});

                const perPage = 1;

                console.log(ctx.session.user.id)

                const savedActivities = await getAllSavedActivities(ctx.session.user.id);

                console.log('savedActivities', savedActivities)
                let url = `https://www.strava.com/api/v3/athlete/activities?`;

                if (savedActivities[0]?.start_date) {
                    const after = new Date(savedActivities[0].start_date).getTime() / 1000;
                    url += `after=${after + 1}&per_page=${perPage}`;
                } else {
                    url += `per_page=${perPage}`;
                }

                console.log('url', url)

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

                    const fa = activities.map(value => fromStravaActivity(value));
                    for (const value of fa) {
                        await saveActivity(value, ctx.session.user.id);
                    }

                    return await getAllSavedActivities(ctx.session.user.id);

                } catch (error) {
                    // If there's an HTTP error, throw a TRPCError with the message from the error
                    if (axios.isAxiosError(error)) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: error.message,
                        });
                    } else if (error instanceof ZodError) {
                        // If there's a validation error, throw a TRPCError with details
                        throw new TRPCError({code: "BAD_REQUEST", message: error.message});
                    } else {
                        // For any other errors, throw a generic server error
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                        });
                    }
                }
            }),
    });

    async function saveActivity(activity: Activity, id: string) {

        const prisma = new PrismaClient();

        await prisma.activity.findFirst({where: {athlete: id}}).then(async (lookup) => {
            if (lookup) {
                console.log('activity already exists')
                return;
            }

            // Then, save the activity referencing the saved coordinates
            await prisma.activity.create({
                data: activity
            });
        });


    }

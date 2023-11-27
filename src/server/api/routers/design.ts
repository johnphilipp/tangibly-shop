import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const designRouter = createTRPCRouter({
  save: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(
          z.object({ id: z.bigint(), canvasIndex: z.number() }),
        ),
        id: z.number(),
        aspectRatioRow: z.number(),
        aspectRatioColumn: z.number(),
        activityTypes: z.string(),
        stroke: z.number(),
        padding: z.number(),
        backgroundColor: z.string(),
        strokeColor: z.string(),
        previewSvg: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Saving design", input.id);
        await ctx.db.activitiesOnDesign.deleteMany({
          where: {
            design: {
              userId: ctx.session.user.id,
              id: input.id,
            },
          },
        });

        const createOperations = input.activityIds.map((activity) => {
          return ctx.db.activitiesOnDesign.create({
            data: {
              activity: { connect: { id: activity.id } },
              design: { connect: { id: input.id } },
              canvasIndex: activity.canvasIndex,
            },
          });
        });

        await Promise.all(createOperations);

        await ctx.db.design.update({
          data: {
            aspectRatioRow: input.aspectRatioRow,
            aspectRatioColumn: input.aspectRatioColumn,
            activityTypes: input.activityTypes,
            stroke: input.stroke,
            padding: input.padding,
            backgroundColor: input.backgroundColor,
            strokeColor: input.strokeColor,
            previewSvg: input.previewSvg,
          },
          where: { id: input.id, userId: ctx.session.user.id },
        });

        return { status: "success" };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Getting design" + input.id);
        const design = await ctx.db.design.findFirst({
          where: { userId: ctx.session.user.id, id: input.id },
          include: { ActivitiesOnDesign: true },
        });

        return { status: "success", design: design };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  getAll: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    try {
      console.log("Getting all designs");
      const designs = await ctx.db.design.findMany({
        where: { userId: ctx.session.user.id },
      });

      return { status: "success", designs: designs };
    } catch (error) {
      console.log(error);
      return {
        status: "error",
        message: "Something went wrong. Please try again later",
      };
    }
  }),

  setName: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Setting name for Design", input.id);
        await ctx.db.design.update({
          data: {
            name: input.name,
          },
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        return { status: "success", message: "Name update successful" };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  create: protectedProcedure
    .input(z.object({ productType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the highest number for "Untitled-" designs
        const untitledDesigns = await ctx.db.design.findMany({
          where: {
            name: {
              startsWith: "Untitled-",
            },
          },
          orderBy: {
            name: "desc",
          },
        });

        // Extract the highest number and increment it
        const highestNumber = untitledDesigns.reduce((max, design) => {
          const number = parseInt(design.name.replace("Untitled-", ""));
          return isNaN(number) ? max : Math.max(max, number);
        }, 0);

        const name = `Untitled-${highestNumber + 1}`;

        const design = await ctx.db.design.create({
          data: {
            productType: input.productType,
            name: name,
            aspectRatioRow: 5,
            aspectRatioColumn: 10,
            activityTypes: "Run Ride",
            stroke: 5,
            padding: 10,
            backgroundColor: "#FFFFFF", // Example: White color
            strokeColor: "#000000", // Example: Black color
            previewSvg: "",
            user: { connect: { id: ctx.session.user.id } },
          },
        });

        return { status: "success", design: design };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Deleting Design", input.id);
        await ctx.db.design.delete({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        return { status: "success", message: "Deletion successful" };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),
});

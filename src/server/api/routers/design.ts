import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const designRouter = createTRPCRouter({
  saveCollage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        activityTypes: z.string(),
        backgroundColor: z.string(),
        strokeColor: z.string(),
        primaryText: z.string(),
        secondaryText: z.string(),
        previewSvg: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Saving design", input.id);

        const collage = await ctx.db.collage.findUnique({
          where: { id: input.id },
          include: { Design: true },
        });

        if (!collage) {
          return {
            status: "error",
            message: "Collage not found",
          };
        }

        await ctx.db.collage.update({
          data: {
            primaryText: input.primaryText,
            secondaryText: input.secondaryText,
            Design: {
              update: {
                where: { id: collage.designId, userId: ctx.session.user.id },
                data: {
                  activityTypes: input.activityTypes,
                  backgroundColor: input.backgroundColor,
                  strokeColor: input.strokeColor,
                  previewSvg: input.previewSvg,
                  name: input.name,
                },
              },
            },
          },
          where: { id: input.id },
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

  getOneCollage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Getting collage" + input.id);
        const collage = await ctx.db.collage.findFirst({
          where: { id: input.id },
          include: { Design: { include: { ActivitiesOnDesign: true } } },
        });

        return { status: "success", collage: collage };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

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
            activityTypes: input.activityTypes,
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

  getCollage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Getting design" + input.id);
        const design = await ctx.db.collage.findFirst({
          where: {
            id: input.id,
            Design: {
              userId: ctx.session.user.id,
            },
          },
          include: { Design: true },
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
    .input(
      z.object({
        productType: z.string(),
        designType: z.string(),
        collageType: z.string(),
      }),
    )
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

        if (input.designType === "collage" || input.designType === "heatmap") {
          const design = await ctx.db.collage.create({
            data: {
              primaryText: "",
              secondaryText: "",
              collageType: input.collageType,
              Design: {
                create: {
                  productType: input.productType,
                  name: name,
                  activityTypes: "Run Ride",
                  backgroundColor: "#FFFFFF", // Example: White color
                  strokeColor: "#000000", // Example: Black color
                  previewSvg: "",
                  user: { connect: { id: ctx.session.user.id } },
                },
              },
            },
          });

          return { status: "success", id: design.id };
        }
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

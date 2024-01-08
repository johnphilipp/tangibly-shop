import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const designRouter = createTRPCRouter({
  saveCollage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        activityTypes: z.string(),
        years: z.string(),
        backgroundColor: z.string(),
        strokeColor: z.string(),
        primaryText: z.string(),
        secondaryText: z.string(),
        isPrimaryOriginal: z.boolean(),
        isSecondaryOriginal: z.boolean(),
        previewSvg: z.string(),
        useText: z.boolean(),
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
            useText: input.useText,
            Design: {
              update: {
                where: { id: collage.designId, userId: ctx.session.user.id },
                data: {
                  isPrimaryOriginal: input.isPrimaryOriginal,
                  isSecondaryOriginal: input.isSecondaryOriginal,
                  activityTypes: input.activityTypes,
                  years: input.years,
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
          include: { Design: true },
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
        designType: z.string(),
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
            userId: ctx.session.user.id,
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

        if (input.designType === "Collage" || input.designType === "Heatmap") {
          const design = await ctx.db.collage.create({
            data: {
              primaryText: "",
              secondaryText: "",
              collageType: input.designType,
              useText: true,
              Design: {
                create: {
                  productType: input.designType,
                  name: name,
                  years: "2023",
                  activityTypes: "",
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

        return { status: "error", message: "Invalid design type" };
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

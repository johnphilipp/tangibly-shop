import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import axios from "axios";
import sharp from "sharp";
import * as process from "process";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LineItem = module;

const prices = {
  mug: "price_1OJyuwBYeZI73kv1Kj5oyOmJ",
  poster: "price_1OJz1rBYeZI73kv1UatLIZDv",
};

function createLineItem(quantity: number, image_url: string) {
  return {
    price_data: {
      currency: "CHF",
      unit_amount: 20,
      product_data: {
        name: "Personal Mug",
        images: [image_url],
      },
    },
    quantity: quantity,
    description: "A mug with your personal runs",
  };
}

async function convertSvgToJpgAndUpload(base64Svg: string) {
  // Step 1: Decode Base64 SVG
  const svgBuffer = Buffer.from(base64Svg, "base64");

  try {
    // Step 2: Convert SVG to JPG
    const jpgBuffer = await sharp(svgBuffer).toFormat("jpg").toBuffer();

    // Step 3: Upload to ImgBB
    const form = new FormData();

    form.append("image", jpgBuffer.toString("base64"));
    form.append("expiration", "60000");

    return await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMAGE_UPLOAD_KEY}`,
      form,
    );
  } catch (error) {
    console.error("Error converting or uploading image:", error);
    throw error;
  }
}

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        lineItems: z.array(
          z.object({ price: z.string(), quantity: z.number() }),
        ),
      }),
    )
    .mutation(async ({ ctx }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const items = await ctx.db.cartItem.findMany({
          where: { userId: ctx.session.user.id },
          include: { design: true },
        });

        const lineItemsPromises = items.map(async (item) => {
          const image = await convertSvgToJpgAndUpload(item.design.previewSvg);

          switch (item.design.productType) {
            case "Heatmap":
            case "Collage":
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
              return createLineItem(item.amount, image.data.url);
            case "poster":
              return { price: prices.poster, quantity: item.amount };
            default:
              return null;
          }
        });

        const lineItems = (await Promise.all(lineItemsPromises)).filter(
          (item): item is LineItem => item !== null,
        );

        if (!lineItems) {
          console.log("Cart is empty");
          return {
            status: "error",
            message: "Cart is empty",
          };
        }

        console.log("Creating checkout session", lineItems);

        const session = await ctx.stripe.checkout.sessions.create({
          ui_mode: "embedded",
          line_items: lineItems,
          mode: "payment",
          return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return { status: "success", clientSecret: session.client_secret };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const session = await ctx.stripe.checkout.sessions.retrieve(
          input.sessionId,
        );
        return {
          status: session.status,
        };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),
});

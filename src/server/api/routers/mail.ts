import {z} from "zod";
import * as nodemailer from "nodemailer";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as pug from "pug";
import * as path from "path";
import * as process from "process";


const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const mailRouter = createTRPCRouter({
  registerUserForMail: protectedProcedure
    .input(z.object({ email: z.string(), svg: z.string() }))
    .mutation( async ({ctx, input}) => {
            if (!emailRegex.test(input.email)) {
                return {status: 'error', message: 'Invalid e-mail'};
            }

            try {
                console.log("Saving mail ", input.email)
                await ctx.db.user.update({
                    where: {id: ctx.session.user.id},
                    data: {email: input.email},
                });

                console.log("Sending mail ", input.email)
                await sendEmail(input.email, 'Tangibly Export', ctx.session.user.name ?? 'there', input.svg)

                return {status: 'success', message: 'Success! Thank you.'};
            } catch (error) {
                console.log(error)
                return {status: 'error', message: "Something went wrong. Please try again later"};
            }
    }),
});

async function sendEmail(to: string, subject: string, user: string, svg: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    /**const mailhog_transporter = nodemailer.createTransport({
      host: '127.0.0.1',
      port: 1025,
    });*/

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const gmail_transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,     // your Gmail address from environment variables
            pass: process.env.EMAIL_PASSWORD  // your Gmail password from environment variables
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //const transporter = process.env.NODE_ENV === "production" ? gmail_transporter : mailhog_transporter;

        // Compile the Pug template to HTML
    const compiledFunction = pug.compileFile(path.join(process.cwd(), 'mail/html.pug'));
    const html = compiledFunction({
            recipientName: user
        });

    const svgBuffer = Buffer.from(svg, 'base64');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html,
        attachments: [
        {
          filename: `${user}-export.svg`,
          content: svgBuffer,
          contentType: 'image/svg+xml'
        }
  ]
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    await gmail_transporter.sendMail(mailOptions);
}


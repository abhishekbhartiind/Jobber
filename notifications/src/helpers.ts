import path from "path";

import { IEmailLocals } from "@ahgittix/jobber-shared";
import {
    logger,
    SENDER_EMAIL,
    SENDER_EMAIL_PASSWORD
} from "@notifications/config";
import nodemailer, { Transporter } from "nodemailer";
import Email from "email-templates";

export function emailTemplates(
    template: string,
    sendTo: string,
    locals: IEmailLocals
): void {
    try {
        const transport: Transporter = nodemailer.createTransport({
            // host: "smtp.ethereal.email",
            service: "gmail",
            // port: 587,
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_EMAIL_PASSWORD
            }
        });

        const email: Email = new Email({
            message: {
                from: `Jobber App <${SENDER_EMAIL}>`
            },
            send: true,
            preview: false,
            transport,
            views: {
                options: {
                    extension: "ejs"
                }
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.join(__dirname, "../build")
                }
            }
        });

        email.send({
            template: path.join(__dirname, "..", "src/emails", template),
            message: { to: sendTo },
            locals
        });
    } catch (error) {
        logger("helpers.ts - emailTemplates").error(error);
    }
}

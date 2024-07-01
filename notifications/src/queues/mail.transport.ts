import { IEmailLocals } from "@ahgittix/jobber-shared";
import { logger } from "@notifications/config";
import { emailTemplates } from "@notifications/helpers";

export function sendEmail(
    template: string,
    receiverEmail: string,
    locals: IEmailLocals
): void {
    try {
        // email templates
        emailTemplates(template, receiverEmail, locals);
        logger("queues/mail.transport.ts - sendEmail()").info(
            "Email sent successfully"
        );
    } catch (error) {
        logger("queues/mail.transport.ts - sendEmail()").error(
            "Notification Service MailTransport sendEmail() method error:",
            error
        );
    }
}

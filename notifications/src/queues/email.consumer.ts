import { CLIENT_URL, logger } from "@notifications/config";
import { IEmailLocals } from "@ahgittix/jobber-shared";
import { Channel, ConsumeMessage } from "amqplib";
import { createConnection } from "@notifications/queues/connection";
import { sendEmail } from "@notifications/queues/mail.transport";
import {
    orderDeliveredSchema,
    orderExtensionApprovalSchema,
    orderExtensionSchema,
    orderPlacedSchema
} from "@notifications/schemas/emailLocal.schema";
import { Value } from "@sinclair/typebox/value";

const exchangeNamesAndRoutingKeys = {
    email: {
        exchangeName: "jobber-email-notification",
        routingKey: "auth-email",
        queueName: "auth-email-queue"
    },
    order: {
        exchangeName: "jobber-order-notification",
        routingKey: "order-email",
        queueName: "order-email-queue"
    }
};

export async function consumeAuthEmailMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { exchangeName, routingKey, queueName } =
            exchangeNamesAndRoutingKeys.email;
        await channel.assertExchange(exchangeName, "direct");
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        // consume
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                const appLink = `${CLIENT_URL}`;
                const appIcon = "https://i.ibb.co/Kyp2m0t/cover.png";
                try {
                    const { template, receiverEmail } = JSON.parse(
                        msg!.content.toString()
                    );

                    if (template === "forgotPassword") {
                        const { resetLink, username } = JSON.parse(
                            msg!.content.toString()
                        );

                        const locals: IEmailLocals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            username,
                            resetLink
                        };

                        sendEmail(template, receiverEmail, locals);

                        channel.ack(msg!);
                    } else if (template === "resetPasswordSuccess") {
                        const { username } = JSON.parse(
                            msg!.content.toString()
                        );

                        const locals: IEmailLocals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            username
                        };

                        sendEmail(template, receiverEmail, locals);

                        channel.ack(msg!);
                    } else if (template === "verifyEmail") {
                        const { verifyLink } = JSON.parse(
                            msg!.content.toString()
                        );

                        const locals: IEmailLocals = {
                            appLink: appLink,
                            appIcon: appIcon,
                            verifyLink
                        };

                        sendEmail(template, receiverEmail, locals);

                        channel.ack(msg!);
                    }

                    channel.reject(msg!, false);
                } catch (error) {
                    channel.reject(msg!, false);

                    logger(
                        "queues/email.consumer.ts - consumeAuthEmailMessages()"
                    ).error(
                        "consuming message got errors. consumeAuthEmailMessages() method",
                        error
                    );
                }
            }
        );
    } catch (error) {
        logger("queues/email.consumer.ts - consumeAuthEmailMessages()").error(
            "NotificationService EmailConsumer consumeAuthEmailMessages(): method error:",
            error
        );
    }
}

export async function consumeOrderEmailMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
        }

        const { exchangeName, routingKey, queueName } =
            exchangeNamesAndRoutingKeys.order;
        await channel.assertExchange(exchangeName, "direct");
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        // consume
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                try {
                    const { template } = JSON.parse(msg!.content.toString());

                    if (template === "orderPlaced") {
                        orderPlaceHandler(msg!);
                        channel.ack(msg!);
                        return;
                    } else if (template === "orderDelivered") {
                        orderDeliverHandler(msg!);
                        channel.ack(msg!);
                        return;
                    } else if (template === "orderExtension") {
                        orderExtensionHandler(msg!);
                        channel.ack(msg!);
                        return;
                    } else if (template === "orderExtensionApproval") {
                        orderExtensionApprovalHandler(msg!);
                        channel.ack(msg!);
                        return;
                    }

                    channel.reject(msg!, false);
                } catch (error) {
                    channel.reject(msg!, false);

                    logger(
                        "queues/email.consumer.ts - consumeOrderEmailMessages()"
                    ).error(
                        "consuming message got errors. consumeOrderEmailMessages() method",
                        error
                    );
                }
            }
        );
    } catch (error) {
        logger("queues/email.consumer.ts - consumeOrderEmailMessages()").error(
            "NotificationService EmailConsumer consumeOrderEmailMessages(): method error:",
            error
        );
    }
}

function orderPlaceHandler(msg: ConsumeMessage) {
    try {
        const {
            orderId,
            buyerEmail,
            sellerEmail,
            orderDue,
            amount,
            buyerUsername,
            sellerUsername,
            title,
            description,
            requirements,
            serviceFee,
            total,
            orderUrl
        } = JSON.parse(msg!.content.toString());

        if (!Value.Check(orderPlacedSchema, msg!.content)) {
            throw new Error(
                Value.Errors(orderPlacedSchema, msg!.content).First.toString()
            );
        }

        const locals: IEmailLocals = {
            appLink: `${CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            orderId,
            orderDue,
            amount,
            buyerUsername,
            sellerUsername,
            title,
            description,
            requirements,
            serviceFee,
            total,
            orderUrl
        };

        sendEmail("orderPlaced", sellerEmail, locals);
        sendEmail("orderReceipt", buyerEmail, locals);
    } catch (error) {
        throw error;
    }
}

function orderDeliverHandler(msg: ConsumeMessage) {
    try {
        const {
            orderId,
            buyerUsername,
            sellerUsername,
            title,
            description,
            orderUrl,
            receiverEmail
        } = JSON.parse(msg!.content.toString());

        if (!Value.Check(orderDeliveredSchema, msg!.content)) {
            throw new Error(
                Value.Errors(
                    orderDeliveredSchema,
                    msg!.content
                ).First.toString()
            );
        }

        const locals: IEmailLocals = {
            appLink: `${CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            orderId,
            buyerUsername,
            sellerUsername,
            title,
            description,
            orderUrl
        };

        sendEmail("orderDelivered", receiverEmail, locals);
    } catch (error) {
        throw error;
    }
}

function orderExtensionHandler(msg: ConsumeMessage) {
    try {
        const {
            orderId,
            buyerUsername,
            sellerUsername,
            originalDate,
            newDate,
            reason,
            orderUrl,
            receiverEmail
        } = JSON.parse(msg!.content.toString());

        if (!Value.Check(orderExtensionSchema, msg!.content)) {
            throw new Error(
                Value.Errors(
                    orderExtensionSchema,
                    msg!.content
                ).First.toString()
            );
        }

        const locals: IEmailLocals = {
            appLink: `${CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            orderId,
            buyerUsername,
            sellerUsername,
            originalDate,
            newDate,
            reason,
            orderUrl
        };

        sendEmail("orderExtension", receiverEmail, locals);
    } catch (error) {
        throw error;
    }
}

function orderExtensionApprovalHandler(msg: ConsumeMessage) {
    try {
        const {
            subject,
            buyerUsername,
            sellerUsername,
            type,
            message,
            header,
            orderUrl,
            receiverEmail
        } = JSON.parse(msg!.content.toString());

        if (!Value.Check(orderExtensionApprovalSchema, msg?.content)) {
            throw new Error(
                Value.Errors(
                    orderExtensionApprovalSchema,
                    msg?.content
                ).First.toString()
            );
        }

        const locals: IEmailLocals = {
            appLink: `${CLIENT_URL}`,
            appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
            subject,
            buyerUsername,
            sellerUsername,
            header,
            type,
            message,
            orderUrl
        };

        sendEmail("orderExtensionApproval", receiverEmail, locals);
    } catch (error) {
        throw error;
    }
}

import { exchangeNamesAndRoutingKeys, RABBITMQ_ENDPOINT } from "@order/config";
import { NotificationService } from "@order/services/notification.service";
import { OrderService } from "@order/services/order.service";
import client, { Channel, Connection, ConsumeMessage } from "amqplib";
import { Logger } from "winston";

export class OrderQueue {
    constructor(
        private ch: Channel | null,
        private logger: (moduleName: string) => Logger
    ) {}

    async createConnection(): Promise<Channel> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            );
            this.ch = await connection.createChannel();
            // console.log("Order server connected to queue successfully...");
            this.logger("queues/connection.ts - createConnection()").info(
                "OrderService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "OrderService createConnection() method error:",
                error
            );
            process.exit(1);
        }
    }

    async publishDirectMessage(
        exchangeName: string,
        routingKey: string,
        message: string,
        logMessage: string
    ): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            await this.ch.assertExchange(exchangeName, "direct");

            this.ch.publish(exchangeName, routingKey, Buffer.from(message));
            this.logger(
                "queues/order.producer.ts - publishDireectMessage()"
            ).info(logMessage);
        } catch (error) {
            this.logger(
                "queues/order.producer.ts - publishDireectMessage()"
            ).error(
                "OrderService QueueProducer publishDirectMessage() method error:",
                error
            );
        }
    }

    async consumeReviewFanoutMessage(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { reviewService } = exchangeNamesAndRoutingKeys;
            const queueName = "order-review-queue";

            await this.ch.assertExchange(
                reviewService.review.exchangeName,
                "fanout"
            );

            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            await this.ch.bindQueue(
                jobberQueue.queue,
                reviewService.review.exchangeName,
                ""
            );

            await this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { type } = JSON.parse(msg!.content.toString());
                        if (type === "addReview") {
                            const { gigReview } = JSON.parse(
                                msg!.content.toString()
                            );
                            const notificationSvc = new NotificationService(
                                this.logger
                            );
                            const orderSvc = new OrderService(
                                this,
                                notificationSvc
                            );
                            await orderSvc.updateOrderReview(gigReview);

                            this.ch!.ack(msg!);
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/order.queue.ts - consumeReviewFanoutMessage()"
                        ).error(
                            "consuming message got errors. consumeReviewFanoutMessage()",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/order.queue.ts - consumeReviewFanoutMessage()"
            ).error(
                "OrderService consumeReviewFanoutMessage() method error:",
                error
            );
        }
    }

    closeConnection(channel: Channel, connection: Connection): void {
        process.once("SIGINT", async () => {
            await channel.close();
            await connection.close();
        });
    }
}

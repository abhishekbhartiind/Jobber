import { exchangeNamesAndRoutingKeys, RABBITMQ_ENDPOINT } from "@gig/config";
import { GigService } from "@gig/services/gig.service";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";

export class GigQueue {
    private gigService: GigService;
    constructor(
        private ch: Channel | null,
        private logger: (moduleName: string) => Logger
    ) {
        this.gigService = new GigService(this, logger);
    }

    async createConnection(): Promise<Channel> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            );
            this.ch = await connection.createChannel();
            this.logger("queues/connection.ts - createConnection()").info(
                "GigService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "GigService createConnection() method error:",
                error
            );
            process.exit(1);
        }
    }

    // consume
    async consumeGigDirectMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }
            const { gigService } = exchangeNamesAndRoutingKeys;
            const queueName = "gig-update-queue";

            await this.ch.assertExchange(
                gigService.updateGig.exchangeName,
                "direct"
            );

            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            await this.ch.bindQueue(
                jobberQueue.queue,
                gigService.updateGig.exchangeName,
                gigService.updateGig.routingKey
            );

            await this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { type, gigReview } = JSON.parse(
                            msg!.content.toString()
                        );

                        if (type === "updateGigReview") {
                            await this.gigService.updateGigReview(gigReview);
                            this.ch!.ack(msg!);
                            return;
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/gig.consumer.ts - consumeGigDirectMessages()"
                        ).error(
                            "consuming message got errors. consumeSeedDirectMessages()",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/gig.consumer.ts - consumeGigDirectMessages()"
            ).error(
                "GigService consumeGigDirectMessages() method error:",
                error
            );
        }
    }

    async consumeSeedDirectMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }
            const { gigService } = exchangeNamesAndRoutingKeys;
            const queueName = "seed-gig-queue";

            await this.ch.assertExchange(
                gigService.seed.exchangeName,
                "direct"
            );

            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            await this.ch.bindQueue(
                jobberQueue.queue,
                gigService.seed.exchangeName,
                gigService.seed.routingKey
            );

            await this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { sellers, count } = JSON.parse(
                            msg!.content.toString()
                        );

                        await this.gigService.seedData(sellers, count);

                        this.ch!.ack(msg!);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/gig.consumer.ts - consumeSeedDirectMessages()"
                        ).error(
                            "consuming message go errors. consumeSeedDirectMessages()",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/gig.consumer.ts - consumeSeedDirectMessages()"
            ).error(
                "GigService consumeSeedDirectMessages() method error:",
                error
            );
        }
    }

    //produce
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
            this.logger("queues/gig.producer.ts - publishDirectMessage()").info(
                logMessage
            );
        } catch (error) {
            this.logger(
                "queues/gig.producer.ts - publishDirectMessage()"
            ).error(
                "GigService QueueProducer publishDirectMessage() method error:",
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

import {
    buyerServiceExchangeNamesAndRoutingKeys,
    gigServiceExchangeNamesAndRoutingKeys,
    RABBITMQ_ENDPOINT,
    reviewServiceExchangeNamesAndRoutingKeys
} from "@users/config";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";
import { authBuyerSchema } from "@users/schemas/consumeBuyer.schema";
import { IBuyerDocument } from "@ahgittix/jobber-shared";
import { SellerService } from "@users/services/seller.service";
import { BuyerService } from "@users/services/buyer.service";

import { sellers } from "./seller";

export class UsersQueue {
    private sellerService: SellerService;
    private buyerService: BuyerService;

    constructor(
        private ch: Channel | null,
        private logger: (moduleName: string) => Logger
    ) {
        this.buyerService = new BuyerService(logger);
        this.sellerService = new SellerService(this.buyerService, logger);
    }

    async createConnection(): Promise<Channel> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            );
            this.ch = await connection.createChannel();
            this.logger("queues/connection.ts - createConnection()").info(
                "UsersService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "UsersService createConnection() method error:",
                error
            );
            process.exit(1);
        }
    }

    // producer
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
                "queues/users.producer.ts - publishDirectMessage()"
            ).info(logMessage);
        } catch (error) {
            this.logger(
                "queues/users.producer.ts - publishDirectMessage()"
            ).error(
                "UsersService QueueProducer publishDirectMessage() method error:",
                error
            );
        }
    }

    // consumer
    async consumeBuyerDirectMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName, routingKey } =
                buyerServiceExchangeNamesAndRoutingKeys.buyer;
            const queueName = "user-buyer-queue";

            await this.ch.assertExchange(exchangeName, "direct");

            // if queue not exist it will create new
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            // create path between exchange and queue using routingKey
            await this.ch.bindQueue(
                jobberQueue.queue,
                exchangeName,
                routingKey
            );
            this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { type } = JSON.parse(msg!.content.toString());

                        if (type === "auth") {
                            const {
                                username,
                                email,
                                profilePicture,
                                country,
                                createdAt
                            } = JSON.parse(msg!.content.toString());

                            const { error } = authBuyerSchema.validate({
                                username,
                                email,
                                profilePicture,
                                country,
                                createdAt
                            });
                            if (error?.details) {
                                throw new Error(error.details[0].message);
                            }

                            const buyerData: IBuyerDocument = {
                                username,
                                email,
                                profilePicture,
                                country,
                                purchasedGigs: [],
                                createdAt
                            };

                            await this.buyerService.createBuyer(buyerData);
                            this.ch!.ack(msg!);
                            return;
                        } else if (
                            ["cancel-order", "purchased-gigs"].includes(type)
                        ) {
                            const { buyerId, purchasedGigs } = JSON.parse(
                                msg!.content.toString()
                            );

                            if (!(buyerId || purchasedGigs)) {
                                throw new Error("required field is null");
                            }

                            await this.buyerService.updateBuyerPurchasedGigsProp(
                                buyerId,
                                purchasedGigs,
                                type
                            );
                            this.ch!.ack(msg!);
                            return;
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/users.consumer.ts - consumeBuyerDirectMessages()"
                        ).error(
                            "consuming message got errors. consumeBuyerDirectMessages() error",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/users.consumer.ts - consumeBuyerDirectMessages()"
            ).error(
                "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
                error
            );
        }
    }

    async consumeSellerDirectMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName, routingKey } =
                buyerServiceExchangeNamesAndRoutingKeys.seller;
            const queueName = "user-seller-queue";

            await this.ch.assertExchange(exchangeName, "direct");

            // if queue not exist it will create new
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            // create path between exchange and queue using routingKey
            await this.ch.bindQueue(
                jobberQueue.queue,
                exchangeName,
                routingKey
            );
            this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { type, sellerId } = JSON.parse(
                            msg!.content.toString()
                        );

                        if (type === "create-order") {
                            const { ongoingJobs } = JSON.parse(
                                msg!.content.toString()
                            );
                            await this.sellerService.updateSellerOngoingJobsProp(
                                sellerId,
                                ongoingJobs
                            );
                            this.ch!.ack(msg!);
                            return;
                        } else if (type === "approve-order") {
                            const {
                                ongoingJobs,
                                completedJobs,
                                totalEarnings,
                                recentDelivery
                            } = JSON.parse(msg!.content.toString());
                            await this.sellerService.updateSellerCompletedJobs({
                                sellerId,
                                ongoingJobs,
                                completedJobs,
                                totalEarnings,
                                recentDelivery
                            });
                            this.ch!.ack(msg!);
                            return;
                        } else if (type === "update-gig-count") {
                            const { count } = JSON.parse(
                                msg!.content.toString()
                            );
                            await this.sellerService.updateTotalGigCount(
                                sellerId,
                                Number(count)
                            );
                            this.ch!.ack(msg!);
                            return;
                        } else if (type === "cancel-order") {
                            await this.sellerService.updateSellerCancelJobsProp(
                                sellerId
                            );
                            this.ch!.ack(msg!);
                            return;
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/users.consumers.ts - consumeSellerDirectMessages()"
                        ).error(
                            "consuming message got errors. consumeSellerDirectMessages() error",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/users.consumers.ts - consumeSellerDirectMessages()"
            ).error(
                "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
                error
            );
        }
    }

    async consumeReviewFanoutMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName } =
                reviewServiceExchangeNamesAndRoutingKeys.review;
            const queueName = "seller-review-queue";

            await this.ch.assertExchange(exchangeName, "fanout");

            // if queue not exist it will create new
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            // create path between exchange and queue using routingKey
            // but this is fanout mode so just empty routingKey / dont need routingKey
            await this.ch.bindQueue(jobberQueue.queue, exchangeName, "");
            this.ch.consume(
                jobberQueue.queue,
                async (msg: ConsumeMessage | null) => {
                    try {
                        const { type } = JSON.parse(msg!.content.toString());

                        if (type === "addReview") {
                            const gig =
                                gigServiceExchangeNamesAndRoutingKeys.updateGig;
                            const parsedData = JSON.parse(
                                msg!.content.toString()
                            );

                            if (parsedData.type === "buyer-review") {
                                await this.sellerService.updateSellerReview(
                                    parsedData
                                );
                                await this.publishDirectMessage(
                                    gig.exchangeName,
                                    gig.routingKey,
                                    JSON.stringify({
                                        type: "updateGigReview",
                                        gigReview: parsedData
                                    }),
                                    "Message sent to gig service."
                                );
                            }
                            this.ch!.ack(msg!);
                            return;
                        }

                        this.ch!.reject(msg!, false);
                    } catch (error) {
                        this.ch!.reject(msg!, false);

                        this.logger(
                            "queues/users.consumer.ts - consumeReviewFanoutMessages()"
                        ).error(
                            "consuming message got errors. consumeReviewFanoutMessages()",
                            error
                        );
                    }
                }
            );
        } catch (error) {
            this.logger(
                "queues/users.consumer.ts - consumeReviewFanoutMessages()"
            ).error(
                "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
                error
            );
        }
    }

    async consumeSeedGigDirectMessages(): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            const { exchangeName, routingKey } =
                gigServiceExchangeNamesAndRoutingKeys.getSellers;
            const queueName = "user-gig-queue";

            await this.ch.assertExchange(exchangeName, "direct");

            // if queue not exist it will create new
            const jobberQueue = await this.ch.assertQueue(queueName, {
                durable: true,
                autoDelete: false
            });

            // create path between exchange and queue using routingKey
            await this.ch.bindQueue(
                jobberQueue.queue,
                exchangeName,
                routingKey
            );
            this.ch.consume(
                jobberQueue.queue,
                async (message: ConsumeMessage | null) => {
                    const { type } = JSON.parse(message!.content.toString());

                    if (type === "getSellers") {
                        const { count } = JSON.parse(
                            message!.content.toString()
                        );

                        await this.sellerService.getRandomSellers(
                            parseInt(count)
                        );
                        const seed = gigServiceExchangeNamesAndRoutingKeys.seed;

                        await this.publishDirectMessage(
                            seed.exchangeName,
                            seed.routingKey,
                            JSON.stringify({
                                type: "receiveSellers",
                                sellers,
                                count
                            }),
                            "Message sent to gig service."
                        );
                    }

                    this.ch!.ack(message!);
                }
            );
        } catch (error) {
            this.logger(
                "queues/users.consumer.ts - consumeSeedGigDirectMessages()"
            ).error(
                "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
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

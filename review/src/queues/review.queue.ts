import { RABBITMQ_ENDPOINT } from "@review/config";
import client, { Channel, Connection } from "amqplib";
import { Logger } from "winston";

export class ReviewQueue {
    constructor(
        private ch: Channel | null,
        private logger: (moduleName: string) => Logger
    ) {}

    async createConnection(): Promise<Channel> {
        try {
            const connection: Connection = await client.connect(
                `${RABBITMQ_ENDPOINT}`
            );
            const channel: Channel = await connection.createChannel();
            this.closeConnection(channel, connection);

            this.logger("queues/connection.ts - createConnection()").info(
                "ReviewService connected to RabbitMQ successfully..."
            );

            return channel;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                error
            );
            process.exit(1);
        }
    }

    async publishFanoutMessage(
        exchangeName: string,
        message: string,
        logMessage: string
    ): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            await this.ch.assertExchange(exchangeName, "fanout");

            this.ch.publish(exchangeName, "", Buffer.from(message));
            this.logger(
                "queues/review.producer.ts - publishFanoutMessage()"
            ).info(logMessage);
        } catch (error) {
            this.logger(
                "queues/review.producer.ts - publishFanoutMessage()"
            ).error(error);
        }
    }

    closeConnection(channel: Channel, connection: Connection): void {
        process.once("SIGINT", async () => {
            await channel.close();
            await connection.close();
        });
    }
}

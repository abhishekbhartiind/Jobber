import { RABBITMQ_ENDPOINT } from "@chat/config";
import client, { Connection, Channel } from "amqplib";
import { Logger } from "winston";

export class ChatQueue {
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
            this.logger("queues/connection.ts - createConnection()").info(
                "ChatService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "ChatService createConnection() method error:",
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
                "queues/chat.producer.ts - publishDirectMessage()"
            ).info(logMessage);
        } catch (error) {
            this.logger(
                "queues/chat.producer.ts - publishDirectMessage()"
            ).error(
                "ChatService QueueProducer publishDirectMessage() method error:",
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

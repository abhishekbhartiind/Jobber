import { RABBITMQ_ENDPOINT } from "@auth/config";
import client, { Connection, Channel } from "amqplib";
import { Logger } from "winston";

export class AuthQueue {
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
                "AuthService connected to RabbitMQ successfully..."
            );
            this.closeConnection(this.ch, connection);

            return this.ch;
        } catch (error) {
            this.logger("queues/connection.ts - createConnection()").error(
                "AuthService createConnection() method error:",
                error
            );
            process.exit(1);
        }
    }

    // producer
    async publishDirectMessage(
        exchangeName: string,
        routingKey: string,
        message: string, // Stringify first before send to this function
        logMessage: string
    ): Promise<void> {
        try {
            if (!this.ch) {
                this.ch = await this.createConnection();
            }

            await this.ch.assertExchange(exchangeName, "direct");
            this.ch.publish(exchangeName, routingKey, Buffer.from(message));

            this.logger(
                "queues/auth.producer.ts - publishDirectMessage()"
            ).info(logMessage);
        } catch (error) {
            this.logger(
                "queues/auth.producer.ts - publishDirectMessage()"
            ).error(
                "AuthService Provider publishDirectMessage() method error:",
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

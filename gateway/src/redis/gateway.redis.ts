import { createClient, RedisClientType } from "redis";
import { REDIS_HOST } from "@gateway/config";
import { Logger } from "winston";

export class RedisClient {
    private client: RedisClientType;

    constructor(private logger: (moduleName: string) => Logger) {
        this.client = createClient({ url: `${REDIS_HOST}` });
    }

    async redisConnect(): Promise<void> {
        try {
            await this.client.connect();
            this.logger("redis/redis.connection.ts - redisConnect()").info(
                `GatewayService Redis Connected: ${this.client.isReady}`
            );
            this.catchError();
            this.closeConnection(this.client);
        } catch (error) {
            this.logger("redis/redis.connection.ts - redisConnect()").error(
                "GatewayService redisConnect() method error:",
                error
            );
        }
    }

    private async reconnectingClient(): Promise<void> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    public async saveUserSelectedCategory(
        key: string,
        value: string
    ): Promise<void> {
        try {
            await this.reconnectingClient();

            await this.client.SET(key, value);
        } catch (error) {
            this.logger(
                "redis/gateway.cache.ts - saveUserSelectedCategory()"
            ).error(
                "GatewayService Redis Cache saveUserSelectedCategory() method error:",
                error
            );
        }
    }

    public async saveLoggedInUserToCache(
        key: string,
        value: string
    ): Promise<string[]> {
        try {
            await this.reconnectingClient();

            const index: number | null = await this.client.LPOS(key, value);
            if (index === null) {
                await this.client.LPUSH(key, value);
                this.logger(
                    "redis/gateway.cache.ts - saveLoggedInUserToCache()"
                ).info(`User ${value} added to Gateway Redis Cache`);
            }

            const result: string[] = await this.client.LRANGE(key, 0, -1);

            return result;
        } catch (error) {
            this.logger(
                "redis/gateway.cache.ts - saveLoggedInUserToCache()"
            ).error(
                "GatewayService Redis Cache saveLoggedInUserToCache() method error:",
                error
            );
            return [];
        }
    }

    public async getLoggedInUsersFromCache(key: string): Promise<string[]> {
        try {
            await this.reconnectingClient();

            const result: string[] = await this.client.LRANGE(key, 0, -1);

            return result;
        } catch (error) {
            this.logger(
                "redis/gateway.cache.ts - getLoggedInUsersFromCache()"
            ).error(
                "GatewayService Redis Cache getLoggedInUsersFromCache() method error:",
                error
            );
            return [];
        }
    }

    public async removeLoggedInUserFromCache(
        key: string,
        value: string
    ): Promise<string[]> {
        try {
            await this.reconnectingClient();

            await this.client.LREM(key, 1, value);

            this.logger(
                "redis/gateway.cache.ts - removeLoggedInUserFromCache()"
            ).info(`User ${value} remove from Gateway Redis Cache`);

            const result: string[] = await this.client.LRANGE(key, 0, -1);

            return result;
        } catch (error) {
            this.logger(
                "redis/gateway.cache.ts - removeLoggedInUserFromCache()"
            ).error(
                "GatewayService Redis Cache removeLoggedInUserFromCache() method error:",
                error
            );
            return [];
        }
    }

    private catchError(): void {
        this.client.on("error", (error: unknown) => {
            this.logger("redis/redis.connection.ts - catchError()").error(
                error
            );
        });
    }

    closeConnection(redis: RedisClientType): void {
        process.once("exit", async () => {
            await redis.quit();
        });
    }
}

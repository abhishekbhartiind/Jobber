import { REDIS_HOST } from "@gig/config";
import { createClient } from "redis";
import { Logger } from "winston";

export class GigRedis {
    private redisClient: ReturnType<typeof createClient>;
    constructor(private logger: (moduleName: string) => Logger) {
        this.redisClient = createClient({
            url: `${REDIS_HOST}`,
            isolationPoolOptions: {
                max: 100,
                idleTimeoutMillis: 10_000
            }
        });
    }

    async redisConnect(): Promise<void> {
        try {
            await this.redisClient.connect();
            if (this.redisClient.isReady) {
                this.logger("redis/redis.connection() - redisConnect()").info(
                    `GigService Redis Connected: ${this.redisClient.isReady}`
                );
            }
            this.catchError();
        } catch (error) {
            this.logger("redis/redis.connection() - redisConnect()").error(
                "GigService redisConnect() method error:",
                error
            );
        }
    }

    async getUserSelectedGigCategory(key: string): Promise<string> {
        try {
            if (!this.redisClient.isOpen) {
                await this.redisConnect();
            }

            const response = (await this.redisClient.GET(key)) ?? "";

            return response;
        } catch (error) {
            this.logger(
                "redis/gig.cache.ts - getUserSelectedGigCategory()"
            ).error(
                "GigService GigCache getUserSelectedGigCategory() method error:",
                (error as Error).message
            );
            return "";
        }
    }

    catchError(): void {
        this.redisClient.on("error", (error: unknown) => {
            this.logger("redis/redis.connection() - redisConnect()").error(
                error
            );
        });
    }
}

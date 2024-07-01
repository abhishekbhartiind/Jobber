import { GatewayServer } from "@gateway/server";
import { Logger } from "winston";
import { winstonLogger } from "@ahgittix/jobber-shared";
import { Hono } from "hono";

import { ELASTIC_SEARCH_URL } from "./config";
import { ElasticSearchClient } from "./elasticsearch";
import { RedisClient } from "./redis/gateway.redis";

class Application {
    private logger: (moduleName: string) => Logger;
    private elastic: ElasticSearchClient;
    private redis: RedisClient;
    constructor() {
        this.logger = (moduleName?: string) =>
            winstonLogger(
                `${ELASTIC_SEARCH_URL}`,
                moduleName ?? "Gateway Service",
                "debug"
            );
        this.elastic = new ElasticSearchClient(this.logger);
        this.redis = new RedisClient(this.logger);
    }
    public main(): void {
        const app = new Hono();
        const server = new GatewayServer(app);
        this.redis.redisConnect();
        server.start(this.elastic, this.redis, this.logger);
    }
}

const application = new Application();
application.main();

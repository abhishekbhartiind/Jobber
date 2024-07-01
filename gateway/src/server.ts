import http from "http";

import {
    CLIENT_URL,
    PORT,
    REDIS_HOST
} from "@gateway/config";
import { CustomError } from "@ahgittix/jobber-shared";
import { StatusCodes } from "http-status-codes";
import { ElasticSearchClient } from "@gateway/elasticsearch";
import { appRoutes } from "@gateway/routes";
import { axiosAuthInstance } from "@gateway/services/api/auth.api.service";
import { isAxiosError } from "axios";
import { axiosBuyerInstance } from "@gateway/services/api/buyer.api.service";
import { axiosSellerInstance } from "@gateway/services/api/seller.api.service";
import { axiosGigInstance } from "@gateway/services/api/gig.api.service";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { SocketIOAppHandler } from "@gateway/sockets/socket";
import { axiosChatInstance } from "@gateway/services/api/chat.api.service";
import { axiosOrderInstance } from "@gateway/services/api/order.api.service";
import { axiosReviewInstance } from "@gateway/services/api/review.api.service";
import { createClient } from "redis";
import { Logger } from "winston";
import { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { timeout } from "hono/timeout";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { rateLimiter } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";
import { StatusCode } from "hono/utils/http-status";
import { ServerType } from "@hono/node-server/dist/types";
import { serve } from "@hono/node-server";

import { RedisClient } from "./redis/gateway.redis";

const DEFAULT_ERROR_CODE = 500;
export let socketIO: Server;
const LIMIT_TIMEOUT = 2 * 1000 + 500; // 2s

export class GatewayServer {
    private app: Hono;

    constructor(app: Hono) {
        this.app = app;
    }

    public start(
        elastic: ElasticSearchClient,
        redis: RedisClient,
        logger: (moduleName: string) => Logger
    ): void {
        this.startElasticSearch(elastic);
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routesMiddleware(this.app, redis);
        this.errorHandler(this.app, logger);
        this.startServer(this.app, redis, logger);
    }

    private securityMiddleware(app: Hono): void {
        app.use(
            timeout(LIMIT_TIMEOUT, () => {
                return new HTTPException(StatusCodes.REQUEST_TIMEOUT, {
                    message: `Request timeout after waiting ${LIMIT_TIMEOUT}ms. Please try again later.`
                });
            })
        );
        app.use(secureHeaders());
        app.use(
            csrf({
                origin: [
                    `${CLIENT_URL}`,
                ]
            })
        );
        app.use(
            cors({
                origin: [
                    `${CLIENT_URL}`,
                ],
                credentials: true,
                allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            })
        );
        app.use(async (c: Context, next: Next) => {
            const token = getCookie(c, "session");
            if (token) {
                axiosAuthInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosBuyerInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosSellerInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosGigInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosChatInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosOrderInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
                axiosReviewInstance.defaults.headers["Authorization"] =
                    `Bearer ${token}`;
            }

            await next();
        });
    }

    private standardMiddleware(app: Hono): void {
        app.use(compress());
        app.use(
            bodyLimit({
                maxSize: 2 * 100 * 1000 * 1024, //200mb
                onError(c: Context) {
                    return c.text(
                        "Your request is too big",
                        StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE
                    );
                }
            })
        );

        const generateRandomNumber = (length: number): number => {
            return (
                Math.floor(Math.random() * (9 * Math.pow(10, length - 1))) +
                Math.pow(10, length - 1)
            );
        };

        app.use(
            rateLimiter({
                windowMs: 1 * 60 * 1000, //60s
                limit: 10,
                standardHeaders: "draft-6",
                keyGenerator: () => generateRandomNumber(12).toString()
            })
        );
    }

    private routesMiddleware(app: Hono, redis: RedisClient): void {
        appRoutes(app, redis);
    }

    private startElasticSearch(elastic: ElasticSearchClient): void {
        elastic.checkConnection();
    }

    private errorHandler(
        app: Hono,
        logger: (moduleName: string) => Logger
    ): void {
        app.notFound((c) => {
            return c.text("Route path is not found", StatusCodes.NOT_FOUND);
        });

        app.onError((err: Error, c: Context) => {
            if (err instanceof CustomError) {
                logger("server.ts - errorHandler()").error(
                    `GatewayService ${err.comingFrom}:`,
                    err
                );
                return c.json(
                    err.serializeErrors(),
                    (err.statusCode as StatusCode) ??
                        StatusCodes.INTERNAL_SERVER_ERROR
                );
            } else if (err instanceof HTTPException) {
                return err.getResponse();
            } else if (isAxiosError(err)) {
                logger("server.ts - errorHandler()").error(
                    `GatewayService Axios Error - ${err?.response?.data?.comingFrom}:`,
                    err.message
                );
                return c.json(
                    {
                        message:
                            err?.response?.data?.message ?? "Error occurred."
                    },
                    err?.response?.data?.statusCode ?? DEFAULT_ERROR_CODE
                );
            }

            return c.text(
                "Unexpected error occured. Please try again",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        });
    }

    private async startServer(
        app: Hono,
        redis: RedisClient,
        logger: (moduleName: string) => Logger
    ): Promise<void> {
        try {
            const server = this.startHttpServer(app, logger);
            const io: Server = await this.createSocketIO(
                server as http.Server,
                logger
            );
            this.socketIOConnections(io, redis, logger);
        } catch (error) {
            logger("server.ts - startServer()").error(
                "GatewayService startServer() method error:",
                error
            );
        }
    }

    private async createSocketIO(
        httpServer: http.Server,
        logger: (moduleName: string) => Logger
    ): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: [`${CLIENT_URL}`],
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            }
        });
        const pubClient = createClient({ url: `${REDIS_HOST}` });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));

        logger("server.ts - createSocketIO()").info(
            "GatewayService SocketIO and Redis Pub-Sub Adapter is established."
        );
        socketIO = io;
        return io;
    }

    private startHttpServer(
        hono: Hono,
        logger: (moduleName: string) => Logger
    ): ServerType {
        try {
            logger("server.ts - startHttpServer()").info(
                `GatewayService has started with pid ${process.pid}`
            );

            const server = serve(
                {
                    fetch: hono.fetch,
                    port: Number(PORT),
                    createServer: http.createServer
                },
                (info) => {
                    logger("server.ts - startHttpServer()").info(
                        `GatewayService running on port ${info.port}`
                    );
                }
            );

            return server;
        } catch (error) {
            logger("server.ts - startHttpServer()").error(
                "GatewayService startServer() method error:",
                error
            );

            process.exit(1);
        }
    }

    private socketIOConnections(
        io: Server,
        redis: RedisClient,
        logger: (moduleName: string) => Logger
    ): void {
        const socketIoApp = new SocketIOAppHandler(io, redis, logger);

        socketIoApp.listen();
    }
}

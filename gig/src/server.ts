import http from "http";
import "express-async-errors";

import compression from "compression";
import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    IErrorResponse
} from "@ahgittix/jobber-shared";
import { API_GATEWAY_URL, JWT_TOKEN, PORT } from "@gig/config";
import {
    Application,
    NextFunction,
    Request,
    Response,
    json,
    urlencoded
} from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { ElasticSearchClient } from "@gig/elasticsearch";
import { appRoutes } from "@gig/routes";
import { Channel } from "amqplib";
import { Logger } from "winston";
import { GigQueue } from "./queues/gig.queue";

export let gigChannel: Channel;

export async function start(
    app: Application,
    logger: (moduleName: string) => Logger
): Promise<void> {
    const queue = await startQueues(logger);
    const elastic = await startElasticSearch(logger);
    securityMiddleware(app);
    standardMiddleware(app);
    gigErrorHandler(app, logger);
    routesMiddleware(app, queue, elastic, logger);
    startServer(app, logger);
}

function securityMiddleware(app: Application): void {
    app.set("trust proxy", 1);
    app.use(hpp());
    app.use(helmet());
    app.use(
        cors({
            origin: [`${API_GATEWAY_URL}`],
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        })
    );

    app.use((req: Request, _res: Response, next: NextFunction) => {
        // console.logger(req.headers);
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            const payload = jwt.verify(token, JWT_TOKEN!) as IAuthPayload;

            req.currentUser = payload;
        }
        next();
    });
}

function standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: "200mb" }));
    app.use(urlencoded({ extended: true, limit: "200mb" }));
}

function routesMiddleware(app: Application, queue: GigQueue, elastic: ElasticSearchClient, logger: (moduleName: string) => Logger): void {
    appRoutes(app, queue, elastic, logger);
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<GigQueue> {
    const queue = new GigQueue(null, logger);
    await queue.createConnection();
    queue.consumeGigDirectMessages();
    queue.consumeSeedDirectMessages();

    return queue
}

export async function startElasticSearch(
    logger: (moduleName: string) => Logger
): Promise<ElasticSearchClient> {
    const elastic = new ElasticSearchClient(logger);
    await elastic.checkConnection();
    elastic.createIndex("gigs");

    return elastic;
}

function gigErrorHandler(
    app: Application,
    logger: (moduleName: string) => Logger
): void {
    app.use(
        (
            error: IErrorResponse,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            logger("server.ts - gigErrorHandler()").error(
                `GigService ${error.comingFrom}:`,
                error
            );

            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        }
    );
}

function startServer(
    app: Application,
    logger: (moduleName: string) => Logger
): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        logger("server.ts - startServer()").info(
            `GigService has started with pid ${process.pid}`
        );

        httpServer.listen(Number(PORT), () => {
            logger("server.ts - startServer()").info(
                `GigService running on port ${PORT}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "GigService startServer() method error:",
            error
        );
    }
}

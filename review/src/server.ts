import http from "http";
import "express-async-errors";

import compression from "compression";
import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    IErrorResponse
} from "@ahgittix/jobber-shared";
import { API_GATEWAY_URL, JWT_TOKEN, PORT } from "@review/config";
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
import { appRoutes } from "@review/routes";
import { StatusCodes } from "http-status-codes";
import { PoolClient } from "pg";
import { Logger } from "winston";

import { ElasticSearchClient } from "./elasticsearch";
import { ReviewQueue } from "./queues/review.queue";

export async function start(
    app: Application,
    db: PoolClient,
    logger: (moduleName: string) => Logger
): Promise<void> {
    const reviewQueue = await startQueues(logger);
    startElasticSearch(logger);
    standardMiddleware(app);
    securityMiddleware(app);
    reviewErrorHandler(app);
    routesMiddleware(app, db, reviewQueue, logger);
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
        // console.log(req.headers);
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

function routesMiddleware(
    app: Application,
    db: PoolClient,
    queue: ReviewQueue,
    logger: (moduleName: string) => Logger
): void {
    appRoutes(app, db, queue, logger);
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<ReviewQueue> {
    const reviewQueue = new ReviewQueue(null, logger);
    await reviewQueue.createConnection();
    return reviewQueue;
}

function startElasticSearch(logger: (moduleName: string) => Logger): void {
    const elasticClient = new ElasticSearchClient(logger);
    elasticClient.checkConnection();
}

function reviewErrorHandler(app: Application): void {
    app.use(
        (
            error: IErrorResponse,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            if (error instanceof CustomError) {
                res.status(
                    error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
                ).json(error.serializeErrors());
            }

            next();
        }
    );
}

async function startServer(
    app: Application,
    logger: (moduleName: string) => Logger
): Promise<void> {
    try {
        const httpServer: http.Server = new http.Server(app);
        logger("server.ts - startServer()").info(
            `ReviewService has started with pid: ${process.pid}`
        );

        httpServer.listen(Number(PORT), () => {
            logger("server.ts - startServer()").info(
                `ReviewService running on port ${PORT}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "ReviewService startServer() method error:",
            error
        );
    }
}

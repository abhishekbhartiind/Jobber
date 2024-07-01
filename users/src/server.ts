import http from "http";
import "express-async-errors";

import compression from "compression";
import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    IErrorResponse
} from "@ahgittix/jobber-shared";
import { API_GATEWAY_URL, JWT_TOKEN, PORT } from "@users/config";
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
import { appRoutes } from "@users/routes";
import { Logger } from "winston";

import { UsersQueue } from "./queues/users.queue";
import { ElasticSearchClient } from "./elasticsearch";

export async function start(
    app: Application,
    logger: (moduleName: string) => Logger
): Promise<void> {
    await startQueues(logger);
    startElasticSearch(logger);
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app, logger);
    usersErrorHandler(app, logger);
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
    logger: (moduleName: string) => Logger
): void {
    appRoutes(app, logger);
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<UsersQueue> {
    const queue = new UsersQueue(null, logger);
    await queue.createConnection();
    queue.consumeBuyerDirectMessages();
    queue.consumeSellerDirectMessages();
    queue.consumeReviewFanoutMessages();
    queue.consumeSeedGigDirectMessages();

    return queue;
}

async function startElasticSearch(
    logger: (moduleName: string) => Logger
): Promise<void> {
    const elastic = new ElasticSearchClient(logger);
    await elastic.checkConnection();
}

function usersErrorHandler(
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
            logger("server.ts - usersErrorHandler()").error(
                `UsersService ${error.comingFrom}:`,
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
            `UsersService has started with pid ${process.pid}`
        );
        httpServer.listen(Number(PORT), () => {
            logger("server.ts - startServer()").info(
                `UsersService running on port ${PORT}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "UsersService startServer() method error:",
            error
        );
    }
}

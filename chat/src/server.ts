import http from "http";
import "express-async-errors";

import compression from "compression";
import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    IErrorResponse
} from "@ahgittix/jobber-shared";
import { API_GATEWAY_URL, JWT_TOKEN, PORT } from "@chat/config";
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
import { ElasicSearchClient } from "@chat/elasticsearch";
import { appRoutes } from "@chat/routes";
import { Server, Socket } from "socket.io";
import { Logger } from "winston";

import { ChatQueue } from "./queues/chat.queue";

export let socketIOChatObject: Server;

export async function start(
    app: Application,
    logger: (moduleName: string) => Logger
): Promise<void> {
    const queue = await startQueues(logger);
    await startElasticSearch(logger);
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app, queue, logger);
    chatErrorHandler(app, logger);
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
    queue: ChatQueue,
    logger: (moduleName: string) => Logger
): void {
    appRoutes(app, queue, logger);
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<ChatQueue> {
    const queue = new ChatQueue(null, logger);
    await queue.createConnection();
    return queue;
}

async function startElasticSearch(
    logger: (moduleName: string) => Logger
): Promise<void> {
    const elastic = new ElasicSearchClient(logger);
    await elastic.checkConnection();
}

function chatErrorHandler(
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
            logger("server.ts - chatErrorHandler()").error(
                `ChatService ${error.comingFrom}:`,
                error
            );

            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error.serializeErrors());
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
        socketIOChatObject = await createSocketIO(httpServer, logger);

        startHttpServer(httpServer, logger);

        socketIOChatObject.on("connection", (socket: Socket) => {
            logger("server.ts - startServer()").info(
                `Socket receive a connection with id: ${socket.id}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "ChatService startServer() method error:",
            error
        );
    }
}

async function createSocketIO(
    httpServer: http.Server,
    logger: (moduleName: string) => Logger
): Promise<Server> {
    const io: Server = new Server(httpServer, {
        cors: {
            origin: ["*"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    });

    logger("server.ts - createSocketIO()").info("ChatService Socket connected");

    return io;
}

function startHttpServer(
    httpServer: http.Server,
    logger: (moduleName: string) => Logger
): void {
    try {
        logger("server.ts - startHttpServer()").info(
            `ChatService has started with pid ${process.pid}`
        );

        httpServer.listen(Number(PORT), () => {
            logger("server.ts - startHttpServer()").info(
                `ChatService running on port ${PORT}`
            );
        });
    } catch (error) {
        logger("server.ts - startHttpServer()").error(
            "ChatService startHttpServer() method error:",
            error
        );
    }
}

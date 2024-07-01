import { Application } from "express";
import { healthRoutes } from "@chat/routes/health.route";
import { chatRoutes } from "@chat/routes/chat.route";
import { verifyGatewayRequest } from "@ahgittix/jobber-shared";
import { Logger } from "winston";

import { ChatQueue } from "./queues/chat.queue";
import { ChatService } from "./services/chat.service";
import { ChatController } from "./controllers/chat.controller";

const BASE_PATH = "/api/v1/message";

export function appRoutes(
    app: Application,
    queue: ChatQueue,
    logger: (moduleName: string) => Logger
): void {
    const chatSvc = new ChatService(logger, queue);
    const chatController = new ChatController(chatSvc);
    app.use("", healthRoutes());
    app.use(BASE_PATH, verifyGatewayRequest, chatRoutes(chatController));
}

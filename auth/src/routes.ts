import { Application } from "express";
import { authRoutes } from "@auth/routes/auth.route";
import { healthRoutes } from "@auth/routes/health.route";
import { searchRoutes } from "@auth/routes/search.route";
import { seedRoutes } from "@auth/routes/seed.route";
import { verifyGatewayRequest } from "@ahgittix/jobber-shared";
import { Logger } from "winston";

import { AuthQueue } from "./queues/auth.queue";
import { AuthService } from "./services/auth.service";
import { UnauthSearchService } from "./services/search.service";
import { ElasticSearchClient } from "./elasticsearch";
import { AuthController } from "./controllers/auth.controller";

const BASE_PATH = "/api/v1/auth";

export function appRoutes(
    app: Application,
    queue: AuthQueue,
    elastic: ElasticSearchClient,
    logger: (moduleName: string) => Logger
): void {
    const authSvc = new AuthService(queue, logger);
    const unauthSvc = new UnauthSearchService(elastic, logger);
    const authController = new AuthController(queue, authSvc, unauthSvc);
    app.use("", healthRoutes());
    app.use(BASE_PATH, seedRoutes(authController));
    app.use(BASE_PATH, searchRoutes(authController));

    app.use(BASE_PATH, verifyGatewayRequest, authRoutes(authController));
}

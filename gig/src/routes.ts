import { verifyGatewayRequest } from "@ahgittix/jobber-shared";
import { Application } from "express";
import { gigRoutes } from "@gig/routes/gig.route";
import { healthRoutes } from "@gig/routes/health.route";
import { GigQueue } from "./queues/gig.queue";
import { Logger } from "winston";
import { GigService } from "./services/gig.service";
import { GigController } from "./controllers/gig.controller";
import { ElasticSearchClient } from "./elasticsearch";

const BASE_PATH = "/api/v1/gig";

export function appRoutes(app: Application, queue: GigQueue, elastic: ElasticSearchClient, logger: (moduleName: string) => Logger): void {
    const gigSvc = new GigService(queue, logger);
    const gigController = new GigController(gigSvc, elastic, queue, logger);
    app.use("", healthRoutes());
    app.use(BASE_PATH, verifyGatewayRequest, gigRoutes(gigController));
    // app.use(BASE_PATH, gigRoutes());
}

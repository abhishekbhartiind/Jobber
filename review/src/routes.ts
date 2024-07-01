import { Application } from "express";
import { healthRoutes } from "@review/routes/health.route";
import { reviewRoutes } from "@review/routes/review.route";
// import { verifyGatewayRequest } from "@ahgittix/jobber-shared";

import { ReviewController } from "@review/controllers/review.controller";
import { Logger } from "winston";
import { ReviewService } from "@review/services/review.service";
import { PoolClient } from "pg";
import { ReviewQueue } from "@review/queues/review.queue";

const BASE_PATH = "/api/v1/review";

export function appRoutes(
    app: Application,
    db: PoolClient,
    queue: ReviewQueue,
    logger: (moduleName: string) => Logger
): void {
    const reviewService = new ReviewService(db, logger);
    const reviewController = new ReviewController(reviewService, queue);
    app.use("", healthRoutes());
    // app.use(BASE_PATH, verifyGatewayRequest, reviewRoutes(reviewController));
    app.use(BASE_PATH, reviewRoutes(reviewController));
}

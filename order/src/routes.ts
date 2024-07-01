import { Application } from "express";
import { healthRoutes } from "@order/routes/health.route";
import { orderRoutes } from "@order/routes/order.route";
import { notificationRoutes } from "@order/routes/notification.route";
import { verifyGatewayRequest } from "@ahgittix/jobber-shared";
import { Logger } from "winston";

import { NotificationService } from "./services/notification.service";
import { OrderService } from "./services/order.service";
import { OrderQueue } from "./queues/order.queue";
import { OrderController } from "./controllers/order.controller";

const BASE_PATH = "/api/v1/order";

export function appRoutes(
    app: Application,
    queue: OrderQueue,
    logger: (moduleName: string) => Logger
): void {
    const notificationSvc = new NotificationService(logger);
    const orderSvc = new OrderService(queue, notificationSvc);
    const orderController = new OrderController(orderSvc, notificationSvc);
    app.use("", healthRoutes());

    app.use(BASE_PATH, verifyGatewayRequest, orderRoutes(orderController));
    app.use(
        BASE_PATH,
        verifyGatewayRequest,
        notificationRoutes(orderController)
    );
}

import { OrderController } from "@order/controllers/order.controller";
import express, { Router } from "express";

const router = express.Router();

export function notificationRoutes(controller: OrderController): Router {
    router.get(
        "/notifications/:userToName",
        controller.findNotificationsByUserTo.bind(controller)
    );
    router.put(
        "/notification/mark-as-read",
        controller.updateNotificationReadStatus.bind(controller)
    );

    return router;
}

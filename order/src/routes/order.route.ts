import { OrderController } from "@order/controllers/order.controller";
import express, { Router } from "express";

const router = express.Router();

export function orderRoutes(controller: OrderController): Router {
    router.get("/:orderId", controller.getOrderbyOrderId.bind(controller));
    router.get(
        "/buyer/:buyerId",
        controller.getOrdersbyBuyerId.bind(controller)
    );
    router.get(
        "/seller/:sellerId",
        controller.getOrdersbySellerId.bind(controller)
    );

    router.post("/", controller.createOrder.bind(controller));
    router.post(
        "/create-payment-intent",
        controller.createOrderIntent.bind(controller)
    );

    router.put(
        "/approve-order/:orderId",
        controller.buyerApproveOrder.bind(controller)
    );
    router.put("/cancel/:orderId", controller.cancelOrder.bind(controller));
    router.put(
        "/gig/:type/:orderId",
        controller.updateDeliveryDate.bind(controller)
    );
    router.put(
        "/extension/:orderId",
        controller.sellerRequestExtension.bind(controller)
    );
    router.put(
        "/deliver-order/:orderId",
        controller.sellerDeliverOrder.bind(controller)
    );

    return router;
}

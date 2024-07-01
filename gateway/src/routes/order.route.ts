import { authMiddleware } from "@gateway/services/auth-middleware";
import { OrderHandler } from "@gateway/handler/order.handler";
import { BASE_PATH } from "@gateway/routes";
import { Context, Hono } from "hono";
import { StatusCodes } from "http-status-codes";

export function orderRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>
): void {
    const orderHndlr = new OrderHandler();
    api.use("/order", authMiddleware.verifyAuth);

    api.get("/order/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const { message, order } = await orderHndlr.getOrderByOrderId(orderId);

        return c.json({ message, order }, StatusCodes.OK);
    });
    api.get("/order/seller/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const { message, orders } = await orderHndlr.getSellerOrders(orderId);

        return c.json({ message, orders }, StatusCodes.OK);
    });
    api.get("/order/buyer/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const { message, orders } = await orderHndlr.getBuyerOrders(orderId);

        return c.json({ message, orders }, StatusCodes.OK);
    });
    api.get("/order/notification/:userTo", async (c: Context) => {
        const userTo = c.req.param("userTo");
        const { message, notifications } =
            await orderHndlr.getNotifications(userTo);

        return c.json({ message, notifications }, StatusCodes.OK);
    });

    api.post("/order/create-payment-intent", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, clientSecret, paymentIntentId } =
            await orderHndlr.createOrderIntent(jsonBody);

        return c.json(
            { message, clientSecret, paymentIntentId },
            StatusCodes.OK
        );
    });
    api.post("/order", authMiddleware.verifyAuth, async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, order } = await orderHndlr.buyerCreateOrder(jsonBody);

        return c.json({ message, order }, StatusCodes.CREATED);
    });

    api.put("/order/approve-order/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const jsonBody = await c.req.json();
        const { message, order } = await orderHndlr.buyerApproveOrder(
            orderId,
            jsonBody
        );

        return c.json({ message, order }, StatusCodes.OK);
    });
    api.put("/order/cancel/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const jsonBody = await c.req.json();
        const { message } = await orderHndlr.sellerCancelOrder(
            orderId,
            jsonBody
        );

        return c.json({ message }, StatusCodes.OK);
    });
    api.put("/order/gig/:type/:orderId", async (c: Context) => {
        const { type, orderId } = c.req.param();
        const jsonBody = await c.req.json();
        const { message, order } = await orderHndlr.updateDeliveryDate(
            type,
            orderId,
            jsonBody
        );

        return c.json({ message, order }, StatusCodes.OK);
    });
    api.put("/order/extension/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const jsonBody = await c.req.json();
        const { message, order } =
            await orderHndlr.sellerRequestDeliveryDateExtension(
                orderId,
                jsonBody
            );

        return c.json({ message, order }, StatusCodes.OK);
    });
    api.put("/order/deliver-order/:orderId", async (c: Context) => {
        const orderId = c.req.param("orderId");
        const jsonBody = await c.req.json();
        const { message, order } = await orderHndlr.sellerDeliverOrder(
            orderId,
            jsonBody
        );

        return c.json({ message, order }, StatusCodes.OK);
    });
    api.put("/order/notification/:notificationId", async (c: Context) => {
        const notificationId = c.req.param("notificationId");
        const { message, notification } =
            await orderHndlr.markNotificationAsRead(notificationId);

        return c.json({ message, notification }, StatusCodes.OK);
    });
}

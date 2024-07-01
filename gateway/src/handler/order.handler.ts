import { orderService } from "@gateway/services/api/order.api.service";

export class OrderHandler {
    public async getOrderByOrderId(
        orderId: string
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.getOrderByOrderId(orderId);

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async getSellerOrders(
        orderId: string
    ): Promise<{ message: string; orders: any }> {
        const response = await orderService.getOrdersBySellerId(orderId);

        return {
            message: response.data.message,
            orders: response.data.orders
        };
    }

    public async getBuyerOrders(
        orderId: string
    ): Promise<{ message: string; orders: any }> {
        const response = await orderService.getOrdersByBuyerId(orderId);

        return {
            message: response.data.message,
            orders: response.data.orders
        };
    }

    public async getNotifications(
        userTo: string
    ): Promise<{ message: string; notifications: any }> {
        const response = await orderService.getNotifications(userTo);

        return {
            message: response.data.message,
            notifications: response.data.notifications
        };
    }
    public async createOrderIntent(reqBody: any): Promise<{
        message: string;
        clientSecret: string;
        paymentIntentId: string;
    }> {
        const response = await orderService.createOrderIntent(
            reqBody.buyerId,
            reqBody.price
        );

        return {
            message: response.data.message,
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.paymentIntentId
        };
    }

    public async buyerCreateOrder(
        reqBody: any
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.createOrder(reqBody);

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async sellerCancelOrder(
        orderId: string,
        reqBody: any
    ): Promise<{ message: string }> {
        const response = await orderService.cancelOrder(
            orderId,
            reqBody.orderData,
            reqBody.paymentIntentId
        );

        return {
            message: response.data.message
        };
    }

    public async sellerRequestDeliveryDateExtension(
        orderId: string,
        reqBody: any
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.requestDeliveryDateExtension(
            orderId,
            reqBody
        );

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async updateDeliveryDate(
        type: string,
        orderId: string,
        reqBody: any
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.updateDeliveryDate(
            type,
            orderId,
            reqBody
        );

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async buyerApproveOrder(
        orderId: string,
        reqBody: any
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.approveOrder(orderId, reqBody);

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async sellerDeliverOrder(
        orderId: string,
        reqBody: any
    ): Promise<{ message: string; order: any }> {
        const response = await orderService.deliverOrder(orderId, reqBody);

        return {
            message: response.data.message,
            order: response.data.order
        };
    }

    public async markNotificationAsRead(
        notificationId: string
    ): Promise<{ message: string; notification: any }> {
        const response =
            await orderService.markNotificationAsRead(notificationId);

        return {
            message: response.data.message,
            notification: response.data.notification
        };
    }
}

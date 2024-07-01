import {
    CustomError,
    IOrderDocument,
    IOrderNotifcation,
    NotFoundError
} from "@ahgittix/jobber-shared";
import { OrderModel } from "@order/models/order.model";
import { OrderNotificationModel } from "@order/models/orderNotification.model";
import { socketIOOrderObject } from "@order/server";
import { isValidObjectId } from "mongoose";
import { Logger } from "winston";

export class NotificationService {
    constructor(private logger: (moduleName: string) => Logger) {}

    async createNotification(
        request: IOrderNotifcation
    ): Promise<IOrderNotifcation> {
        try {
            const notification = await OrderNotificationModel.create(request);

            return notification;
        } catch (error) {
            console.log(error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getNotificationByUserToId(
        userToId: string
    ): Promise<IOrderNotifcation[]> {
        try {
            const notification: IOrderNotifcation[] =
                await OrderNotificationModel.find({ userTo: userToId })
                    .lean()
                    .exec();

            return notification;
        } catch (error) {
            this.logger(
                "services/notification.service.ts - getNotificationByUserToId()"
            ).error(
                "OrderService getNotificationByUserToId() method error:",
                error
            );
            return [];
        }
    }

    async markNotificationAsRead(
        notificationId: string
    ): Promise<IOrderNotifcation> {
        try {
            if (!isValidObjectId(notificationId)) {
                return {} as IOrderNotifcation;
            }

            const notification = await OrderNotificationModel.findOneAndUpdate(
                {
                    _id: notificationId
                },
                {
                    $set: {
                        isRead: true
                    }
                },
                {
                    new: true
                }
            ).exec();

            if (!notification) {
                throw new NotFoundError(
                    "OrderNotification is not found",
                    "markNotificationAsRead() method"
                );
            }

            const order = await OrderModel.findOne({
                orderId: notification.orderId
            })
                .lean()
                .exec();

            socketIOOrderObject.emit("order_notification", order);
            return notification;
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) {
                throw error;
            }

            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async sendNotification(
        request: IOrderDocument,
        userToId: string,
        message: string
    ): Promise<void> {
        try {
            const notificationData: IOrderNotifcation = {
                userTo: userToId,
                senderUsername: request.sellerUsername,
                senderPicture: request.sellerImage,
                receiverUsername: request.buyerUsername,
                receiverPicture: request.buyerImage,
                message,
                orderId: request.orderId,
                createdAt: new Date()
            };

            const orderNotification =
                await this.createNotification(notificationData);

            socketIOOrderObject.emit(
                "order_notification",
                request,
                orderNotification
            );
        } catch (error) {
            console.log(error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async deleteOrderNotifications(
        userTo: string,
        senderUsername: string,
        orderId: string
    ): Promise<boolean> {
        try {
            const result = await OrderNotificationModel.deleteMany({
                userTo,
                senderUsername,
                orderId
            }).exec();

            return result.deletedCount > 0;
        } catch (error) {
            console.log(error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }
}

import { exchangeNamesAndRoutingKeys } from "@chat/config";
import {
    BadRequestError,
    IConversationDocument,
    IMessageDetails,
    IMessageDocument,
    lowerCase
} from "@ahgittix/jobber-shared";
import { ConversationModel } from "@chat/models/conversation.model";
import { MessageModel } from "@chat/models/message.model";
import { socketIOChatObject } from "@chat/server";
import { Logger } from "winston";
import { ChatQueue } from "@chat/queues/chat.queue";

export class ChatService {
    constructor(
        private logger: (moduleName: string) => Logger,
        private queue: ChatQueue
    ) {}

    async createConversation(
        conversationId: string,
        senderUsername: string,
        receiverUsername: string
    ): Promise<void> {
        try {
            await ConversationModel.create({
                conversationId,
                senderUsername,
                receiverUsername
            });
        } catch (error) {
            this.logger(
                "services/chat.service.ts - createConversation()"
            ).error("MessageService createConversation() method error", error);
            throw error;
        }
    }

    async addMessage(
        receiverEmail: string,
        request: IMessageDocument
    ): Promise<IMessageDocument> {
        try {
            const messageData: IMessageDocument =
                await MessageModel.create(request);

            if (request.hasOffer) {
                const emailMessageDetails: IMessageDetails & {
                    receiverEmail: string;
                } = {
                    receiverEmail,
                    sender: request.senderUsername,
                    amount: `${request.offer?.price}`,
                    buyerUsername: lowerCase(`${request.receiverUsername}`),
                    sellerUsername: lowerCase(`${request.senderUsername}`),
                    title: request.offer?.gigTitle,
                    description: request.offer?.description,
                    deliveryDays: `${request.offer?.deliveryInDays}`,
                    template: "offer"
                };

                const { notificationService } = exchangeNamesAndRoutingKeys;

                this.queue.publishDirectMessage(
                    notificationService.order.exchangeName,
                    notificationService.order.routingKey,
                    JSON.stringify(emailMessageDetails),
                    "Order email sent to notification service"
                );
            }

            socketIOChatObject.emit("message_received", messageData);
            return messageData;
        } catch (error) {
            this.logger("services/chat.service.ts - addMessage()").error(
                "MessageService addMessage() method error",
                error
            );
            throw error;
        }
    }

    async getConversation(
        senderUsername: string,
        receiverUsername: string
    ): Promise<IConversationDocument[]> {
        try {
            const queryObject = {
                $or: [
                    { senderUsername, receiverUsername },
                    {
                        senderUsername: receiverUsername,
                        receiverUsername: senderUsername
                    }
                ]
            };

            const conversations = (await ConversationModel.find(queryObject)
                .lean()
                .exec()) as IConversationDocument[];

            return conversations;
        } catch (error) {
            this.logger("services/chat.service.ts - getConversation()").error(
                "MessageService getConversation() method error",
                error
            );
            throw error;
        }
    }

    async getUserConversationList(
        username: string
    ): Promise<IMessageDocument[]> {
        try {
            const queryObject = {
                $or: [
                    {
                        senderUsername: username
                    },
                    { receiverUsername: username }
                ]
            };

            const messages: IMessageDocument[] = await MessageModel.aggregate([
                {
                    $match: queryObject
                },
                {
                    $group: {
                        _id: "$conversationId",
                        result: {
                            $top: {
                                output: "$$ROOT",
                                sortBy: { createdAt: -1 } //desc
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: "$result._id",
                        conversationId: "$result.conversationId",
                        sellerId: "$result.sellerId",
                        buyerId: "$result.buyerId",
                        receiverUsername: "$result.receiverUsername",
                        receiverPicture: "$result.receiverPicture",
                        senderUsername: "$result.senderUsername",
                        senderPicture: "$result.senderPicture",
                        body: "$result.body",
                        file: "$result.file",
                        gigId: "$result.gigId",
                        isRead: "$result.isRead",
                        hasOffer: "$result.hasOffer",
                        createdAt: "$result.createdAt"
                    }
                }
            ]);

            return messages;
        } catch (error) {
            this.logger(
                "services/chat.service.ts - getUserConversationList()"
            ).error(
                "MessageService getUserConversationList() method error",
                error
            );
            throw error;
        }
    }

    async getMessages(
        senderUsername: string,
        receiverUsername: string
    ): Promise<IMessageDocument[]> {
        try {
            const queryObject = {
                $or: [
                    { senderUsername, receiverUsername },
                    {
                        senderUsername: receiverUsername,
                        receiverUsername: senderUsername
                    }
                ]
            };

            const messages: IMessageDocument[] = await MessageModel.find(
                queryObject,
                {},
                { sort: { createdAt: 1 } }
            )
                .lean()
                .exec();

            return messages;
        } catch (error) {
            this.logger("services/chat.service.ts - getMessages()").error(
                "MessageService getMessages() method error",
                error
            );
            throw error;
        }
    }

    async getUserMessages(conversationId: string): Promise<IMessageDocument[]> {
        try {
            const messages: IMessageDocument[] = await MessageModel.find(
                { conversationId },
                {},
                { sort: { createdAt: 1 } }
            )
                .lean()
                .exec();

            return messages;
        } catch (error) {
            this.logger("services/chat.service.ts - getUserMessages()").error(
                "MessageService getUserMessages() method error",
                error
            );
            throw error;
        }
    }

    async updateOffer(
        messageId: string,
        type: string
    ): Promise<IMessageDocument | null> {
        try {
            if (!["cancelled", "accepted"].includes(type)) {
                throw new BadRequestError(
                    "offer type is incorrect",
                    "MessageService updateOffer() method error"
                );
            }

            const result = await MessageModel.findByIdAndUpdate(
                { _id: messageId },
                {
                    $set: {
                        [`offer.${type}`]: true
                    }
                },
                {
                    new: true
                }
            )
                .lean()
                .exec();

            return result;
        } catch (error) {
            this.logger("services/chat.service.ts - updateOffer()").error(
                "MessageService updateOffer() method error",
                error
            );
            throw error;
        }
    }

    async markMessageAsRead(messageId: string): Promise<IMessageDocument> {
        try {
            const message = (await MessageModel.findByIdAndUpdate(
                { _id: messageId },
                {
                    $set: {
                        isRead: true
                    }
                },
                {
                    new: true
                }
            )
                .lean()
                .exec()) as IMessageDocument;

            socketIOChatObject.emit("message_updated", message);

            return message;
        } catch (error) {
            this.logger("services/chat.service.ts - markMessageAsRead()").error(
                "MessageService markMessageAsRead() method error",
                error
            );
            throw error;
        }
    }

    async markMultipleMessagesAsRead(
        receiverUsername: string,
        senderUsername: string,
        messageId: string
    ): Promise<IMessageDocument> {
        try {
            await MessageModel.updateMany(
                { senderUsername, receiverUsername, isRead: false },
                {
                    $set: {
                        isRead: true
                    }
                }
            ).exec();

            const message = (await MessageModel.findOne({
                _id: messageId
            })
                .lean()
                .exec()) as IMessageDocument;

            socketIOChatObject.emit("message_updated", message);

            return message;
        } catch (error) {
            this.logger(
                "services/chat.service.ts - markMultipleMessageAsRead()"
            ).error(
                "MessageService markMultipleMessagesAsRead() method error",
                error
            );
            throw error;
        }
    }
}

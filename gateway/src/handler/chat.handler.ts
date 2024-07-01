import { messageService } from "@gateway/services/api/chat.api.service";

export class ChatHandler {
    public async getConversation(
        senderUsername: string,
        receiverUsername: string
    ): Promise<{ message: string; conversations: any }> {
        const response = await messageService.getConversation(
            senderUsername,
            receiverUsername
        );

        return {
            message: response.data.message,
            conversations: response.data.conversations
        };
    }

    public async getMessages(
        senderUsername: string,
        receiverUsername: string
    ): Promise<{ message: string; messages: any }> {
        const response = await messageService.getMessages(
            senderUsername,
            receiverUsername
        );

        return {
            message: response.data.message,
            messages: response.data.messages
        };
    }

    public async getConversationList(
        username: string
    ): Promise<{ message: string; conversations: any }> {
        const response = await messageService.getConversationList(username);

        return {
            message: response.data.message,
            conversations: response.data.conversations
        };
    }

    public async getUserMessages(
        conversationId: string
    ): Promise<{ message: string; messages: any }> {
        const response = await messageService.getUserMessages(conversationId);

        return {
            message: response.data.message,
            messages: response.data.messages
        };
    }

    public async addMessage(
        reqBody: any
    ): Promise<{ message: string; conversationId: string; messageData: any }> {
        const response = await messageService.addMessage(reqBody);

        return {
            message: response.data.message,
            conversationId: response.data.conversationId,
            messageData: response.data.messageData
        };
    }

    public async updateOffer(
        reqBody: any
    ): Promise<{ message: string; singleMessage: any }> {
        const response = await messageService.updateOffer(
            reqBody.messageId,
            reqBody.type
        );

        return {
            message: response.data.message,
            singleMessage: response.data.singleMessage
        };
    }

    public async markSingleMessageAsRead(
        reqBody: any
    ): Promise<{ message: string; singleMessage: any }> {
        const response = await messageService.markMessageAsRead(
            reqBody.messageId
        );

        return {
            message: response.data.message,
            singleMessage: response.data.singleMessage
        };
    }

    public async markMultipleMessagesAsRead(
        reqBody: any
    ): Promise<{ message: string }> {
        const { messageId, senderUsername, receiverUsername } = reqBody;
        const response = await messageService.markMultipleMessagesAsRead(
            messageId,
            senderUsername,
            receiverUsername
        );

        return { message: response.data.message };
    }
}

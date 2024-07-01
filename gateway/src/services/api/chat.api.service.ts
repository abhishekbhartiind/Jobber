import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { MESSAGE_BASE_URL } from "@gateway/config";
import { IMessageDocument } from "@ahgittix/jobber-shared";

export let axiosChatInstance: ReturnType<typeof axios.create>;

class ChatService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${MESSAGE_BASE_URL}/message`,
            "message"
        );
        axiosChatInstance = this.axiosService.axios;
    }

    async getConversation(
        senderUsername: string,
        receiverUsername: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.get(
            `/conversation/${senderUsername}/${receiverUsername}`
        );

        return response;
    }

    async getMessages(
        senderUsername: string,
        receiverUsername: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.get(
            `/${senderUsername}/${receiverUsername}`
        );

        return response;
    }

    async getConversationList(username: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.get(
            `/conversations/${username}`
        );

        return response;
    }

    async getUserMessages(conversationId: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.get(
            `/${conversationId}`
        );

        return response;
    }

    async addMessage(request: IMessageDocument): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.post(
            "/",
            request
        );

        return response;
    }

    async markMessageAsRead(messageId: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.put(
            "/mark-as-read",
            { messageId }
        );

        return response;
    }

    async markMultipleMessagesAsRead(
        messageId: string,
        senderUsername: string,
        receiverUsername: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.put(
            "/mark-multiple-as-read",
            { senderUsername, receiverUsername, messageId }
        );

        return response;
    }

    async updateOffer(messageId: string, type: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosChatInstance.put("/offer", {
            type,
            messageId
        });

        return response;
    }
}

export const messageService = new ChatService();

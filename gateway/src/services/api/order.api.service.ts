import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { ORDER_BASE_URL } from "@gateway/config";
import {
    IDeliveredWork,
    IExtendedDelivery,
    IOrderDocument,
    IOrderMessage
} from "@ahgittix/jobber-shared";

// Axios provider for Authenticated User
export let axiosOrderInstance: ReturnType<typeof axios.create>;

class OrderService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${ORDER_BASE_URL}/api/v1/order`,
            "order"
        );
        axiosOrderInstance = this.axiosService.axios;
    }

    async createOrderIntent(
        buyerId: string,
        price: number
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.post(
            "/create-payment-intent",
            { buyerId, price }
        );

        return response;
    }

    async createOrder(data: IOrderDocument): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.post(
            "/",
            data
        );

        return response;
    }

    async getOrderByOrderId(id: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.get(`/${id}`);

        return response;
    }

    async getOrdersBySellerId(id: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.get(
            `/seller/${id}`
        );

        return response;
    }

    async getOrdersByBuyerId(id: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.get(
            `/buyer/${id}`
        );

        return response;
    }

    async approveOrder(
        orderId: string,
        data: IOrderMessage
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            `/approve-order/${orderId}`,
            data
        );

        return response;
    }

    async cancelOrder(
        orderId: string,
        data: IOrderMessage,
        paymentIntentId: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            `/cancel/${orderId}`,
            { orderData: data, paymentIntentId }
        );

        return response;
    }

    async updateDeliveryDate(
        type: string,
        orderId: string,
        data: IExtendedDelivery
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            `/gig/${type}/${orderId}`,
            data
        );

        return response;
    }

    async requestDeliveryDateExtension(
        orderId: string,
        data: IExtendedDelivery
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            `/extension/${orderId}`,
            data
        );

        return response;
    }

    async deliverOrder(
        orderId: string,
        data: IDeliveredWork
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            `/deliver-order/${orderId}`,
            data
        );

        return response;
    }

    async getNotifications(userId: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.get(
            `/notifications/${userId}`
        );

        return response;
    }

    async markNotificationAsRead(
        notificationId: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosOrderInstance.put(
            "/notification/mark-as-read",
            {
                notificationId
            }
        );

        return response;
    }
}

export const orderService = new OrderService();

import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { USERS_BASE_URL } from "@gateway/config";

// Axios provider for Authenticated User
export let axiosBuyerInstance: ReturnType<typeof axios.create>;

class BuyerService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${USERS_BASE_URL}/api/v1/buyer`,
            "buyer"
        );
        axiosBuyerInstance = this.axiosService.axios;
    }

    async getCurrentBuyerByUsername(): Promise<AxiosResponse> {
        const response = await axiosBuyerInstance.get("/username");

        return response;
    }

    async getBuyerByUsername(username: string): Promise<AxiosResponse> {
        const response = await axiosBuyerInstance.get(`${username}`);

        return response;
    }

    async getBuyerByEmail(): Promise<AxiosResponse> {
        const response = await axiosBuyerInstance.get("/email");

        return response;
    }
}

export const buyerService = new BuyerService();

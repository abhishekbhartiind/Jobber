import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { USERS_BASE_URL } from "@gateway/config";
import { ISellerDocument } from "@ahgittix/jobber-shared";

// Axios provider for Authenticated User
export let axiosSellerInstance: ReturnType<typeof axios.create>;

class SellerService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${USERS_BASE_URL}/api/v1/seller`,
            "seller"
        );
        axiosSellerInstance = this.axiosService.axios;
    }

    async getSellerById(id: string): Promise<AxiosResponse> {
        const response = await axiosSellerInstance.get(`/id/${id}`);

        return response;
    }

    async getSellerByUsername(username: string): Promise<AxiosResponse> {
        const response = await axiosSellerInstance.get(`/username/${username}`);

        return response;
    }

    async getRandomSellers(count: string): Promise<AxiosResponse> {
        // console.log(axiosSellerInstance.getUri() + "/random/" + count);
        const response = await axiosSellerInstance.get(`/random/${count}`);

        return response;
    }

    async createSeller(request: ISellerDocument): Promise<AxiosResponse> {
        const response = await axiosSellerInstance.post("/create", request);

        return response;
    }

    async updateSeller(
        sellerId: string,
        request: ISellerDocument
    ): Promise<AxiosResponse> {
        const response = await axiosSellerInstance.put(`/${sellerId}`, request);

        return response;
    }

    async seed(count: string): Promise<AxiosResponse> {
        const response = await axiosSellerInstance.put(`/seed/${count}`);

        return response;
    }
}

export const sellerService = new SellerService();

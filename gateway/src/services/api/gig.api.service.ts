import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { GIG_BASE_URL } from "@gateway/config";
import { ISellerGig } from "@ahgittix/jobber-shared";

// Axios provider for Authenticated User
export let axiosGigInstance: ReturnType<typeof axios.create>;

class GigService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${GIG_BASE_URL}/api/v1/gig`,
            "gig"
        );
        axiosGigInstance = this.axiosService.axios;
    }

    async getGigById(id: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(`/${id}`);

        return response;
    }

    async getSellerActiveGigs(sellerId: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(`/seller/${sellerId}`);

        return response;
    }

    async getSellerInactiveGigs(sellerId: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(
            `/seller/inactive/${sellerId}`
        );

        return response;
    }

    async getGigsByCategory(username: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(`/category/${username}`);

        return response;
    }

    async getMoreGigsLikeThis(gigId: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(`/similar/${gigId}`);

        return response;
    }

    async getTopRatedGigsByCategory(username: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(`/top/${username}`);

        return response;
    }

    async searchGigs(
        query: string,
        from: string,
        size: string,
        type: string
    ): Promise<AxiosResponse> {
        const response = await axiosGigInstance.get(
            `/search/${from}/${size}/${type}?${query}`
        );

        return response;
    }

    async createGig(request: ISellerGig): Promise<AxiosResponse> {
        const response = await axiosGigInstance.post("/create", request);

        return response;
    }

    async updateGig(
        gigId: string,
        request: ISellerGig
    ): Promise<AxiosResponse> {
        const response = await axiosGigInstance.put(
            `/update/${gigId}`,
            request
        );

        return response;
    }

    async updateGigActiveStatus(
        gigId: string,
        active: boolean
    ): Promise<AxiosResponse> {
        const response = await axiosGigInstance.put(`/status/${gigId}`, {
            active
        });

        return response;
    }

    async deleteGig(gigId: string, sellerId: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.delete(`/${gigId}/${sellerId}`);

        return response;
    }

    async seed(count: string): Promise<AxiosResponse> {
        const response = await axiosGigInstance.put(`/seed/${count}`);

        return response;
    }
}

export const gigService = new GigService();

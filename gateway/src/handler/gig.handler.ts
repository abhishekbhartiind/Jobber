import { IPaginateProps } from "@ahgittix/jobber-shared";
import { gigService } from "@gateway/services/api/gig.api.service";
import { AxiosResponse } from "axios";

export class GigHandler {
    public async createGig(
        reqBody: any
    ): Promise<{ message: string; gig: any }> {
        const response = await gigService.createGig(reqBody);

        return {
            message: response.data.message,
            gig: response.data.gig
        };
    }

    public async deleteGig(
        gigId: string,
        sellerId: string
    ): Promise<{ message: string }> {
        const response = await gigService.deleteGig(gigId, sellerId);

        return {
            message: response.data.message
        };
    }

    public async getGigById(
        gigId: string
    ): Promise<{ message: string; gig: any }> {
        const response = await gigService.getGigById(gigId);

        return { message: response.data.message, gig: response.data.gig };
    }

    public async getGigsByCategory(
        username: string
    ): Promise<{ message: string; gigs: any }> {
        const response = await gigService.getGigsByCategory(username);

        return { message: response.data.message, gigs: response.data.gigs };
    }

    public async getSellerActiveGigs(
        sellerId: string
    ): Promise<{ message: string; gigs: any }> {
        const response = await gigService.getSellerActiveGigs(sellerId);

        return {
            message: response.data.message,
            gigs: response.data.gigs
        };
    }

    public async getSellerInactiveGigs(
        sellerId: string
    ): Promise<{ message: string; gigs: any }> {
        const response = await gigService.getSellerInactiveGigs(sellerId);

        return {
            message: response.data.message,
            gigs: response.data.gigs
        };
    }

    public async getGigsMoreLikeThis(
        gigId: string
    ): Promise<{ message: string; gigs: any }> {
        const response = await gigService.getMoreGigsLikeThis(gigId);

        return {
            message: response.data.message,
            gigs: response.data.gigs
        };
    }

    public async getTopRatedGigsByCategory(
        username: string
    ): Promise<{ message: string; gigs: any }> {
        const response = await gigService.getTopRatedGigsByCategory(username);

        return {
            message: response.data.message,
            gigs: response.data.gigs
        };
    }

    public async getGigsQuerySearch(
        params: IPaginateProps,
        reqQuery: any
    ): Promise<{ message: string; total: number; gigs: any }> {
        let query = "";
        const objList = Object.entries(reqQuery);
        const lastItemIndex = objList.length - 1;
        objList.forEach(([key, value], index) => {
            query += `${key}=${value}${index !== lastItemIndex ? "&" : ""}`;
        });

        const response: AxiosResponse = await gigService.searchGigs(
            `${query}`,
            params.from,
            params.size.toString(),
            params.type
        );

        return {
            message: response.data.message,
            total: response.data.total,
            gigs: response.data.gigs
        };
    }

    public async updateGig(
        gigId: string,
        reqBody: any
    ): Promise<{ message: string; gig: any }> {
        const response = await gigService.updateGig(gigId, reqBody);

        return {
            message: response.data.message,
            gig: response.data.gig
        };
    }

    public async updateGigActiveStatus(
        gigId: string,
        reqBody: any
    ): Promise<{ message: string; gig: any }> {
        const response = await gigService.updateGigActiveStatus(
            gigId,
            reqBody.active
        );

        return {
            message: response.data.message,
            gig: response.data.gig
        };
    }

    public async populateGigs(count: string): Promise<{ message: string }> {
        const response: AxiosResponse = await gigService.seed(count);

        return {
            message: response.data.message
        };
    }
}

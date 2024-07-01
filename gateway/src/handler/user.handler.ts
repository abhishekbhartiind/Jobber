import { buyerService } from "@gateway/services/api/buyer.api.service";
import { sellerService } from "@gateway/services/api/seller.api.service";

export class UserHandler {
    public async getBuyerByEmail(): Promise<{ message: string; buyer: any }> {
        const response = await buyerService.getBuyerByEmail();

        return { message: response.data.message, buyer: response.data.buyer };
    }

    public async getCurrentBuyer(): Promise<{ message: string; buyer: any }> {
        const response = await buyerService.getCurrentBuyerByUsername();

        return { message: response.data.message, buyer: response.data.buyer };
    }

    public async getBuyerByUsername(
        username: string
    ): Promise<{ message: string; buyer: any }> {
        const response = await buyerService.getBuyerByUsername(username);

        return { message: response.data.message, buyer: response.data.buyer };
    }

    public async getSellerById(
        sellerId: string
    ): Promise<{ message: string; seller: any }> {
        const response = await sellerService.getSellerById(sellerId);

        return { message: response.data.message, seller: response.data.seller };
    }

    public async getSellerByUsername(
        username: string
    ): Promise<{ message: string; seller: any }> {
        const response = await sellerService.getSellerByUsername(username);

        return { message: response.data.message, seller: response.data.seller };
    }

    public async getRandomSellers(
        count: string
    ): Promise<{ message: string; sellers: any }> {
        const response = await sellerService.getRandomSellers(count);

        return {
            message: response.data.message,
            sellers: response.data.sellers
        };
    }

    public async addSeller(
        reqBody: any
    ): Promise<{ message: string; seller: any }> {
        const response = await sellerService.createSeller(reqBody);

        return { message: response.data.message, seller: response.data.seller };
    }

    public async updateSellerInfo(
        sellerId: string,
        reqBody: any
    ): Promise<{ message: string; seller: any }> {
        const response = await sellerService.updateSeller(sellerId, reqBody);

        return { message: response.data.message, seller: response.data.seller };
    }

    public async populateSeller(count: string): Promise<{ message: string }> {
        const response = await sellerService.seed(count);

        return { message: response.data.message };
    }
}

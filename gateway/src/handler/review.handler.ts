import { reviewService } from "@gateway/services/api/review.api.service";

export class ReviewHandler {
    public async addReview(
        reqBody: any
    ): Promise<{ message: string; review: any }> {
        const response = await reviewService.addReview(reqBody);

        return {
            message: response.data.message,
            review: response.data.review
        };
    }

    public async getReviewsByGigId(
        gigId: string
    ): Promise<{ message: string; reviews: any }> {
        const response = await reviewService.getReviewsByGigId(gigId);

        return {
            message: response.data.message,
            reviews: response.data.reviews
        };
    }

    public async getReviewsBySellerId(
        sellerId: string
    ): Promise<{ message: string; reviews: any }> {
        const response = await reviewService.getReviewsBySellerId(sellerId);

        return {
            message: response.data.message,
            reviews: response.data.reviews
        };
    }
}

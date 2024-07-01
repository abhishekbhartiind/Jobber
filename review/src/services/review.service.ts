import { CustomError, IReviewDocument } from "@ahgittix/jobber-shared";
import { PoolClient } from "pg";
import { Logger } from "winston";

export class ReviewService {
    constructor(
        private db: PoolClient,
        private logger: (moduleName: string) => Logger
    ) {}

    async addReview(data: IReviewDocument): Promise<IReviewDocument> {
        try {
            const {
                gigId,
                rating,
                orderId,
                country,
                review,
                reviewerId,
                reviewerImage,
                reviewerUsername,
                sellerId,
                reviewType
            } = data;

            const createdAtDate = new Date().toISOString();

            const { rows } = await this.db.query<IReviewDocument>(
                `
        INSERT INTO "reviews" (
            "gigId", "rating", "orderId", "country", "createdAt", "review", "reviewerId", "reviewerImage", "reviewerUsername", "sellerId", "reviewType"
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
        )

        RETURNING *;
    `,
                [
                    gigId,
                    rating,
                    orderId,
                    country,
                    createdAtDate,
                    review,
                    reviewerId,
                    reviewerImage,
                    reviewerUsername,
                    sellerId,
                    reviewType
                ]
            );

            return rows[0];
        } catch (error) {
            if (error instanceof CustomError) {
                this.logger("services/review.service.ts - addReview()").error(
                    error
                );
                throw error;
            }

            throw new Error("Unexpected Error Occured. Please Try Again");
        }
    }

    async getReviewsByGigId(id: string): Promise<IReviewDocument[]> {
        try {
            const { rows } = await this.db.query<IReviewDocument>(
                `SELECT * FROM "reviews"
        WHERE "gigId" = $1`,
                [id]
            );

            return rows;
        } catch (error) {
            this.logger(
                "services/review.service.ts - getReviewsByGigId()"
            ).error(error);
            throw new Error("Unexpected Error Occured. Please Try Again");
        }
    }

    async getReviewsBySellerId(id: string): Promise<IReviewDocument[]> {
        try {
            const { rows } = await this.db.query<IReviewDocument>(
                `SELECT this.db FROM "reviews"
        WHERE "sellerId" = $1
        AND "reviewType" = $2`,
                [id, "seller-review"]
            );

            return rows;
        } catch (error) {
            this.logger(
                "services/review.service.ts - getReviewsBySellerId()"
            ).error(error);
            throw new Error("Unexpected Error Occured. Please Try Again");
        }
    }

    async deleteReview(reviewId: number): Promise<boolean> {
        try {
            const { rowCount } = await this.db.query(
                "DELETE FROM \"reviews\" WHERE id = $1",
                [reviewId]
            );

            return rowCount ? rowCount > 0 : false;
        } catch (error) {
            this.logger("services/review.service.ts - deleteReview()").error(
                error
            );
            throw new Error("Unexpected Error Occured. Please Try Again");
        }
    }
}

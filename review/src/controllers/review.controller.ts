import {
    BadRequestError,
    IReviewMessageDetails
} from "@ahgittix/jobber-shared";
import { exchangeNamesAndRoutingKeys } from "@review/config";
import { ReviewQueue } from "@review/queues/review.queue";
import { reviewSchema } from "@review/schemas/review.schema";
import { ReviewService } from "@review/services/review.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ReviewController {
    constructor(
        private reviewService: ReviewService,
        private rmq: ReviewQueue
    ) {}

    async addReview(req: Request, res: Response): Promise<void> {
        const { error } = reviewSchema.validate(req.body);
        if (error?.details[0]) {
            throw new BadRequestError(
                error.details[0].message,
                "ReviewService Create review() method"
            );
        }

        const review = await this.reviewService.addReview(req.body);

        const messageDetails: IReviewMessageDetails = {
            gigId: review.gigId,
            reviewerId: review.reviewerId,
            sellerId: review.sellerId,
            review: review.review,
            rating: review.rating,
            orderId: review.orderId,
            createdAt: review.createdAt.toString(),
            type: review.reviewType!
        };

        await this.rmq.publishFanoutMessage(
            exchangeNamesAndRoutingKeys.reviewService.review.exchangeName,
            JSON.stringify({
                type: "addReview",
                messageDetails
            }),
            "Review details sent to order and users services"
        );

        res.status(StatusCodes.CREATED).json({
            message: "Review created successfully",
            review
        });
    }

    async findReviewsByGigId(req: Request, res: Response): Promise<void> {
        const reviews = await this.reviewService.getReviewsByGigId(
            req.params.gigId
        );

        res.status(StatusCodes.OK).json({
            message: "Gig reviews by gig id",
            reviews
        });
    }

    async findReviewsBySellerId(req: Request, res: Response): Promise<void> {
        const reviews = await this.reviewService.getReviewsBySellerId(
            req.params.sellerId
        );

        res.status(StatusCodes.OK).json({
            message: "Gig reviews by seller id",
            reviews
        });
    }
}

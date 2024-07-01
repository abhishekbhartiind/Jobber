import {
    IOrderMessage,
    IRatingTypes,
    IReviewMessageDetails,
    ISellerDocument
} from "@ahgittix/jobber-shared";
import { SellerModel } from "@users/models/seller.model";
import { Logger } from "winston";

import { BuyerService } from "./buyer.service";

export class SellerService {
    constructor(
        private buyerService: BuyerService,
        private logger: (moduleName: string) => Logger
    ) {}

    async getSellerById(id: string): Promise<ISellerDocument | null> {
        try {
            return await SellerModel.findById(id).lean().exec();
        } catch (error) {
            this.logger("services/seller.service.ts - getSellerById()").error(
                "UsersService getSellerById() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getSellerByUsername(
        username: string
    ): Promise<ISellerDocument | null> {
        try {
            return await SellerModel.findOne({
                username
            })
                .lean()
                .exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - getSellerByUsername()"
            ).error("UsersService getSellerByUsername() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getSellerByEmail(email: string): Promise<ISellerDocument | null> {
        try {
            return await SellerModel.findOne({
                email
            })
                .lean()
                .exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - getSellerByEmail()"
            ).error("UsersService getSellerByEmail() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getRandomSellers(size: number): Promise<ISellerDocument[]> {
        try {
            return await SellerModel.aggregate([
                {
                    $sample: {
                        size
                    }
                }
            ]);
        } catch (error) {
            this.logger(
                "services/seller.service.ts - getRandomSellers()"
            ).error("UsersService getRandomSellers() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async createSeller(sellerData: ISellerDocument): Promise<ISellerDocument> {
        try {
            const result = await SellerModel.create(sellerData);

            await this.buyerService.updateBuyerIsSellerProp(result.email!);

            return result;
        } catch (error) {
            this.logger("services/seller.service.ts - createSeller()").error(
                "UsersService createSeller() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateTotalGigCount(sellerId: string, count: number): Promise<void> {
        try {
            await SellerModel.updateOne(
                { _id: sellerId },
                {
                    $inc: {
                        totalGigs: count
                    }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - updateTotalGigCount()"
            ).error("UsersService updateTotalGigCount() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateSellerOngoingJobsProp(
        sellerId: string,
        ongoingJobs: number
    ): Promise<void> {
        try {
            await SellerModel.updateOne(
                { _id: sellerId },
                {
                    $inc: {
                        ongoingJobs
                    }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - updateSellerOngoingJobsProp()"
            ).error(
                "UsersService updateSellerOngoingJobsProp() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateSellerCancelJobsProp(sellerId: string): Promise<void> {
        try {
            await SellerModel.updateOne(
                { _id: sellerId },
                {
                    $inc: {
                        ongoingJobs: -1,
                        cancelledJobs: 1
                    }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - updateSellerCancelJobsProp()"
            ).error(
                "UsersService updateSellerCancelJobsProp() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateSellerCompletedJobs(data: IOrderMessage): Promise<void> {
        try {
            const {
                sellerId,
                ongoingJobs,
                totalEarnings,
                recentDelivery,
                completedJobs
            } = data;

            await SellerModel.updateOne(
                { _id: sellerId },
                {
                    $inc: {
                        ongoingJobs,
                        completedJobs,
                        totalEarnings
                    },
                    $set: {
                        recentDelivery: new Date(recentDelivery!)
                    }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - updateSellerCompletedJobs()"
            ).error(
                "UsersService updateSellerCompletedJobs() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateSellerReview(data: IReviewMessageDetails): Promise<void> {
        try {
            const ratingTypes: IRatingTypes = {
                "1": "one",
                "2": "two",
                "3": "three",
                "4": "four",
                "5": "five"
            };
            const ratingKey: string = ratingTypes[`${data.rating}`];

            await SellerModel.updateOne(
                { _id: data.sellerId },
                {
                    $inc: {
                        ratingsCount: 1, // sum of user rating
                        ratingSum: data.rating, // sum of star
                        [`ratingCategories.${ratingKey}.value`]: data.rating,
                        [`ratingCategories.${ratingKey}.count`]: 1
                    }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/seller.service.ts - updateSellerReview()"
            ).error("UsersService updateSellerReview() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateSeller(
        sellerId: string,
        sellerData: ISellerDocument
    ): Promise<ISellerDocument | null> {
        try {
            return await SellerModel.findOneAndUpdate(
                { _id: sellerId },
                sellerData,
                { new: true }
            )
                .lean()
                .exec();
        } catch (error) {
            this.logger("services/seller.service.ts - updateSeller()").error(
                "UsersService updateSeller() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }
}

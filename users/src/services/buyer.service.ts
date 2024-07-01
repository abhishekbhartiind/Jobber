import { IBuyerDocument } from "@ahgittix/jobber-shared";
import { BuyerModel } from "@users/models/buyer.model";
import { Logger } from "winston";

export class BuyerService {
    constructor(private logger: (moduleName: string) => Logger) {}

    async getBuyerByEmail(email: string): Promise<IBuyerDocument | null> {
        try {
            return await BuyerModel.findOne({ email }).lean().exec();
        } catch (error) {
            this.logger("services/buyer.service.ts - getBuyerByEmail()").error(
                "UsersService getBuyerByEmail() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
        try {
            return await BuyerModel.findOne({ username }).lean().exec();
        } catch (error) {
            this.logger(
                "services/buyer.service.ts - getBuyerByUsername()"
            ).error("UsersService getBuyerByUsername() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getRandomBuyers(size: number): Promise<IBuyerDocument[]> {
        try {
            return await BuyerModel.aggregate([
                {
                    $sample: {
                        size
                    }
                }
            ]);
        } catch (error) {
            this.logger("services/buyer.service.ts - getRandomBuyers()").error(
                "UsersService getRandomBuyers() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async createBuyer(buyerData: IBuyerDocument): Promise<void> {
        try {
            const existingBuyer =
                (await this.getBuyerByEmail(buyerData.email ?? "")) ??
                (await this.getBuyerByUsername(buyerData.username ?? ""));

            if (!existingBuyer) {
                await BuyerModel.create(buyerData);
            }
        } catch (error) {
            this.logger("services/buyer.service.ts - createBuyer()").error(
                "UsersService createBuyer() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateBuyerIsSellerProp(email: string): Promise<void> {
        try {
            await BuyerModel.updateOne(
                {
                    email
                },
                {
                    $set: { isSeller: true }
                }
            ).exec();
        } catch (error) {
            this.logger(
                "services/buyer.service.ts - updateBuyerIsSellerProp()"
            ).error(
                "UsersService updateBuyerIsSellerProp() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async updateBuyerPurchasedGigsProp(
        buyerId: string,
        purchasedGigsId: string,
        type: string
    ): Promise<void> {
        try {
            await BuyerModel.updateOne(
                {
                    _id: buyerId
                },
                type === "purchased-gigs"
                    ? {
                          $push: {
                              purchasedGigs: purchasedGigsId
                          }
                      }
                    : {
                          $pull: {
                              purchasedGigs: purchasedGigsId
                          }
                      }
            ).exec();
        } catch (error) {
            this.logger(
                "services/buyer.service.ts - updateBuyerPurchasedGigsProp()"
            ).error(
                "UsersService updateBuyerPurchasedGigsProp() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }
}

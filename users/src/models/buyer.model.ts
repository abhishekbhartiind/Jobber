import { IBuyerDocument } from "@ahgittix/jobber-shared";
import mongoose, { Model, Schema, model } from "mongoose";

const buyerSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            index: true
        },
        country: {
            type: String,
            required: true
        },
        profilePicture: {
            type: String,
            required: true
        },
        isSeller: {
            type: Boolean,
            default: false
        },
        purchasedGigs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Gig"
            }
        ],
        createdAt: {
            type: Date
        }
    },
    {
        versionKey: false
    }
);

export const BuyerModel: Model<IBuyerDocument> = model<IBuyerDocument>(
    "Buyer",
    buyerSchema,
    "Buyer"
);

import { DATABASE_URL } from "@order/config";
import mongoose, { Mongoose } from "mongoose";
import { Logger } from "winston";

export const databaseConnection = async (
    logger: (moduleName: string) => Logger
): Promise<Mongoose> => {
    try {
        const db = await mongoose.connect(DATABASE_URL!);
        logger("database.ts - databaseConnection()").info(
            "OrderService MongoDB is connected."
        );

        return db;
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "OrderService databaseConnection() method error:",
            error
        );

        throw error;
    }
};

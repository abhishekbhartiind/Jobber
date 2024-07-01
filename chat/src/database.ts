import { DATABASE_URL } from "@chat/config";
import mongoose, { Mongoose } from "mongoose";
import { Logger } from "winston";

export const databaseConnection = async (
    logger: (moduleName: string) => Logger
): Promise<Mongoose> => {
    try {
        // console.log(DATABASE_URL);
        const db = await mongoose.connect(`${DATABASE_URL}`);
        logger("database.ts - databaseConnection()").info(
            "ChatService MongoDB is connected."
        );

        return db;
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "ChatService databaseConnection() method error:",
            error
        );

        throw error;
    }
};

import { DATABASE_URL } from "@gig/config";
import mongoose, { Mongoose } from "mongoose";
import { Logger } from "winston";

export const databaseConnection = async (logger: (moduleName?: string) => Logger): Promise<Mongoose> => {
    try {
        // console.log(DATABASE_URL);
        const db = await mongoose.connect(`${DATABASE_URL}`);
        logger("database.ts - databaseConnection()").info(
            "GigService MongoDB is connected."
        );

        return db;
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "GigService databaseConnection() method error:",
            error
        );
        process.exit(1);
    }
};

import { DATABASE_URL } from "@users/config";
import mongoose from "mongoose";
import { Logger } from "winston";

export const databaseConnection = async (
    logger: (moduleName: string) => Logger
): Promise<void> => {
    try {
        await mongoose.connect(`${DATABASE_URL}`);
        logger("database.ts - databaseConnection()").info(
            "UsersService MongoDB is connected."
        );

        process.once("exit", async () => {
            await mongoose.connection.close();
        });
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "UsersService databaseConnection() method error:",
            error
        );
    }
};

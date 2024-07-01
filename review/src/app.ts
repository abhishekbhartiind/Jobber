import express, { Express } from "express";
import { start } from "@review/server";
import { databaseConnection } from "@review/database";
import { winstonLogger } from "@ahgittix/jobber-shared";
import { ELASTIC_SEARCH_URL } from "@review/config";
import { Logger } from "winston";

async function main(): Promise<void> {
    const logger = (moduleName?: string): Logger =>
        winstonLogger(
            `${ELASTIC_SEARCH_URL}`,
            moduleName ?? "Review Service",
            "debug"
        );

    try {
        const db = await databaseConnection(logger);
        const app: Express = express();
        await start(app, db, logger);
        process.once("exit", () => {
            db.release();
        });
    } catch (error) {
        logger("app.ts - main()").error(error);
        process.exit(1);
    }
}

main();

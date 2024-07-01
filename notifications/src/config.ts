import { winstonLogger } from "@ahgittix/jobber-shared";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "./.env" });
} else {
    dotenv.config();
}

export const {
    PORT,
    CLIENT_URL,
    ELASTIC_SEARCH_URL,
    NODE_ENV,
    RABBITMQ_ENDPOINT,
    SENDER_EMAIL,
    SENDER_EMAIL_PASSWORD,
    ELASTIC_USERNAME,
    ELASTIC_PASSWORD,
    ELASTIC_APM_SECRET_TOKEN,
    ELASTIC_APM_SERVER_URL,
    ELASTIC_APM_SERVICE_NAME,
    ENABLE_APM
} = process.env;

if (NODE_ENV === "production" && ENABLE_APM == "1") {
    require("elastic-apm-node").start({
        serviceName: `${ELASTIC_APM_SERVICE_NAME}`,
        serverUrl: ELASTIC_APM_SERVER_URL,
        secretToken: ELASTIC_APM_SECRET_TOKEN,
        enironment: NODE_ENV,
        active: true,
        captureBody: "all",
        errorOnAbortedRequests: true,
        captureErrorLogStackTraces: "always"
    });
}

export const logger = (moduleName?: string) =>
    winstonLogger(
        `${ELASTIC_SEARCH_URL}`,
        moduleName ?? "Notification Service",
        "debug"
    );

import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "./.env" });
} else {
    dotenv.config();
}

export const {
    PORT,
    AUTH_BASE_URL,
    CLIENT_URL,
    GATEWAY_JWT_TOKEN,
    GIG_BASE_URL,
    REDIS_HOST,
    JWT_TOKEN,
    ELASTIC_SEARCH_URL,
    MESSAGE_BASE_URL,
    NODE_ENV,
    ORDER_BASE_URL,
    REVIEW_BASE_URL,
    SECRET_KEY_ONE,
    SECRET_KEY_TWO,
    USERS_BASE_URL,
    ELASTIC_APM_SECRET_TOKEN,
    ELASTIC_APM_SERVER_URL,
    ELASTIC_APM_SERVICE_NAME,
    ENABLE_APM
} = process.env;

// if (NODE_ENV === "production" && ENABLE_APM == "1") {
//     require("elastic-apm-node").start({
//         serviceName: `${ELASTIC_APM_SERVICE_NAME}`,
//         serverUrl: ELASTIC_APM_SERVER_URL,
//         secretToken: ELASTIC_APM_SECRET_TOKEN,
//         enironment: NODE_ENV,
//         active: true,
//         captureBody: "all",
//         errorOnAbortedRequests: true,
//         captureErrorLogStackTraces: "always"
//     });
// }

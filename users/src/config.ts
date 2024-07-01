import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "./.env" });
} else {
    dotenv.config();
}

export const {
    PORT,
    CLOUD_API_KEY,
    CLOUD_API_SECRET,
    CLOUD_NAME,
    ELASTIC_SEARCH_URL,
    GATEWAY_JWT_TOKEN,
    API_GATEWAY_URL,
    JWT_TOKEN,
    NODE_ENV,
    RABBITMQ_ENDPOINT,
    DATABASE_URL,
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

export const notificationServiceExchangeNamesAndRoutingKeys = {
    email: {
        exchangeName: "jobber-email-notification",
        routingKey: "auth-email"
    },
    order: {
        exchangeName: "jobber-order-notification",
        routingKey: "order-email"
    }
};

export const buyerServiceExchangeNamesAndRoutingKeys = {
    buyer: {
        exchangeName: "jobber-buyer-update",
        routingKey: "user-buyer"
    },
    seller: {
        exchangeName: "jobber-seller-update",
        routingKey: "user-seller"
    }
};

export const reviewServiceExchangeNamesAndRoutingKeys = {
    review: {
        exchangeName: "jobber-review"
    }
};

export const gigServiceExchangeNamesAndRoutingKeys = {
    updateGig: {
        exchangeName: "jobber-update-gig",
        routingKey: "update-gig"
    },
    getSellers: {
        exchangeName: "jobber-gig",
        routingKey: "get-sellers"
    },
    seed: {
        exchangeName: "jobber-seed-gig",
        routingKey: "receive-sellers"
    }
};

export const chatServiceExchangeNamesAndRoutingKeys = {
    checkExistingUserForConversation: {
        exchangeName: "jobber-check-existing-user",
        routingKey: "check-user-for-conversation"
    },
    responseExistingUsersForConversation: {
        exchangeName: "jobber-response-existing-user",
        routingKey: "response-user-for-conversation"
    }
};

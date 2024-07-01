export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            ENABLE_APM: string;
            GATEWAY_JWT_TOKEN: string;
            JWT_TOKEN: string;
            NODE_ENV: string;
            SECRET_KEY_ONE: string;
            SECRET_KEY_TWO: string;
            CLIENT_URL: string;
            AUTH_BASE_URL: string;
            USERS_BASE_URL: string;
            GIG_BASE_URL: string;
            MESSAGE_BASE_URL: string;
            ORDER_BASE_URL: string;
            REVIEW_BASE_URL: string;
            REDIS_HOST: string;
            ELASTIC_SEARCH_URL: string;
            ELASTIC_APM_SERVER_URL: string;
            ELASTIC_APM_SECRET_TOKEN: string;
            ELASTIC_APM_SERVICE_NAME: string;
        }
    }
}

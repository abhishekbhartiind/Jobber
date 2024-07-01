export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            ENABLE_APM: string;
            NODE_ENV: string;
            CLIENT_URL: string;
            RABBITMQ_ENDPOINT: string;
            SENDER_EMAIL: string;
            SENDER_EMAIL_PASSWORD: string;
            ELASTIC_SEARCH_URL: string;
            ELASTIC_APM_SERVER_URL: string;
            ELASTIC_APM_SECRET_TOKEN: string;
            ELASTIC_APM_SERVICE_NAME: string;
        }
    }
}

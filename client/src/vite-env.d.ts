/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly VITE_NODE_ENV: string;
    readonly VITE_BASE_ENDPOINT: string;
    readonly VITE_CLIENT_ENDPOINT: string;
    readonly VITE_STRIPE_KEY: string;
    readonly VITE_ELASTIC_APM_SERVER: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError
} from "@reduxjs/toolkit/query/react";
import { getDataFromSessionStorage } from "src/shared/utils/util.service";

const BASE_ENDPOINT = import.meta.env.VITE_BASE_ENDPOINT;

const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_ENDPOINT}/api/gateway/v1`,
    prepareHeaders: (headers: Headers) => {
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        return headers;
    },
    credentials: "include"
});

const baseQueryWithReAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (url, api, extraOptions) => {
    const result = await baseQuery(url, api, extraOptions);
    if (result.error && result.error.status === 401) {
        const loggedInUsername: string =
            getDataFromSessionStorage("loggedInUser");
        await baseQuery(
            `/auth/refresh-token/${loggedInUsername}`,
            api,
            extraOptions
        );
    }
    return result;
};

export const api = createApi({
    reducerPath: "clientApi",
    baseQuery: baseQueryWithReAuth,
    tagTypes: [
        "Auth",
        "Currentuser",
        "Buyer",
        "Seller",
        "Chat",
        "Checkout",
        "Gigs",
        "Search",
        "Review",
        "Order",
        "Notification"
    ],
    endpoints: () => ({})
});

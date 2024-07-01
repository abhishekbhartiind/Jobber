import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    PersistConfig,
    REGISTER,
    REHYDRATE,
    persistReducer
} from "redux-persist";
import authReducer from "src/features/auth/reducers/auth.reducer";
import logoutReducer from "src/features/auth/reducers/logout.reducer";
import { api } from "./api";
import { Reducer } from "redux";
import buyerReducer from "src/features/buyer/reducer/buyer.reducer";
import sellerReducer from "src/features/seller/reducer/seller.reducer";
import headerReducer from "src/shared/header/reducer/header.reducer";
import categoryReducer from "src/shared/header/reducer/category.reducer";
import notificationReducer from "src/shared/header/reducer/notification.reducer";

const persistConfig: PersistConfig<any, any, any, any> = {
    key: "root",
    storage: storage,
    blacklist: ["clientApi", "_persist"]
};

export const combineReducer = combineReducers({
    [api.reducerPath]: api.reducer,
    authUser: authReducer,
    logout: logoutReducer,
    buyer: buyerReducer,
    seller: sellerReducer,
    header: headerReducer,
    showCategoryContainer: categoryReducer,
    notification: notificationReducer
});

export const rootReducers: Reducer<RootState> = (state, action) => {
    // this is to reset the state to default when user logs out
    if (action.type === "logout/logout") {
        state = {} as RootState;
    }
    return combineReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducers);

export const store: ToolkitStore = configureStore({
    devTools: true,
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER
                ]
            }
        }).concat(api.middleware)
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

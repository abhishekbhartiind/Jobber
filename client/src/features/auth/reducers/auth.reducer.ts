import { createSlice, Reducer, Slice } from "@reduxjs/toolkit";
import { IAuthUser, IReduxAddAuthUser } from "../interfaces/auth.interface";
import { initialAuthUserValues } from "src/shared/utils/static-data";

const initialState: IAuthUser = initialAuthUserValues;

const authSlice: Slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        addAuthUser: (
            state: IAuthUser,
            action: IReduxAddAuthUser
        ): IAuthUser => {
            const { authInfo } = action.payload;
            state = { ...authInfo } as unknown as IAuthUser;

            return state;
        },
        clearAuthUser: (): IAuthUser => {
            return initialAuthUserValues;
        }
    }
});

export const { addAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer as Reducer<typeof initialState>;

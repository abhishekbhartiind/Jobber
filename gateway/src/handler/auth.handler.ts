import { IPaginateProps } from "@ahgittix/jobber-shared";
import { RedisClient } from "@gateway/redis/gateway.redis";
import { socketIO } from "@gateway/server";
import { authService } from "@gateway/services/api/auth.api.service";

export class AuthHandler {
    constructor(private redis: RedisClient) {}

    public async getCurrentUser(): Promise<{ message: string; user: any }> {
        const response = await authService.getCurrentUser();
        const { message, user } = response.data;

        return { message, user };
    }

    public async resendVerificationEmail(
        reqBody: any
    ): Promise<{ message: string; user: any }> {
        const response = await authService.resendEmail(reqBody);
        const { message, user } = response.data;

        return { message, user };
    }

    public async getLoggedInUsers(): Promise<void> {
        const response =
            await this.redis.getLoggedInUsersFromCache("loggedInUsers");
        socketIO.emit("online", response);
    }

    public async removeLoggedInUsers(username: string): Promise<void> {
        const response = await this.redis.removeLoggedInUserFromCache(
            "loggedInUsers",
            username
        );
        socketIO.emit("online", response);
    }

    public async forgotPassword(email: string): Promise<string> {
        const response = await authService.forgotPassword(email);

        return response.data.message;
    }

    public async resetPassword(token: string, reqBody: any): Promise<string> {
        const { password, confirmPassword } = reqBody;
        const response = await authService.resetPassword(
            token,
            password,
            confirmPassword
        );

        return response.data.message;
    }

    public async changePassword(reqBody: any): Promise<string> {
        const { newPassword, currentPassword } = reqBody;
        const response = await authService.changePassword(
            currentPassword,
            newPassword
        );

        return response.data.message;
    }

    public async getRefreshToken(
        username: string
    ): Promise<{ token: string; message: string; user: any }> {
        const response = await authService.getRefreshToken(username);
        const { token, message, user } = response.data;
        return { token, message, user };
    }

    public async getGigById(
        id: string
    ): Promise<{ message: string; gig: any }> {
        const response = await authService.getGigById(id);

        return { message: response.data.message, gig: response.data.gig };
    }

    public async getGigsQuerySearch(
        params: IPaginateProps,
        reqQuery: Record<string, string>
    ): Promise<{ message: string; total: number; gigs: any }> {
        let query = "";
        const objList = Object.entries(reqQuery);
        const lastItemIndex = objList.length - 1;
        objList.forEach(([key, value], index) => {
            query += `${key}=${value}${index !== lastItemIndex ? "&" : ""}`;
        });
        const response = await authService.getGigs(
            query,
            params.from,
            params.size.toString(),
            params.type
        );

        return {
            message: response.data.message,
            total: response.data.total,
            gigs: response.data.gigs
        };
    }

    public async signIn(
        reqBody: any
    ): Promise<{ token: string; message: string; user: any }> {
        const response = await authService.signIn(reqBody);
        const { token, message, user } = response.data;

        return { token, message, user };
    }

    public async signUp(
        reqBody: any
    ): Promise<{ token: string; message: string; user: any }> {
        const response = await authService.signUp(reqBody);
        const { token, message, user } = response.data;

        return { token, message, user };
    }

    public async verifyEmail(
        token: string
    ): Promise<{ message: string; user: string }> {
        const response = await authService.verifyEmail(token);
        const { message, user } = response.data;

        return { message, user };
    }

    public async populateAuth(count: string): Promise<void> {
        await authService.seed(count);
    }
}

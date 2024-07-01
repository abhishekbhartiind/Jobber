import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { AUTH_BASE_URL } from "@gateway/config";
import { IAuth } from "@ahgittix/jobber-shared";

// Axios provider for Authenticated User
export let axiosAuthInstance: ReturnType<typeof axios.create>;

class AuthService {
    // Axios general provider
    axiosService: AxiosService;

    constructor() {
        this.axiosService = new AxiosService(
            `${AUTH_BASE_URL}/api/v1/auth`,
            "auth"
        );
        axiosAuthInstance = this.axiosService.axios;
    }

    async getCurrentUser(): Promise<AxiosResponse> {
        const response: AxiosResponse =
            await axiosAuthInstance.get("/current-user");

        return response;
    }

    async getRefreshToken(username: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosAuthInstance.get(
            `/refresh-token/${username}`
        );

        return response;
    }

    async resendEmail(request: {
        userId: number;
        email: string;
    }): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosAuthInstance.post(
            "/resend-verification-email",
            request
        );

        return response;
    }

    async verifyEmail(token: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosAuthInstance.put(
            "/verify-email",
            { token }
        );

        return response;
    }

    async changePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await axiosAuthInstance.put(
            "/change-password",
            { currentPassword, newPassword }
        );

        return response;
    }

    async signUp(request: IAuth): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.post(
            "/signup",
            request
        );

        return response;
    }

    async signIn(request: IAuth): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.post(
            "/signin",
            request
        );

        return response;
    }

    async forgotPassword(email: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.put(
            "/forgot-password",
            { email }
        );

        return response;
    }

    async resetPassword(
        token: string,
        password: string,
        confirmPassword: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.put(
            `/reset-password/${token}`,
            { password, confirmPassword }
        );

        return response;
    }

    async getGigs(
        query: string,
        from: string,
        size: string,
        type: string
    ): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.get(
            `/search/gig/${from}/${size}/${type}?${query}`
        );

        return response;
    }

    async getGigById(id: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.get(
            `/search/gig/${id}`
        );

        return response;
    }

    async seed(count: string): Promise<AxiosResponse> {
        const response: AxiosResponse = await this.axiosService.axios.put(
            `/seed/${count}`
        );

        return response;
    }
}

export const authService = new AuthService();

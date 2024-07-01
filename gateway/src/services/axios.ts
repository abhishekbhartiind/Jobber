import axios from "axios";
import jwt from "jsonwebtoken";
import { GATEWAY_JWT_TOKEN } from "@gateway/config";

export class AxiosService {
    public axios: ReturnType<typeof axios.create>;

    constructor(baseUrl: string, serviceName: string) {
        this.axios = this.axiosCreateInstance(baseUrl, serviceName);
    }

    public axiosCreateInstance(
        baseUrl: string,
        serviceName?: string
    ): ReturnType<typeof axios.create> {
        let gatewaytoken = "";
        if (serviceName) {
            gatewaytoken = jwt.sign({ id: serviceName }, GATEWAY_JWT_TOKEN!, {
                issuer: "Jobber Auth",
                algorithm: "HS512",
                expiresIn: "1d"
            });
        }

        const instance: ReturnType<typeof axios.create> = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
                "X-Request-From": serviceName,
                Accept: "application/json",
                gatewaytoken
            },
            withCredentials: true
        });

        return instance;
    }
}

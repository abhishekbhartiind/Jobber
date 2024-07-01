import {
    BadRequestError,
    IAuthPayload,
    NotAuthorizedError
} from "@ahgittix/jobber-shared";
import { JWT_TOKEN } from "@gateway/config";
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

class AuthMiddleware {
    public async authOnly(c: Context, next: Next): Promise<void> {
        const token = getCookie(c, "session");
        if (!token) {
            throw new NotAuthorizedError(
                "Token is not available. Please login again",
                "GatewayService verifyUser() method error"
            );
        }

        try {
            const payload: IAuthPayload = jwt.verify(token, `${JWT_TOKEN}`, {
                algorithms: ["HS512"]
            }) as IAuthPayload;

            c.set("currentUser", payload);
        } catch (error) {
            throw new NotAuthorizedError(
                "Token is not correct. Please login again",
                "GatewayService verifyUser() method invalid session error"
            );
        }

        await next();
    }

    public async verifyAuth(c: Context, next: Next): Promise<void> {
        if (!c.get("currentUser")) {
            throw new BadRequestError(
                "Authentication is required to access this route",
                "GatewayService checkAuthentication() method error"
            );
        }

        await next();
    }
}

export const authMiddleware = new AuthMiddleware();

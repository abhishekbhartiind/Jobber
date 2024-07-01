import { SECRET_KEY_ONE, SECRET_KEY_TWO, NODE_ENV } from "@gateway/config";
import { AuthHandler } from "@gateway/handler/auth.handler";
import { RedisClient } from "@gateway/redis/gateway.redis";
import { BASE_PATH } from "@gateway/routes";
import { authMiddleware } from "@gateway/services/auth-middleware";
import { Hono, Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import { StatusCodes } from "http-status-codes";

export function authRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>,
    redis: RedisClient
): void {
    const authHndlr = new AuthHandler(redis);

    api.get(
        "/auth/current-user",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            const { message, user } =
                await authHndlr.getCurrentUser.bind(authHndlr)();

            return c.json({ message, user }, StatusCodes.OK);
        }
    );

    api.get(
        "/auth/logged-in-user",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            await authHndlr.getLoggedInUsers.bind(authHndlr)();

            return c.text("Users online", StatusCodes.OK);
        }
    );

    api.get(
        "/auth/refresh-token/:username",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            const username = c.req.param("username");
            const { token, message, user } =
                await authHndlr.getRefreshToken.bind(authHndlr)(username);

            await setSignedCookie(
                c,
                "session",
                token,
                `${SECRET_KEY_ONE}${SECRET_KEY_TWO}`,
                {
                    httpOnly: true,
                    maxAge: 7 * 24 * 36 * 10 * 1000, // 7 days,
                    secure: NODE_ENV !== "development",
                    ...(NODE_ENV !== "development" && {
                        sameSite: "none"
                    })
                }
            );

            return c.json({ message, user }, StatusCodes.OK);
        }
    );

    api.post(
        "/auth/resend-verification-email",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            const jsonBody = await c.req.json();
            const { message, user } =
                await authHndlr.resendVerificationEmail.bind(authHndlr)(
                    jsonBody
                );

            return c.json({ message, user }, StatusCodes.OK);
        }
    );

    api.delete(
        "/auth/logged-in-user/:username",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            const username = c.req.param("username");
            await authHndlr.removeLoggedInUsers.bind(authHndlr)(username);

            return c.text("User is offline", StatusCodes.OK);
        }
    );
}

import { NotAuthorizedError } from "@ahgittix/jobber-shared";
import { SECRET_KEY_ONE, SECRET_KEY_TWO, NODE_ENV } from "@gateway/config";
import { AuthHandler } from "@gateway/handler/auth.handler";
import { RedisClient } from "@gateway/redis/gateway.redis";
import { BASE_PATH } from "@gateway/routes";
import { authMiddleware } from "@gateway/services/auth-middleware";
import { Hono, Context } from "hono";
import { setSignedCookie, deleteCookie, getSignedCookie } from "hono/cookie";
import { StatusCodes } from "http-status-codes";

export function unauthRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>,
    redis: RedisClient
): void {
    const authHndlr = new AuthHandler(redis);

    api.get("/auth/search/gig/:from/:size/:type", async (c: Context) => {
        const { from, size, type } = c.req.param();
        const { query, delivery_time, min, max } = c.req.query();

        const { gigs, message, total } = await authHndlr.getGigsQuerySearch(
            { from, size: parseInt(size), type },
            { query, delivery_time, min, max }
        );

        return c.json({ message, total, gigs }, StatusCodes.OK);
    });

    api.get("/auth/search/gig/:id", async (c: Context) => {
        const id = c.req.param("id");
        const { gig, message } = await authHndlr.getGigById(id);

        return c.json({ message, gig }, StatusCodes.OK);
    });

    api.post("/auth/signup", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { token, message, user } = await authHndlr.signUp(jsonBody);

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

        return c.json({ message, user }, StatusCodes.CREATED);
    });

    api.post("/auth/signin", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { token, message, user } = await authHndlr.signIn(jsonBody);

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
    });

    api.put("/auth/signout", (c: Context) => {
        deleteCookie(c, "session");

        return c.text("Successfully signout");
    });

    api.put("/auth/verify-email", async (c: Context) => {
        const token = await getSignedCookie(
            c,
            `${SECRET_KEY_ONE}${SECRET_KEY_TWO}`,
            "session"
        );

        if (!token) {
            throw new NotAuthorizedError("Unauthenticated user", "API Gateway");
        }

        const { message, user } = await authHndlr.verifyEmail(token);
        return c.json({ message, user }, StatusCodes.OK);
    });

    api.put("/auth/forgot-password", async (c: Context) => {
        const { email } = await c.req.json();
        const message = await authHndlr.forgotPassword(email);
        return c.json({ message }, StatusCodes.OK);
    });

    api.put("/auth/reset-password/:token", async (c: Context) => {
        const token = c.req.param("token");
        const jsonBody = await c.req.json();
        const message = await authHndlr.resetPassword(token, jsonBody);

        return c.json({ message }, StatusCodes.OK);
    });

    api.put(
        "/auth/change-password",
        authMiddleware.verifyAuth,
        async (c: Context) => {
            const jsonBody = await c.req.json();
            const message = await authHndlr.changePassword(jsonBody);

            return c.json({ message }, StatusCodes.OK);
        }
    );

    api.put("/auth/seed/:count", async (c: Context) => {
        const count = c.req.param("count");
        await authHndlr.populateAuth(count);

        return c.text("Success populate users account", StatusCodes.CREATED);
    });
}

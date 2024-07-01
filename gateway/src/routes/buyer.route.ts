import { UserHandler } from "@gateway/handler/user.handler";
import { BASE_PATH } from "@gateway/routes";
import { authMiddleware } from "@gateway/services/auth-middleware";
import { Context, Hono } from "hono";
import { StatusCodes } from "http-status-codes";

export function buyerRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>
): void {
    const userHndlr = new UserHandler();
    api.use("/buyer", authMiddleware.verifyAuth);

    api.get("/buyer/email", async (c: Context) => {
        const { buyer, message } = await userHndlr.getBuyerByEmail();

        return c.json({ message, buyer }, StatusCodes.OK);
    });

    api.get("/buyer/username", async (c: Context) => {
        const { buyer, message } = await userHndlr.getCurrentBuyer();

        return c.json({ message, buyer }, StatusCodes.OK);
    });

    api.get("/buyer/:username", async (c: Context) => {
        const username = c.req.param("username");
        const { buyer, message } = await userHndlr.getBuyerByUsername(username);

        return c.json({ message, buyer }, StatusCodes.OK);
    });
}

import { authMiddleware } from "@gateway/services/auth-middleware";
import { UserHandler } from "@gateway/handler/user.handler";
import { BASE_PATH } from "@gateway/routes";
import { Context, Hono } from "hono";
import { StatusCodes } from "http-status-codes";

export function sellerRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>
): void {
    const userHndlr = new UserHandler();
    api.use("/seller", authMiddleware.verifyAuth);

    api.get("/seller/id/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId");
        const { message, seller } = await userHndlr.getSellerById(sellerId);

        return c.json({ message, seller }, StatusCodes.OK);
    });
    api.get("/seller/username/:username", async (c: Context) => {
        const username = c.req.param("username");
        const { message, seller } =
            await userHndlr.getSellerByUsername(username);

        return c.json({ message, seller }, StatusCodes.OK);
    });
    api.get("/seller/random/:count", async (c: Context) => {
        const count = c.req.param("count");
        const { message, sellers } = await userHndlr.getRandomSellers(count);

        return c.json({ message, sellers }, StatusCodes.OK);
    });
    api.post("/seller/create", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, seller } = await userHndlr.addSeller(jsonBody);

        return c.json({ message, seller }, StatusCodes.CREATED);
    });
    api.put("/seller/update/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId");
        const jsonBody = await c.req.json();
        const { message, seller } = await userHndlr.updateSellerInfo(
            sellerId,
            jsonBody
        );

        return c.json({ message, seller }, StatusCodes.OK);
    });
    api.put("/seller/seed/:count", async (c: Context) => {
        const count = c.req.param("count");
        const { message } = await userHndlr.populateSeller(count);
        return c.json({ message }, StatusCodes.OK);
    });
}

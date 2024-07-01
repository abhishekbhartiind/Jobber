import { GigHandler } from "@gateway/handler/gig.handler";
import { BASE_PATH } from "@gateway/routes";
import { authMiddleware } from "@gateway/services/auth-middleware";
import { Context, Hono } from "hono";
import { StatusCodes } from "http-status-codes";

export function gigRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>
) {
    const gigHndlr = new GigHandler();
    api.use("/gig", authMiddleware.verifyAuth);

    api.get("/gig/:gigId", async (c: Context) => {
        const gigId = c.req.param("gigId");
        const { message, gig } = await gigHndlr.getGigById(gigId);

        return c.json({ message, gig }, StatusCodes.OK);
    });
    api.get("/gig/seller/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId");
        const { message, gigs } = await gigHndlr.getSellerActiveGigs(sellerId);

        return c.json({ message, gigs }, StatusCodes.OK);
    });
    api.get("/gig/seller/inactive/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId");
        const { message, gigs } =
            await gigHndlr.getSellerInactiveGigs(sellerId);

        return c.json({ message, gigs }, StatusCodes.OK);
    });
    api.get("/gig/search/:from/:size/:type", async (c: Context) => {
        const { from, size, type } = c.req.param();
        const { query, delivery_time, min, max } = c.req.query();
        const { message, total, gigs } = await gigHndlr.getGigsQuerySearch(
            { from, size: parseInt(size), type },
            { query, delivery_time, min, max }
        );

        return c.json({ message, total, gigs }, StatusCodes.OK);
    });
    api.get("/gig/category/:username", async (c: Context) => {
        const username = c.req.param("username");
        const { message, gigs } = await gigHndlr.getGigsByCategory(username);

        return c.json({ message, gigs }, StatusCodes.OK);
    });
    api.get("/gig/top/:username", async (c: Context) => {
        const username = c.req.param("username");
        const { message, gigs } =
            await gigHndlr.getTopRatedGigsByCategory(username);

        return c.json({ message, gigs }, StatusCodes.OK);
    });
    api.get("/gig/similar/:gigId", async (c: Context) => {
        const gigId = c.req.param("gigId");
        const { message, gigs } = await gigHndlr.getGigsMoreLikeThis(gigId);

        return c.json({ message, gigs }, StatusCodes.OK);
    });

    api.post("/gig/create", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, gig } = await gigHndlr.createGig(jsonBody);

        return c.json({ message, gig }, StatusCodes.CREATED);
    });

    api.put("/gig/:gigId", async (c: Context) => {
        const gigId = c.req.param("gigId");
        const jsonBody = await c.req.json();
        const { message, gig } = await gigHndlr.updateGig(gigId, jsonBody);

        return c.json({ message, gig }, StatusCodes.OK);
    });

    api.put("/gig/active-status/:gigId", async (c: Context) => {
        const gigId = c.req.param("gigId");
        const jsonBody = await c.req.json();
        const { message, gig } = await gigHndlr.updateGigActiveStatus(
            gigId,
            jsonBody
        );

        return c.json({ message, gig }, StatusCodes.OK);
    });

    api.delete("/gig/:gigId/:sellerId", async (c: Context) => {
        const { gigId, sellerId } = c.req.param();
        const { message } = await gigHndlr.deleteGig(gigId, sellerId);

        return c.json({ message }, StatusCodes.OK);
    });

    api.put("/gig/seed/:count", async (c: Context) => {
        const count = c.req.param("count");
        const { message } = await gigHndlr.populateGigs(count);

        return c.json({ message }, StatusCodes.OK);
    });
}

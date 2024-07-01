import { authMiddleware } from "@gateway/services/auth-middleware";
import { ChatHandler } from "@gateway/handler/chat.handler";
import { BASE_PATH } from "@gateway/routes";
import { Context, Hono } from "hono";
import { StatusCodes } from "http-status-codes";

export function chatRoute(
    api: Hono<Record<string, never>, Record<string, never>, typeof BASE_PATH>
) {
    const chatHndlr = new ChatHandler();
    api.use("/message", authMiddleware.verifyAuth);

    api.post("/message", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { conversationId, message, messageData } =
            await chatHndlr.addMessage(jsonBody);

        return c.json(
            { message, conversationId, messageData },
            StatusCodes.CREATED
        );
    });

    api.put("/message/offer", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, singleMessage } =
            await chatHndlr.updateOffer(jsonBody);

        return c.json({ message, singleMessage }, StatusCodes.OK);
    });
    api.put("/message/mark-as-read", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message, singleMessage } =
            await chatHndlr.markSingleMessageAsRead(jsonBody);

        return c.json({ message, singleMessage }, StatusCodes.OK);
    });
    api.put("/message/mark-multiple-as-read", async (c: Context) => {
        const jsonBody = await c.req.json();
        const { message } =
            await chatHndlr.markMultipleMessagesAsRead(jsonBody);

        return c.json({ message }, StatusCodes.OK);
    });

    api.get(
        "/message/conversation/:senderUsername/:receiverUsername",
        async (c: Context) => {
            const { senderUsername, receiverUsername } = c.req.param();
            const { message, conversations } = await chatHndlr.getConversation(
                senderUsername,
                receiverUsername
            );

            return c.json({ message, conversations }, StatusCodes.OK);
        }
    );
    api.get("/message/conversations/:username", async (c: Context) => {
        const username = c.req.param("username");
        const { message, conversations } =
            await chatHndlr.getConversationList(username);

        return c.json({ message, conversations }, StatusCodes.OK);
    });
    api.get(
        "/message/:senderUsername/:receiverUsername",
        async (c: Context) => {
            const { senderUsername, receiverUsername } = c.req.param();
            const { message, messages } = await chatHndlr.getMessages(
                senderUsername,
                receiverUsername
            );

            return c.json({ message, messages }, StatusCodes.OK);
        }
    );
    api.get("/message/:conversationId", async (c: Context) => {
        const conversationId = c.req.param("conversationId");
        const { message, messages } =
            await chatHndlr.getUserMessages(conversationId);

        return c.json({ message, messages }, StatusCodes.OK);
    });
}

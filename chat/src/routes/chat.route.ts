import { ChatController } from "@chat/controllers/chat.controller";
import express, { Router } from "express";

const router = express.Router();

export function chatRoutes(controller: ChatController): Router {
    router.post("/", controller.addMessage.bind(controller));

    router.put("/offer", controller.updateOffer.bind(controller));
    router.put(
        "/mark-as-read",
        controller.markSingleMessageAsRead.bind(controller)
    );
    router.put(
        "/mark-multiple-as-read",
        controller.markMessagesAsRead.bind(controller)
    );

    router.get(
        "/conversation/:senderUsername/:receiverUsername",
        controller.findConversation.bind(controller)
    );
    router.get(
        "/conversations/:username",
        controller.findConversationList.bind(controller)
    );
    router.get(
        "/:senderUsername/:receiverUsername",
        controller.findMessages.bind(controller)
    );
    router.get(
        "/:conversationId",
        controller.findUserMessages.bind(controller)
    );

    return router;
}

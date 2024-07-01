import express, { Router } from "express";
import { health } from "@chat/controllers/health";

const router = express.Router();

export function healthRoutes(): Router {
    router.get("/chat-health", health);

    return router;
}

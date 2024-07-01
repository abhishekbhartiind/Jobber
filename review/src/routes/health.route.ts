import express, { Router } from "express";
import { health } from "@review/controllers/health";

const router = express.Router();

export function healthRoutes(): Router {
    router.get("/review-health", health);

    return router;
}

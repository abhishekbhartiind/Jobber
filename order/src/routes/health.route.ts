import express, { Router } from "express";
import { health } from "@order/controllers/health";

const router = express.Router();

export function healthRoutes(): Router {
    router.get("/order-health", health);

    return router;
}

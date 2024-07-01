import { health } from "@users/controllers/health";
import express, { Router } from "express";

const router: Router = express.Router();

export function healthRoutes(): Router {
    router.get("/users-health", health);

    return router;
}

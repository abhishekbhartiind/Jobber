import { AuthController } from "@auth/controllers/auth.controller";
import express, { Router } from "express";

const router: Router = express.Router();

export function seedRoutes(controller: AuthController): Router {
    router.put("/seed/:count", controller.seedAuthData.bind(controller));

    return router;
}

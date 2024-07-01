import { AuthController } from "@auth/controllers/auth.controller";
import express, { Router } from "express";

const router: Router = express.Router();

export function searchRoutes(controller: AuthController): Router {
    router.get(
        "/search/gig/:from/:size/:type",
        controller.gigsQuerySearch.bind(controller)
    );
    router.get("/search/gig/:id", controller.getSingleGigById.bind(controller));

    return router;
}

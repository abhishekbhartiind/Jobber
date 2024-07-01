import { GigController } from "@gig/controllers/gig.controller";
import express, { Router } from "express";

const router = express.Router();

export function gigRoutes(controller: GigController): Router {
    router.get("/:gigId", controller.getGigById.bind(controller));
    router.get("/seller/:sellerId", controller.getSellerActiveGigs.bind(controller));
    router.get(
        "/seller/inactive/:sellerId",
        controller.getSellerInactiveGigs.bind(controller)
    );
    router.get("/search/:from/:size/:type", controller.getGigsQuerySearch.bind(controller));
    router.get("/category/:username", controller.getGigsByCategory.bind(controller));
    router.get("/top/:username", controller.getTopRatedGigsByCategory.bind(controller));
    router.get("/similar/:gigId", controller.getGigsMoreLikeThis.bind(controller));
    router.post("/create", controller.addGig.bind(controller));
    router.put("/update/:gigId", controller.updateGig.bind(controller));
    router.put("/status/:gigId", controller.updateActiveStatusGig.bind(controller));
    router.delete("/:gigId/:sellerId", controller.removeGig.bind(controller));

    router.put("/seed/:count", controller.populateGigs.bind(controller));

    return router;
}

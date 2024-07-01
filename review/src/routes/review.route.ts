import { ReviewController } from "@review/controllers/review.controller";
import express, { Router } from "express";

const router = express.Router();

export function reviewRoutes(controller: ReviewController): Router {
    router.get(
        "/seller/:sellerId",
        controller.findReviewsBySellerId.bind(controller)
    );
    router.get("/gig/:gigId", controller.findReviewsByGigId.bind(controller));

    router.post("/", controller.addReview.bind(controller));

    return router;
}

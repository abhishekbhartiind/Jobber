import { SellerController } from "@users/controllers/seller.controller";
import express from "express";

const router = express.Router();

export function sellerRoutes(controller: SellerController) {
    router.get("/id/:sellerId", controller.getSellerById.bind(controller));
    router.get(
        "/username/:username",
        controller.getSellerByUsername.bind(controller)
    );
    router.get("/random/:count", controller.getRandomSellers.bind(controller));
    router.post("/create", controller.createSeller.bind(controller));
    router.put("/seed/:count", controller.populateSeller.bind(controller));
    router.put("/:sellerId", controller.updateSeller.bind(controller));

    return router;
}

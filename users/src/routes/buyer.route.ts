import { BuyerController } from "@users/controllers/buyer.controller";
import express from "express";

const router = express.Router();

export function buyerRoutes(controller: BuyerController) {
    router.get("/email", controller.getBuyerByEmail.bind(controller));
    router.get("/username", controller.getCurrentBuyer.bind(controller));
    router.get("/:username", controller.getBuyerByUsername.bind(controller));

    return router;
}

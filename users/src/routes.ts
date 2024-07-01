import { verifyGatewayRequest } from "@ahgittix/jobber-shared";
import { Application } from "express";
import { buyerRoutes } from "@users/routes/buyer.route";
import { healthRoutes } from "@users/routes/health.route";
import { sellerRoutes } from "@users/routes/seller.route";
import { Logger } from "winston";

import { UsersService } from "./services/users.service";
import { BuyerController } from "./controllers/buyer.controller";
import { SellerController } from "./controllers/seller.controller";

const BUYER_BASE_PATH = "/api/v1/buyer";
const SELLER_BASE_PATH = "/api/v1/seller";

export function appRoutes(
    app: Application,
    logger: (moduleName: string) => Logger
): void {
    const usersSvc = new UsersService(logger);
    const buyerController = new BuyerController(usersSvc.buyerService);
    const sellerController = new SellerController(
        usersSvc.sellerService,
        usersSvc.buyerService
    );

    app.use("", healthRoutes());
    app.use(
        BUYER_BASE_PATH,
        verifyGatewayRequest,
        buyerRoutes(buyerController)
    );
    app.use(
        SELLER_BASE_PATH,
        verifyGatewayRequest,
        sellerRoutes(sellerController)
    );
}

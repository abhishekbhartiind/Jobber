import { Logger } from "winston";

import { BuyerService } from "./buyer.service";
import { SellerService } from "./seller.service";

export class UsersService {
    public buyerService: BuyerService;
    public sellerService: SellerService;
    constructor(logger: (moduleName: string) => Logger) {
        this.buyerService = new BuyerService(logger);
        this.sellerService = new SellerService(this.buyerService, logger);
    }
}

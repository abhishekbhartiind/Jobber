import { BuyerService } from "@users/services/buyer.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class BuyerController {
    constructor(private buyerService: BuyerService) {}

    async getBuyerByEmail(req: Request, res: Response): Promise<void> {
        const buyer = await this.buyerService.getBuyerByEmail(
            req.currentUser!.email
        );

        res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
    }

    async getCurrentBuyer(req: Request, res: Response): Promise<void> {
        const buyer = await this.buyerService.getBuyerByUsername(
            req.currentUser!.username
        );

        res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
    }

    async getBuyerByUsername(req: Request, res: Response): Promise<void> {
        const buyer = await this.buyerService.getBuyerByUsername(
            req.params.username
        );

        res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
    }
}

import {
    BadRequestError,
    uploads,
    ISellerGig,
    ISearchResult,
    IPaginateProps,
    isDataURL
} from "@ahgittix/jobber-shared";
import { exchangeNamesAndRoutingKeys } from "@gig/config";
import { ElasticSearchClient } from "@gig/elasticsearch";
import { GigQueue } from "@gig/queues/gig.queue";
import { GigRedis } from "@gig/redis/gig.redis";
import { gigCreateSchema, gigUpdateSchema } from "@gig/schemas/gig.schema";
import { GigService } from "@gig/services/gig.service";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sortBy } from "lodash";
import { Logger } from "winston";

export class GigController {
    private redisClient: GigRedis;
    constructor(
        private gigService: GigService,
        private elastic: ElasticSearchClient,
        private queue: GigQueue,
        logger: (moduleName: string) => Logger
    ) {
        this.redisClient = new GigRedis(logger)
    }

    async addGig(req: Request, res: Response): Promise<void> {
        const { error } = gigCreateSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Create gig() method"
            );
        }

        const result = (await uploads(
            req.body.coverImage
        )) as UploadApiResponse;

        if (!result?.public_id) {
            throw new BadRequestError(
                "File upload error. Try again.",
                "Create gig() method"
            );
        }
        const documentCount = await this.elastic.getDocumentCount("gigs");

        const gigData: ISellerGig = {
            sellerId: req.body.sellerId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            profilePicture: req.body.profilePicture,
            title: req.body.title,
            description: req.body.description,
            categories: req.body.categories,
            subCategories: req.body.subCategories,
            tags: req.body.tags,
            price: req.body.price,
            expectedDelivery: req.body.expectedDelivery,
            basicTitle: req.body.basicTitle,
            basicDescription: req.body.basicDescription,
            coverImage: `${result?.secure_url}`,
            sortId: documentCount + 1
        };

        const createdGig = await this.gigService.createGig(gigData);

        res.status(StatusCodes.CREATED).json({
            message: "Gig created successfully.",
            gig: createdGig
        });
    }

    async removeGig(req: Request, res: Response): Promise<void> {
        await this.gigService.deleteGig(req.params.gigId, req.params.sellerId);

        res.status(StatusCodes.OK).json({
            message: "Gig deleted successfully."
        });
    }

    async getGigById(req: Request, res: Response): Promise<void> {
        const gig = await this.gigService.getGigById(req.params.gigId);

        res.status(StatusCodes.OK).json({
            message: "Get gig by id",
            gig
        });
    }

    async getSellerActiveGigs(req: Request, res: Response): Promise<void> {
        const gigs = await this.gigService.getSellerActiveGigs(
            req.params.sellerId
        );

        res.status(StatusCodes.OK).json({
            message: "Seller active gigs",
            gigs
        });
    }

    async getSellerInactiveGigs(req: Request, res: Response): Promise<void> {
        const gigs = await this.gigService.getSellerInactiveGigs(
            req.params.sellerId
        );

        res.status(StatusCodes.OK).json({
            message: "Seller inactive gigs",
            gigs
        });
    }

    async getTopRatedGigsByCategory(
        req: Request,
        res: Response
    ): Promise<void> {
        const category = await this.redisClient.getUserSelectedGigCategory(
            `selectedCategories:${req.params.username}`
        );
        const resultHits: ISellerGig[] = [];
        const gigs: ISearchResult =
            await this.gigService.getTopRatedGigsByCategory(`${category}`);

        for (const item of gigs.hits) {
            resultHits.push(item._source as ISellerGig);
        }

        res.status(StatusCodes.OK).json({
            message: "Search top gigs results",
            total: gigs.total,
            gigs: resultHits
        });
    }

    async getGigsByCategory(req: Request, res: Response): Promise<void> {
        const category = await this.redisClient.getUserSelectedGigCategory(
            `selectedCategories:${req.params.username}`
        );
        const resultHits: ISellerGig[] = [];
        const gigs: ISearchResult = await this.gigService.gigsSearchByCategory(
            `${category}`
        );

        for (const item of gigs.hits) {
            resultHits.push(item._source as ISellerGig);
        }

        res.status(StatusCodes.OK).json({
            message: "Search gigs category results",
            total: gigs.total,
            gigs: resultHits
        });
    }

    async getGigsMoreLikeThis(req: Request, res: Response): Promise<void> {
        const resultHits: ISellerGig[] = [];
        const gigs: ISearchResult = await this.gigService.getMoreGigsLikeThis(
            req.params.gigId
        );

        for (const item of gigs.hits) {
            resultHits.push(item._source as ISellerGig);
        }

        res.status(StatusCodes.OK).json({
            message: "Search gigs more like this results",
            total: gigs.total,
            gigs: resultHits
        });
    }

    async getGigsQuerySearch(req: Request, res: Response): Promise<void> {
        const { from, size, type } = req.params;
        let resultHits: ISellerGig[] = [];
        const paginate: IPaginateProps = {
            from,
            size: parseInt(`${size}`),
            type
        };
        const {
            query,
            delivery_time,
            minprice,
            minPrice,
            maxprice,
            maxPrice,
            min,
            max
        } = req.query;

        const MIN_PRICE = String(minprice || minPrice || min);
        const MAX_PRICE = String(maxprice || maxPrice || max);
        const gigs: ISearchResult = await this.gigService.gigsSearch(
            String(query),
            paginate,
            parseInt(MIN_PRICE, 10),
            parseInt(MAX_PRICE, 10),
            String(delivery_time)
        );

        for (const item of gigs.hits) {
            resultHits.push(item._source as ISellerGig);
        }

        if (type === "backward") {
            resultHits = sortBy(resultHits, ["sortId"]);
        }

        res.status(StatusCodes.OK).json({
            message: "Search gigs results",
            total: gigs.total,
            gigs: resultHits
        });
    }

    async updateGig(req: Request, res: Response): Promise<void> {
        const { error } = gigUpdateSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Update gig() method"
            );
        }

        // check if base64
        // if yes then user uploading a new image
        // if no then image is not changing
        const isNewImage = isDataURL(req.body.coverImage);
        let coverImage = req.body.coverImage;

        if (isNewImage) {
            const result = (await uploads(
                req.body.coverImage
            )) as UploadApiResponse;

            if (!result?.public_id) {
                throw new BadRequestError(
                    "File upload error. Try again.",
                    "Update gig() method"
                );
            }

            coverImage = result?.secure_url;
        }

        const gigData: ISellerGig = {
            title: req.body.title,
            description: req.body.description,
            categories: req.body.categories,
            subCategories: req.body.subCategories,
            tags: req.body.tags,
            price: req.body.price,
            expectedDelivery: req.body.expectedDelivery,
            basicTitle: req.body.basicTitle,
            basicDescription: req.body.basicDescription,
            coverImage
        };

        const updatedGig = await this.gigService.updateGig(
            req.params.gigId,
            gigData
        );

        res.status(StatusCodes.OK).json({
            message: "Gig updated successfully.",
            gig: updatedGig
        });
    }

    async updateActiveStatusGig(req: Request, res: Response): Promise<void> {
        const updatedGig = await this.gigService.updateActiveGigProp(
            req.params.gigId,
            req.body.active
        );

        res.status(StatusCodes.OK).json({
            message: "Gig active status updated successfully.",
            gig: updatedGig
        });
    }

    async populateGigs(req: Request, res: Response): Promise<void> {
        const count = req.params.count;
        const { gigService } = exchangeNamesAndRoutingKeys;

        await this.queue.publishDirectMessage(
            gigService.getSellers.exchangeName,
            gigService.getSellers.routingKey,
            JSON.stringify({ type: "getSellers", count }),
            "Gig seed message sent to users service."
        );

        res.status(StatusCodes.CREATED).json({
            message: "Seed gigs successfully.",
            total: count
        });
    }
}

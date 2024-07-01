import {
    IHitsTotal,
    IPaginateProps,
    IQueryList,
    ISearchResult,
    ISellerGig
} from "@ahgittix/jobber-shared";
import { ElasticSearchClient } from "@auth/elasticsearch";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { Logger } from "winston";

export class UnauthSearchService {
    constructor(
        private elastic: ElasticSearchClient,
        private logger: (moduleName: string) => Logger
    ) {}

    async getGigById(index: string, id: string): Promise<ISellerGig> {
        const gig = await this.elastic.getDocumentById(index, id);

        return gig;
    }

    async gigsSearch(
        searchQuery: string,
        paginate: IPaginateProps,
        min: number,
        max: number,
        deliveryTime?: string
    ): Promise<ISearchResult> {
        const { from, size, type } = paginate;
        // try it on elasticsearch dev tools
        const queryList: IQueryList[] = [
            {
                query_string: {
                    fields: [
                        "username",
                        "title",
                        "description",
                        "basicDescription",
                        "basicTitle",
                        "categories",
                        "subCategories",
                        "tags"
                    ],
                    query: `*${searchQuery}*`
                }
            },
            {
                term: {
                    active: true
                }
            }
        ];
        if (deliveryTime && deliveryTime != "undefined") {
            queryList.push({
                query_string: {
                    fields: ["expectedDelivery"],
                    query: `*${deliveryTime}*`
                }
            });
        }

        if (!isNaN(min) && !isNaN(max)) {
            queryList.push({
                range: {
                    price: {
                        gte: min,
                        lte: max
                    }
                }
            });
        }

        try {
            const result: SearchResponse = await this.elastic.client.search({
                index: "gigs",
                size,
                query: {
                    bool: {
                        must: queryList
                    }
                },
                sort: [
                    {
                        sortId: type === "forward" ? "asc" : "desc"
                    }
                ],
                // startFrom for pagination
                ...(from !== "0" && { search_after: [from] })
            });

            const total: IHitsTotal = result.hits.total as IHitsTotal;
            const hits = result.hits.hits;

            return { total: total.value, hits };
        } catch (error) {
            this.logger("services/search.service.ts - gigsSearch()").error(
                "AuthService gigsSearch() method error:",
                error
            );
            return { total: 0, hits: [] };
        }
    }
}

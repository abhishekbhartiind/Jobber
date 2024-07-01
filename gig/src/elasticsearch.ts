import { Client } from "@elastic/elasticsearch";
import { ISellerGig } from "@ahgittix/jobber-shared";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@gig/config";
import { Logger } from "winston";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/typesWithBodyKey";

export class ElasticSearchClient {
    private client: Client;
    constructor(private logger: (moduleName: string) => Logger) {
        this.client = new Client({
            node: `${ELASTIC_SEARCH_URL}`
        });
    }

    async checkConnection(): Promise<void> {
        let isConnected = false;
        while (!isConnected) {
            this.logger("elasticsearch.ts - checkConnection()").info(
                "GigService connecting to Elasticsearch..."
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `GigService Elasticsearch health status - ${health.status}`
                );
                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to Elasticsearch failed. Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "GigService checkConnection() method error:",
                    error
                );
            }
        }

        this.closeConnection(this.client);
    }

    async runQuery(query: any): Promise<SearchResponse> {
        return await this.client.search(query);
    }

    async checkExistingIndex(indexName: string): Promise<boolean> {
        const result: boolean = await this.client.indices.exists({
            index: indexName
        });

        return result;
    }

    async createIndex(indexName: string): Promise<void> {
        try {
            const existingIndex: boolean =
                await this.checkExistingIndex(indexName);
            if (existingIndex) {
                this.logger("elasticsearch.ts - createIndex()").info(
                    `Index ${indexName} already exist in Elasticsearch.`
                );
            } else {
                await this.client.indices.create({ index: indexName });

                // refreshing document
                // so we can access the document right after creating an index
                await this.client.indices.refresh({ index: indexName });

                this.logger("elasticsearch.ts - createIndex()").info(
                    `Created index ${indexName} in Elasticsearch`
                );
            }
        } catch (error) {
            this.logger("elasticsearch.ts - createIndex()").error(
                `An error occured while creating the index ${indexName}`
            );
            this.logger("elasticsearch.ts - createIndex()").error(
                "GigService createIndex() method error:",
                error
            );
        }
    }

    async getDocumentCount(index: string): Promise<number> {
        try {
            const result = await this.client.count({ index });

            return result.count;
        } catch (error) {
            this.logger("elasticsearc.ts - getDocumentCount()").error(
                "GigService elasticsearch getDocumentCount() method error:",
                error
            );
            return 0;
        }
    }

    async getIndexedData(index: string, itemId: string): Promise<ISellerGig> {
        try {
            const result = await this.client.get({ index, id: itemId });

            return result?._source as ISellerGig;
        } catch (error) {
            this.logger("elasticsearch.ts - getIndexedData()").error(
                "GigService elasticsearch getIndexedData() method error:",
                error
            );
            return {} as ISellerGig;
        }
    }

    async addDataToIndex(
        index: string,
        itemId: string,
        document: ISellerGig
    ): Promise<void> {
        try {
            await this.client.index({ index, id: itemId, document });
        } catch (error) {
            this.logger("elasticsearch.ts - addDataToIndex()").error(
                "GigService elasticsearch addDataToIndex() method error:",
                error
            );
        }
    }

    async updateIndexedData(
        index: string,
        itemId: string,
        document: unknown
    ): Promise<void> {
        try {
            await this.client.update({ index, id: itemId, doc: document });
        } catch (error) {
            this.logger("elasticsearch.ts - updateIndexedData()").error(
                "GigService elasticsearch updateIndexedData() method error:",
                error
            );
        }
    }

    async deleteIndexedData(index: string, itemId: string): Promise<void> {
        try {
            await this.client.delete({ index, id: itemId });
        } catch (error) {
            this.logger("elasticsearch.ts - deleteIndexedData()").error(
                "GigService elasticsearch deleteIndexedData() method error:",
                error
            );
        }
    }

    closeConnection(client: Client): void {
        process.once("exit", async() => {
            await client.close();
        })
    }
}

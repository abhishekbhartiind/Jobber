import { Client } from "@elastic/elasticsearch";
import { ISellerGig } from "@ahgittix/jobber-shared";
import {
    ClusterHealthResponse,
    GetResponse
} from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@auth/config";
import { Logger } from "winston";

export class ElasticSearchClient {
    public client: Client;
    constructor(private logger: (moduleName: string) => Logger) {
        this.client = new Client({
            node: `${ELASTIC_SEARCH_URL}`
        });
    }

    async checkConnection(): Promise<void> {
        let isConnected = false;
        while (!isConnected) {
            this.logger("elasticsearch.ts - checkConnection()").info(
                "AuthService connecting to Elasticsearch..."
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `AuthService Elasticsearch health status - ${health.status}`
                );
                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to Elasticsearch failed. Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "AuthService checkConnection() method error:",
                    error
                );
            }
        }
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
                "AuthService createIndex() method error:",
                error
            );
        }
    }

    async getDocumentById(index: string, id: string): Promise<ISellerGig> {
        try {
            const result: GetResponse = await this.client.get({
                index,
                id
            });

            return result._source as ISellerGig;
        } catch (error) {
            this.logger("elasticsearch.ts - getDocumentById()").error(
                "AuthService getDocumentById() method error:",
                error
            );
            return {} as ISellerGig;
        }
    }
}

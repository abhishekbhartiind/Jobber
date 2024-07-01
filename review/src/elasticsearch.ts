import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@review/config";
import { Logger } from "winston";

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
                "ReviewService connecting to Elasticsearch..."
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `ReviewService Elasticsearch health status - ${health.status}`
                );

                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to Elasticsearch failed. Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "ReviewService checkConnection() method error:",
                    error
                );
            }
        }
    }

    async closeConnection(): Promise<void> {
        await this.client.close();
    }
}

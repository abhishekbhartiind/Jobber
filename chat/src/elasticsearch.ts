import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@chat/config";
import { Logger } from "winston";

export class ElasicSearchClient {
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
                "ChatService connecting to Elasticsearch..."
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `ChatService Elasticsearch health status - ${health.status}`
                );

                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to Elasticsearch failed. Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "ChatService checkConnection() method error:",
                    error
                );
            }
        }
    }
}

import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { ELASTIC_SEARCH_URL } from "@users/config";
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
                "UsersService connecting to Elasticsearch..."
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});

                this.logger("elasticsearch.ts - checkConnection()").info(
                    `UsersService Elasticsearch health status - ${health.status}`
                );
                isConnected = true;
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to Elasticsearch failed. Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "UsersService checkConnection() method error:",
                    error
                );
            }
        }
    }
}

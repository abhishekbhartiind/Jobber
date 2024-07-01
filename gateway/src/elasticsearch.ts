import { ELASTIC_SEARCH_URL } from "@gateway/config";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { Logger } from "winston";

export class ElasticSearchClient {
    private client: Client;

    constructor(private logger: (moduleName: string) => Logger) {
        this.client = new Client({
            node: `${ELASTIC_SEARCH_URL}`
        });
    }

    public async checkConnection(): Promise<void> {
        let isConnected = false;
        while (!isConnected) {
            this.logger("elasticsearch.ts - checkConnection()").info(
                "GatewayService Connecting to ElasticSearch"
            );
            try {
                const health: ClusterHealthResponse =
                    await this.client.cluster.health({});
                this.logger("elasticsearch.ts - checkConnection()").info(
                    `GatewayService ElasticSearch health status - ${health.status}`
                );

                if (health.status !== "RED") {
                    isConnected = true;
                }
            } catch (error) {
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "Connection to ElasticSearch failed, Retrying..."
                );
                this.logger("elasticsearch.ts - checkConnection()").error(
                    "GatewayService checkConnection() method error:",
                    error
                );
            }
        }
    }
}

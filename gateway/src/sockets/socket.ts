import {
    IMessageDocument,
    IOrderDocument,
    IOrderNotifcation
} from "@ahgittix/jobber-shared";
import { MESSAGE_BASE_URL, ORDER_BASE_URL } from "@gateway/config";
import { RedisClient } from "@gateway/redis/gateway.redis";
import { Server, Socket } from "socket.io";
import { io, Socket as SocketClient } from "socket.io-client";
import { Logger } from "winston";

let chatSocketClient: SocketClient;
let orderSocketClient: SocketClient;

export class SocketIOAppHandler {
    private io: Server;

    constructor(
        io: Server,
        private redis: RedisClient,
        private logger: (moduleName: string) => Logger
    ) {
        this.io = io;
    }

    // Listening event from Front End
    public listen(): void {
        this.chatSocketServerIOConnection();
        this.orderSocketServerIOConnection();

        this.io.on("connection", async (socket: Socket) => {
            socket.on("getLoggedInUsers", async () => {
                const response =
                    await this.redis.getLoggedInUsersFromCache(
                        "loggerInUsers"
                    );

                // send to Frontend
                this.io.emit("online", response);
            });

            socket.on("loggerInUsers", async (username: string) => {
                const response = await this.redis.saveLoggedInUserToCache(
                    "loggerInUsers",
                    username
                );

                // send to Frontend
                this.io.emit("online", response);
            });

            socket.on("removeLoggedInUsers", async (username: string) => {
                const response = await this.redis.removeLoggedInUserFromCache(
                    "loggerInUsers",
                    username
                );

                // send to Frontend
                this.io.emit("online", response);
            });

            socket.on(
                "category",
                async (category: string, username: string) => {
                    await this.redis.saveUserSelectedCategory(
                        `selectedCategories:${username}`,
                        category
                    );
                }
            );
        });
    }

    // Listening event from another chat service
    private chatSocketServerIOConnection(): void {
        chatSocketClient = io(`${MESSAGE_BASE_URL}`, {
            transports: ["polling", "websocket"],
            secure: true,
            withCredentials: true,
            reconnection: false
        });

        chatSocketClient.on("connect", () => {
            this.logger(
                "sockets/socket.ts - chatSocketServerIOConnection()"
            ).info(
                "Socket connection to ChatService is successfully established"
            );
        });

        chatSocketClient.on(
            "disconnect",
            (reason: SocketClient.DisconnectReason) => {
                this.logger(
                    "sockets/socket.ts - chatSocketServerIOConnection()"
                ).error("Chat Socket disconnect reason:", reason);
            }
        );

        chatSocketClient.on("connect_error", (error: any) => {
            // this.logger(
            //     "sockets/socket.ts - chatSocketServerIOConnection()"
            // ).error("Chat Socket connection error:", error);

            console.log(error.name);
            console.log(error.description);
            console.log(error.context);
        });

        // Custom Events
        chatSocketClient.on("message_received", (data: IMessageDocument) => {
            this.io.emit("message_received", data);
        });

        chatSocketClient.on("message_updated", (data: IMessageDocument) => {
            this.io.emit("message_updated", data);
        });
    }

    // Listening event from order service
    private orderSocketServerIOConnection(): void {
        orderSocketClient = io(`${ORDER_BASE_URL}`, {
            transports: ["polling", "websocket"],
            secure: true,
            withCredentials: true,
            reconnection: false,
        });

        orderSocketClient.on("connect", () => {
            this.logger(
                "sockets/socket.ts - orderSocketServerIOConnection()"
            ).info(
                "Socket connection to OrderService is successfully established"
            );
        });

        orderSocketClient.on(
            "disconnect",
            (reason: SocketClient.DisconnectReason) => {
                this.logger(
                    "sockets/socket.ts - orderSocketServerIOConnection()"
                ).error("Order Socket disconnect reason:", reason);
            }
        );

        orderSocketClient.on("connect_error", (error: any) => {
            console.log(error.name);
            console.log(error.description);
            console.log(error.context);
        });

        // Custom events
        orderSocketClient.on(
            "order_notification",
            (order: IOrderDocument, orderNotification: IOrderNotifcation) => {
                this.io.emit("order_notification", order, orderNotification);
            }
        );
    }
}

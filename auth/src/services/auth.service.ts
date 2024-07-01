import {
    IAuthBuyerMessageDetails,
    IAuthDocument,
    firstLetterUppercase,
    lowerCase
} from "@ahgittix/jobber-shared";
import {
    JWT_TOKEN,
    buyerServiceExchangeNamesAndRoutingKeys
} from "@auth/config";
import { AuthModel } from "@auth/models/auth.model";
import { AuthQueue } from "@auth/queues/auth.queue";
import { sign } from "jsonwebtoken";
import { omit } from "lodash";
import { Op } from "sequelize";
import { Logger } from "winston";

export class AuthService {
    constructor(
        private queue: AuthQueue,
        private logger: (moduleName: string) => Logger
    ) {}

    async createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
        try {
            const result = await AuthModel.create(data);
            const messageDetails: IAuthBuyerMessageDetails = {
                username: result.dataValues.username,
                email: result.dataValues.email,
                country: result.dataValues.country,
                profilePicture: result.dataValues.profilePicture,
                createdAt: result.dataValues.createdAt,
                type: "auth"
            };

            const { buyer } = buyerServiceExchangeNamesAndRoutingKeys;
            await this.queue.publishDirectMessage(
                buyer.exchangeName,
                buyer.routingKey,
                JSON.stringify(messageDetails),
                "Buyer details sent to users service (buyer)."
            );

            const userData = omit(result.dataValues, [
                "password"
            ]) as IAuthDocument;

            return userData;
        } catch (error) {
            this.logger("services/auth.service.ts - createAuthUser()").error(
                "AuthService createAuthUser() method error",
                error
            );
            throw new Error("Unexpected error occured. Please try again.");
        }
    }

    async getAuthUserById(id: number): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: { id },
            attributes: {
                exclude: ["password"]
            }
        });

        return user?.dataValues;
    }

    async getUserByUsernameOrEmail(
        username: string,
        email: string
    ): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: {
                [Op.or]: [
                    {
                        username: firstLetterUppercase(username)
                    },
                    {
                        email: lowerCase(email)
                    }
                ]
            },
            attributes: {
                exclude: ["password"]
            }
        });

        return user?.dataValues;
    }

    async getUserByUsername(
        username: string
    ): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: {
                username: firstLetterUppercase(username)
            }
        });

        return user?.dataValues;
    }

    async getUserByEmail(email: string): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: {
                email: lowerCase(email)
            }
        });

        return user?.dataValues;
    }

    async getAuthUserByVerificationToken(
        token: string
    ): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: {
                emailVerificationToken: token
            },
            attributes: {
                exclude: ["password"]
            }
        });

        return user?.dataValues;
    }

    async getAuthUserByPasswordToken(
        token: string
    ): Promise<IAuthDocument | undefined> {
        const user = await AuthModel.findOne({
            where: {
                [Op.or]: [
                    {
                        passwordResetToken: token
                    },
                    {
                        passwordResetExpires: { [Op.gt]: new Date() }
                    }
                ]
            }
        });

        return user?.dataValues;
    }

    async updateVerifyEmail(
        id: number,
        emailVerified: number,
        emailVerificationToken?: string
    ): Promise<void> {
        try {
            await AuthModel.update(
                !emailVerificationToken
                    ? {
                          emailVerified
                      }
                    : {
                          emailVerified,
                          emailVerificationToken
                      },
                {
                    where: { id }
                }
            );
        } catch (error) {
            this.logger("services/auth.service.ts - updateVerifyEmail()").error(
                "AuthService updateVerifyEmail() method error",
                error
            );
            throw error;
        }
    }

    async updatePasswordToken(
        id: number,
        token: string,
        tokenExpiration: Date
    ): Promise<void> {
        try {
            await AuthModel.update(
                {
                    passwordResetToken: token,
                    passwordResetExpires: tokenExpiration
                },
                {
                    where: { id }
                }
            );
        } catch (error) {
            this.logger(
                "services/auth.service.ts - updatePasswordToken()"
            ).error("AuthService updatePasswordToken() method error", error);
        }
    }

    async updatePassword(id: number, password: string): Promise<void> {
        try {
            await AuthModel.update(
                {
                    password,
                    passwordResetToken: "",
                    passwordResetExpires: new Date()
                },
                {
                    where: { id }
                }
            );
        } catch (error) {
            this.logger("services/auth.service.ts - updatePassword()").error(
                "AuthService updatePassword() method error",
                error
            );
            throw error;
        }
    }

    signToken(id: number, email: string, username: string): string {
        return sign(
            {
                id,
                email,
                username
            },
            JWT_TOKEN!,
            {
                algorithm: "HS512",
                issuer: "Jobber Auth",
                expiresIn: "1d"
            }
        );
    }
}

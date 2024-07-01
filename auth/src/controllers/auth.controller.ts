import crypto from "crypto";

import {
    BadRequestError,
    firstLetterUppercase,
    IAuthDocument,
    IEmailMessageDetails,
    IPaginateProps,
    ISearchResult,
    isEmail,
    lowerCase,
    NotFoundError,
    uploads
} from "@ahgittix/jobber-shared";
import {
    CLIENT_URL,
    notificationServiceExchangeNamesAndRoutingKeys
} from "@auth/config";
import { AuthModel } from "@auth/models/auth.model";
import { AuthQueue } from "@auth/queues/auth.queue";
import { signInSchema } from "@auth/schemas/signin";
import { signUpSchema } from "@auth/schemas/signup";
import { AuthService } from "@auth/services/auth.service";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit, sample, sortBy } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { generateUsername } from "unique-username-generator";
import { faker } from "@faker-js/faker";
import {
    changePasswordSchema,
    emailSchema,
    resetPasswordSchema
} from "@auth/schemas/password";
import { UnauthSearchService } from "@auth/services/search.service";

export class AuthController {
    private authModel: AuthModel;
    constructor(
        private queue: AuthQueue,
        private authService: AuthService,
        private searchService: UnauthSearchService
    ) {
        this.authModel = new AuthModel();
    }

    // search feature for unauth user
    async gigsQuerySearch(req: Request, res: Response): Promise<void> {
        const { from, size, type } = req.params;
        let resultHits: unknown[] = [];
        const paginate: IPaginateProps = {
            from,
            size: parseInt(size),
            type
        };
        const { query, delivery_time, min, max } = req.query;

        const gigs: ISearchResult = await this.searchService.gigsSearch(
            query?.toString() ?? "",
            paginate,
            parseInt(min?.toString() ?? "0"),
            parseInt(max?.toString() ?? "999"),
            delivery_time?.toString()
        );

        for (const item of gigs.hits) {
            resultHits.push(item._source);
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

    async getSingleGigById(req: Request, res: Response): Promise<void> {
        const gig = await this.searchService.getGigById("gigs", req.params.id);

        res.status(StatusCodes.OK).json({ message: "Single gig result", gig });
    }

    async signIn(req: Request, res: Response): Promise<void> {
        const { error } = signInSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "signIn signIn() method error"
            );
        }

        const { username, password } = req.body;
        const isValidEmail = isEmail(username);
        const existingUser = isValidEmail
            ? await this.authService.getUserByEmail(username)
            : await this.authService.getUserByUsername(username);

        if (!existingUser) {
            throw new BadRequestError(
                "Invalid credentials",
                "signIn signIn() method error"
            );
        }

        const passwordMatch = await this.authModel.comparePassword(
            password,
            existingUser.password!
        );

        if (!passwordMatch) {
            throw new BadRequestError(
                "Invalid credentials",
                "signIn signIn() method error"
            );
        }

        const userJWT = this.authService.signToken(
            existingUser.id!,
            existingUser.email!,
            existingUser.username!
        );
        const userData = omit(existingUser, ["password"]);

        res.status(StatusCodes.OK).json({
            message: "User sign in successfully",
            user: userData,
            token: userJWT
        });
    }

    async signUp(req: Request, res: Response): Promise<void> {
        const { error } = signUpSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "signUp signUp() method error"
            );
        }

        const { username, email, password, country, profilePicture } = req.body;
        const checkIfUserExist =
            await this.authService.getUserByUsernameOrEmail(username, email);

        if (checkIfUserExist) {
            throw new BadRequestError(
                "Invalid credentials. Email or Username",
                "signUp create() method error"
            );
        }

        const profilePublicId = uuidv4();
        const uploadResult = (await uploads(
            profilePicture,
            profilePublicId,
            true,
            true
        )) as UploadApiResponse;

        if (!uploadResult.public_id) {
            throw new BadRequestError(
                "File upload error. Try again",
                "signUp create() method error"
            );
        }

        const randomBytes: Buffer = crypto.randomBytes(20);
        const randomCharacters: string = randomBytes.toString("hex");
        const authData: IAuthDocument = {
            username: firstLetterUppercase(username),
            email: lowerCase(email),
            profilePublicId,
            password,
            country,
            profilePicture: uploadResult?.secure_url,
            emailVerificationToken: randomCharacters
        };
        const result: IAuthDocument =
            await this.authService.createAuthUser(authData);
        const verificationLink = `${CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
        const messageDetails: IEmailMessageDetails = {
            receiverEmail: result.email,
            verifyLink: verificationLink,
            template: "verifyEmail"
        };

        // publish to 2-notification-service > consumeAuthEmailMessages
        const { exchangeName, routingKey } =
            notificationServiceExchangeNamesAndRoutingKeys.email;
        this.queue.publishDirectMessage(
            exchangeName,
            routingKey,
            JSON.stringify(messageDetails),
            "Verify email message has been sent to notification service."
        );

        const userJwt: string = this.authService.signToken(
            result.id!,
            result.email!,
            result.username!
        );

        res.status(StatusCodes.CREATED).json({
            message: "User created successfully",
            user: result,
            token: userJwt
        });
    }

    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            const checkIfUserExist =
                await this.authService.getAuthUserByVerificationToken(token);
            if (!checkIfUserExist) {
                throw new BadRequestError(
                    "Verification token is either invalid or already used.",
                    "verifyEmail verifyEmail() method error"
                );
            }

            await this.authService.updateVerifyEmail(checkIfUserExist.id!, 1);
            const updatedUser = await this.authService.getAuthUserById(
                checkIfUserExist.id!
            );

            res.status(StatusCodes.OK).json({
                message: "Email verified successfully.",
                user: updatedUser
            });
        } catch (error) {
            if (error) {
                throw error;
            }

            throw new BadRequestError(
                "There is an error from server. Please try Resend Email again",
                "verifyEmail verifyEmail() method error"
            );
        }
    }

    async getRefreshToken(req: Request, res: Response): Promise<void> {
        const existingUser = await this.authService.getUserByUsername(
            req.params.username
        );

        if (!existingUser) {
            throw new NotFoundError(
                "User is not found.",
                "Password resetPassword() method error"
            );
        }

        const userJWT: string = this.authService.signToken(
            existingUser.id!,
            existingUser.email!,
            existingUser.username!
        );

        res.status(StatusCodes.OK).json({
            message: "Refresh token generated",
            user: existingUser,
            token: userJWT
        });
    }

    async getCurrentUser(req: Request, res: Response): Promise<void> {
        let user = null;
        const existingUser = await this.authService.getAuthUserById(
            req.currentUser!.id
        );

        if (!existingUser) {
            throw new NotFoundError(
                "User is not found",
                "CurrentUser getCurrentUser() method error"
            );
        }

        if (Object.keys(existingUser).length) {
            user = existingUser;
        }

        res.status(StatusCodes.OK).json({
            message: "Authenticated user",
            user
        });
    }

    async resendVerificationEmail(req: Request, res: Response): Promise<void> {
        const { email } = req.body;
        const checkIfUserExist = await this.authService.getUserByEmail(email);

        if (!checkIfUserExist) {
            throw new NotFoundError(
                "Email is invalid",
                "currentUser resendVerificationEmail() method error"
            );
        }

        const randomBytes: Buffer = await Promise.resolve(
            crypto.randomBytes(20)
        );
        const randomCharacters: string = randomBytes.toString("hex");
        const verificationLink = `${CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;

        await this.authService.updateVerifyEmail(
            checkIfUserExist.id!,
            0,
            randomCharacters
        );

        const messageDetails: IEmailMessageDetails = {
            receiverEmail: lowerCase(email),
            verifyLink: verificationLink,
            template: "verifyEmail"
        };

        const { exchangeName, routingKey } =
            notificationServiceExchangeNamesAndRoutingKeys.email;
        this.queue.publishDirectMessage(
            exchangeName,
            routingKey,
            JSON.stringify(messageDetails),
            "Verify email message has been sent to notification service."
        );

        const updatedUser = await this.authService.getAuthUserById(
            checkIfUserExist.id!
        );

        res.status(StatusCodes.OK).json({
            message: "Email verification has been sent",
            user: updatedUser
        });
    }

    async sendForgotPasswordLinkToEmailUser(
        req: Request,
        res: Response
    ): Promise<void> {
        const { error } = emailSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Password sendForgotPasswordLinkToEmailUser() method error"
            );
        }

        const { email } = req.body;
        const existingUser = await this.authService.getUserByEmail(email);

        if (!existingUser) {
            throw new NotFoundError(
                "Invalid credentials",
                "Password sendForgotPasswordLinkToEmailUser() method error"
            );
        }

        const randomBytes: Buffer = crypto.randomBytes(20);
        const randomCharacters: string = randomBytes.toString("hex");
        const date = new Date();
        date.setHours(date.getHours() + 1);
        await this.authService.updatePasswordToken(
            existingUser.id!,
            randomCharacters,
            date
        );

        // publish to 2-notification-service > consumeAuthEmailMessages
        const resetLink = `${CLIENT_URL}/reset_password?token=${randomCharacters}`;
        const messageDetails: IEmailMessageDetails = {
            receiverEmail: existingUser.email!,
            resetLink,
            username: existingUser.username!,
            template: "forgotPassword"
        };
        const { exchangeName, routingKey } =
            notificationServiceExchangeNamesAndRoutingKeys.email;
        this.queue.publishDirectMessage(
            exchangeName,
            routingKey,
            JSON.stringify(messageDetails),
            "Forgot password message has been sent to notification service."
        );

        res.status(StatusCodes.OK).json({
            message: "Password reset password has been sent."
        });
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        const { error } = resetPasswordSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Password resetPassword() method error"
            );
        }

        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            throw new BadRequestError(
                "Passwords not match",
                "Password resetPassword() method error"
            );
        }

        const { token } = req.params;

        const existingUser =
            await this.authService.getAuthUserByPasswordToken(token);

        if (!existingUser) {
            throw new NotFoundError(
                "Reset token has expired.",
                "Password resetPassword() method error"
            );
        }

        const hashedPassword = await this.authModel.hashPassword(password);
        await this.authService.updatePassword(existingUser.id!, hashedPassword);

        // publish to 2-notification-service > consumeAuthEmailMessages
        const messageDetails: IEmailMessageDetails = {
            username: existingUser.username!,
            receiverEmail: existingUser.email!,
            template: "resetPasswordSuccess"
        };
        const { exchangeName, routingKey } =
            notificationServiceExchangeNamesAndRoutingKeys.email;
        this.queue.publishDirectMessage(
            exchangeName,
            routingKey,
            JSON.stringify(messageDetails),
            "Reset password success message has been sent to notification service."
        );

        res.status(StatusCodes.OK).json({
            message: "Password successfully updated."
        });
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const { error } = changePasswordSchema.validate(req.body);

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Password changePassword() method error"
            );
        }

        const { currentPassword, newPassword } = req.body;

        const existingUser = await this.authService.getUserByUsername(
            req.currentUser!.username
        );

        if (!existingUser) {
            throw new NotFoundError(
                "User is not found",
                "Password changePassword() method error"
            );
        }

        const isValidPassword: boolean = await this.authModel.comparePassword(
            currentPassword,
            existingUser.password ?? ""
        );

        if (!isValidPassword) {
            throw new BadRequestError(
                "Invalid password.",
                "Password changePassword() method error"
            );
        }

        const hashedPassword = await this.authModel.hashPassword(newPassword);
        await this.authService.updatePassword(existingUser.id!, hashedPassword);

        // publish to 2-notification-service > consumeAuthEmailMessages
        const messageDetails: IEmailMessageDetails = {
            username: existingUser.username!,
            receiverEmail: existingUser.email!,
            template: "resetPasswordSuccess"
        };
        const { exchangeName, routingKey } =
            notificationServiceExchangeNamesAndRoutingKeys.email;
        this.queue.publishDirectMessage(
            exchangeName,
            routingKey,
            JSON.stringify(messageDetails),
            "Password change success message has been sent to notification service."
        );

        res.status(StatusCodes.OK).json({
            message: "Password successfully updated."
        });
    }

    async seedAuthData(req: Request, res: Response): Promise<void> {
        const { count } = req.params;
        const usernames: string[] = [];

        for (let i = 0; i < parseInt(count, 10); i++) {
            const name: string = generateUsername("", 0, 12);
            usernames.push(firstLetterUppercase(name));
        }

        for (let i = 0; i < usernames.length; i++) {
            const username = usernames[i];
            const email = faker.internet.email();
            const password = "jobberuser";
            const country = faker.location.country();
            const profilePicture = faker.image.urlPicsumPhotos();

            const checkIfUserExist =
                await this.authService.getUserByUsernameOrEmail(
                    username,
                    email
                );

            if (checkIfUserExist) {
                throw new BadRequestError(
                    "Invalid credentials. Email or Username",
                    "Seed generate() method error"
                );
            }

            const profilePublicId = uuidv4();
            const randomBytes: Buffer = crypto.randomBytes(20);
            const randomCharacters: string = randomBytes.toString("hex");
            const authData: IAuthDocument = {
                username: username,
                email: lowerCase(email),
                profilePublicId,
                password,
                country,
                profilePicture,
                emailVerificationToken: randomCharacters,
                emailVerified: sample([0, 1])
            };

            this.authService.createAuthUser(authData);
        }

        res.status(StatusCodes.OK).json({
            message: "Seed users created successfully",
            total: count
        });
    }
}

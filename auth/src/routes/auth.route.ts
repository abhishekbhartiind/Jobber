import { AuthController } from "@auth/controllers/auth.controller";
import express, { Router } from "express";

const router: Router = express.Router();

export function authRoutes(controller: AuthController): Router {
    router.get("/current-user", controller.getCurrentUser.bind(controller));
    router.get(
        "/refresh-token/:username",
        controller.getRefreshToken.bind(controller)
    );
    router.post(
        "/resend-verification-email",
        controller.resendVerificationEmail.bind(controller)
    );
    router.post("/signup", controller.signUp.bind(controller));
    router.post("/signin", controller.signIn.bind(controller));
    router.put("/verify-email", controller.verifyEmail.bind(controller));
    router.put(
        "/forgot-password",
        controller.sendForgotPasswordLinkToEmailUser.bind(controller)
    );
    router.put(
        "/reset-password/:token",
        controller.resetPassword.bind(controller)
    );
    router.put("/change-password", controller.changePassword.bind(controller));

    return router;
}

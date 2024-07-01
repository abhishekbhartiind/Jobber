import j, { ObjectSchema } from "joi";

export const emailSchema: ObjectSchema = j.object().keys({
    email: j.string().email().required().messages({
        "string.base": "Field must be valid",
        "string.required": "Field must be valid",
        "string.email": "Field must be valid"
    })
});

export const resetPasswordSchema: ObjectSchema = j.object().keys({
    password: j.string().required().min(4).max(12).messages({
        "string.base": "Password should be of type string",
        "string.min": "Invalid password",
        "string.max": "Invalid password",
        "string.empty": "Password is a required field"
    }),
    confirmPassword: j.string().required().valid(j.ref("password")).messages({
        "any.only": "Passwords should match",
        "any.required": "Confirm password is a required field"
    })
});

export const changePasswordSchema: ObjectSchema = j.object().keys({
    currentPassword: j.string().required().min(4).max(12).messages({
        "string.base": "Current Password should be of type string",
        "string.min": "Invalid password",
        "string.max": "Invalid password",
        "string.empty": "Current Password is a required field"
    }),
    newPassword: j.string().required().min(4).max(12).messages({
        "string.base": "New Password should be of type string",
        "string.min": "Invalid password",
        "string.max": "Invalid password",
        "string.empty": "New Password is a required field"
    })
});

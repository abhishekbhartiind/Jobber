import j, { ObjectSchema } from "joi";

export const signUpSchema: ObjectSchema = j.object().keys({
    username: j.string().min(4).max(12).required().messages({
        "string.base": "Username must be of type string",
        "string.min": "Invalid username",
        "string.max": "Invalid username",
        "string.empty": "Username is a required field"
    }),
    password: j.string().min(4).max(12).required().messages({
        "string.base": "Password must be of type string",
        "string.min": "Invalid password",
        "string.max": "Invalid password",
        "string.empty": "Password is a required field"
    }),
    country: j.string().min(1).required().messages({
        "string.base": "Country must be of type string",
        "string.min": "Invalid country",
        "string.empty": "Country is a required field"
    }),
    email: j.string().email().required().messages({
        "string.base": "Email must be of type string",
        "string.email": "Invalid email",
        "string.empty": "Email is a required field"
    }),
    profilePicture: j.string().required().messages({
        "string.base": "Please add a profile picture",
        "string.empty": "Profile Picture is a required field"
    })
});

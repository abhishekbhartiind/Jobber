import j, { ObjectSchema } from "joi";

export const signInSchema: ObjectSchema = j.object().keys({
    username: j.alternatives().conditional(j.string().email(), {
        then: j.string().email().required().messages({
            "string.base": "Email must be of type string",
            "string.email": "Invalid email",
            "string.empty": "Email is a required field"
        }),
        otherwise: j.string().min(4).max(12).required().messages({
            "string.base": "Username must be of type string",
            "string.min": "Invalid username",
            "string.max": "Invalid username",
            "string.empty": "Username is a required field"
        })
    }),
    password: j.string().min(4).max(12).required().messages({
        "string.base": "Password must be of type string",
        "string.min": "Invalid password",
        "string.max": "Invalid password",
        "string.empty": "Password is a required field"
    })
});

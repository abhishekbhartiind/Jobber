import Joi from "joi";

export const authBuyerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    profilePicture: Joi.string().required(),
    country: Joi.string().required(),
    createdAt: Joi.string().required()
});

import Joi, { ObjectSchema } from "joi";

export const reviewSchema: ObjectSchema = Joi.object().keys({
    gigId: Joi.string().required(),
    rating: Joi.number().required(),
    orderId: Joi.string().required(),
    country: Joi.string().required(),
    createdAt: Joi.string().required(),
    review: Joi.string().required(),
    reviewerId: Joi.string().required(),
    reviewerImage: Joi.string().required(),
    reviewerUsername: Joi.string().required(),
    sellerId: Joi.string().required(),
    reviewType: Joi.string().required()
});

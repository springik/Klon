import Joi from "joi";

export const UserSchema = Joi.object({
    username: Joi.string().min(4).max(50).required(),
    email: Joi.string().email().required()
})

export const LoginSchema = Joi.object({
    email: Joi.string().email().required()
})
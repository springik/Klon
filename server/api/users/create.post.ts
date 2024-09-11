import { ValidationError } from "joi";
import { User } from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    try {
        const { error } = UserSchema.validate(body, {abortEarly: true, allowUnknown: true})
        requestValidationHelper((error as ValidationError))

        
        const isUnique = await User.findOne({
            where: {
                email: body.email
            }
        })

        if(isUnique) {
            throw createError({
                message: 'User already exists'
            })
        }
        const user = User.create(body)
        return user
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500, 'Internal Server Error')
        if(error instanceof Error) {
            return {
                message: (error as Error).message
            }
        }
        return {
            message: 'Internal Server Error'
        }
    }
})
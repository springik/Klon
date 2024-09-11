import { ValidationError } from "joi";
import { User } from "~/server/models/User.model";
import loggedIn from "~/server/utils/login.helper";

export default defineEventHandler(async (event) => {
    try {
        const userAuth = loggedIn(event)
        if(!userAuth)
            throw createError({
                status: 401,
                message: 'Unauthorized'
            })
        
        const user = await User.findByPk(event.context?.user?.id)
        
        setCookie(event, authCookieName, event.context?.user?.id, {
            maxAge: 86_400,
            httpOnly: true
        })
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
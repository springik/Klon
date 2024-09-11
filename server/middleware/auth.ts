import { User } from "../models/User.model"

export default defineEventHandler(async (event) => {
    try {
        const cookie = getCookie(event, authCookieName)
        if(cookie) {
            const user = await User.findOne({
                where: {
                    id: cookie
                }
            })
            if(user)
                event.context.user = user
        }
    } catch (error) {
        console.log(error);
    }
})
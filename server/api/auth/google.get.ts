import { User } from "~/server/models/User.model";

export default defineOAuthGoogleEventHandler({
    async onSuccess(event, { user }) {
        try {
            const [userInstance, created] = await User.findOrCreate({
                where: {
                    email: user.email,
                    provider: 'google'
                },
                defaults: {
                    username: user.name,
                    email: user.email,
                    provider: 'google',
                    avatarUrl: user.picture
                }
            })
    
            await setUserSession(event, { userInstance })
            return sendRedirect(event, '/')
        } catch (error) {
            return sendRedirect(event, '/login')
        }
    }
})
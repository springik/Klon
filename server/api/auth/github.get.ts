import { User } from "~/server/models/User.model";

export default defineOAuthGitHubEventHandler({
        async onSuccess(event, { user }) {
            try {
                const [userInstance, created] = await User.findOrCreate({
                    where: {
                        email: user.email,
                        provider: 'github'
                    },
                    defaults: {
                        username: user.name,
                        email: user.email,
                        provider: 'github',
                        avatarUrl: user.avatar_url
                    }
                })
                await setUserSession(event, { user: userInstance })
                return sendRedirect(event, '/')
            } catch (error) {
                return sendRedirect(event, '/login')
            }
        }
    })
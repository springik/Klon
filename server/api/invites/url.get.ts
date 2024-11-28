import { Server } from "~/server/models/Server.model"
import { ServerInvite } from "~/server/models/ServerInvite"

export default defineEventHandler(async (event) => {
    try {
        const { serverId } = getQuery(event)
        const session = await getUserSession(event)

        const server = await Server.findByPk(serverId)
        if(!server)
            return createError({ statusCode: 404, statusMessage: 'Server not found' })

        const [invite, created] = await ServerInvite.findOrCreate({
            where: {
                serverId,
                senderId: session.user?.id
            },
            defaults: {
                serverId,
                senderId: session.user?.id,
                lastsUntil: new Date(Date.now() + 604_800_000)
            }
        })

        if(invite.lastsUntil < new Date()) {
            invite.lastsUntil = new Date(Date.now() + 604_800_000)
            await invite.save()
        }

        const host = event.node.req.headers.host
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const inviteUrl = `${protocol}://${host}/invite/${invite.serverId}`
        return { statusCode: 200, body: { url: inviteUrl } }
    } catch (error) {
        return createError({ statusCode: 500, statusMessage: 'Server error' })
    }
})
import { Op, Transaction } from "sequelize"
import { FriendshipInvite } from "~/server/models/FriendshipInvite.model"

export default defineEventHandler(async (event) => {
    let transaction : Transaction | null = null
    try {
        transaction = await sequelize.transaction()
        const session = await getUserSession(event)

        if(!session.user) {
            return createError({ statusCode: 401, message: 'Unauthorized' })
        }

        const [invite, created] = await FriendshipInvite.findOrCreate({
            where: {
                senderId: session.user.id,
                inviteeId: null,
                lastsUntil: {
                    [Op.gt]: new Date()
                }
            },
            defaults: {
                senderId: session.user.id,
                inviteeId: null,
                lastsUntil: new Date(Date.now() + 604_800_000)
            }
        , transaction})
        if(!created) {
            invite.lastsUntil = new Date(Date.now() + 604_800_000)
            await invite.save({transaction})
        }

        const host = event.node.req.headers.host
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const friendInviteUrl = `${protocol}://${host}/friends/${invite.id}`

        await transaction.commit()

        return { statusCode: 200, body: { url: friendInviteUrl } }
    } catch (error) {
        console.error(error)
        if(transaction)
            await transaction.rollback()
    }
})
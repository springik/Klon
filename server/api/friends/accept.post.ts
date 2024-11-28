import { Op, Transaction } from "sequelize"
import { FriendshipInvite } from "~/server/models/FriendshipInvite.model"
import { Friendship } from "~/server/models/FriendshipRequest.model"

export default defineEventHandler(async (event) => {
    const { inviteId } = getQuery(event)
    const transaction : Transaction = await sequelize.transaction()
    try {
        const session = await getUserSession(event)

        const invite = await FriendshipInvite.findOne({
            where: {
                id: inviteId,
                lastsUntil: {
                    [Op.gt]: new Date()
                }
            }
        })

        if(!invite) {
            return createError({ statusCode: 404, statusMessage: 'Invite not found' })
        }
        
        const [instance, created] = await Friendship.findOrCreate({
            where: {
                [Op.or]: [
                    {
                        firstFriendId: invite.senderId,
                        secondFriendId: session.user?.id
                    },
                    {
                        firstFriendId: session.user?.id,
                        secondFriendId: invite.senderId
                    }
                ]
            },
            defaults: {
                firstFriendId: invite.senderId,
                secondFriendId: session.user?.id
            },
            transaction
        })
        console.log(created);
        console.log(instance);
        
        
        if(!created) {
            return createError({ statusCode: 400, statusMessage: 'Already friends' })
        }

        await transaction.commit()
        return { statusCode: 200, body: { message: 'Invite accepted' } }
    } catch (error) {
        console.error(error)
        transaction.rollback()
        return createError({ statusCode: 500, statusMessage: 'Server error' })
    }
})
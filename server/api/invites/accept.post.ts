import { Op, Transaction } from "sequelize"
import { ServerInvite } from "~/server/models/ServerInvite"
import { ServerMember } from "~/server/models/ServerMember.model"

export default defineEventHandler(async (event) => {
    const { serverId } = getQuery(event)
    const transaction : Transaction = await sequelize.transaction()
    try {
        const session = await getUserSession(event)

        const invite = await ServerInvite.findOne({
            where: {
                serverId,
                lastsUntil: {
                    [Op.gt]: new Date()
                }
            }
        })

        if(!invite) {
            return createError({ statusCode: 404, statusMessage: 'Invite not found' })
        }
        
        const [instance, created] = await ServerMember.findOrCreate({
            where: {
                serverId,
                userId: session.user?.id
            },
            defaults: {
                serverId,
                userId: session.user?.id
            },
            transaction
        })
        console.log(created);
        console.log(instance);
        
        
        if(!created) {
            return createError({ statusCode: 400, statusMessage: 'Already a member' })
        }

        await transaction.commit()
        return { statusCode: 200, body: { message: 'Invite accepted' } }
    } catch (error) {
        console.error(error)
        transaction.rollback()
        return createError({ statusCode: 500, statusMessage: 'Server error' })
    }
})
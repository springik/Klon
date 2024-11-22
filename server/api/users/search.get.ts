import { Op } from "sequelize";
import { User } from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
    const { name } = getQuery(event)
    const session = await getUserSession(event)
    console.log(session);
    try {
        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${name}`
                }
            }
        })
        return users
    } catch (error) {
        return createError({ statusCode: 500, statusMessage: 'Server error' })
    }
})
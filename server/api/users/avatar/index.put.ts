import { Transaction } from "sequelize"
import { Message } from "~/server/models/Message.model";
import { User } from "~/server/models/User.model"

export default defineEventHandler(async (event) => {
    const { newAvatar } = await readBody(event)
    
    console.log(newAvatar.file);
    
    if(!newAvatar)
        return createError({ status: 400, statusMessage: 'Missing query parameter' })

    let transaction : Transaction | null = null
    try {
        transaction = await sequelize.transaction()
        const avatarPath = `/users/avatars/${newAvatar.name}`

        const { user } = await getUserSession(event)
        const userInstance = await User.findByPk(user.id, { transaction })
        if(!userInstance) {
            throw new Error('User Instance not found error')
        }
        userInstance.avatarUrl = avatarPath
        user.avatarUrl = avatarPath
        console.log('file', newAvatar.file);
        const fileBuffer = Buffer.from(newAvatar.file)
        
        await FileManager.saveFile(avatarPath, fileBuffer)
        await userInstance?.save({ transaction })
        await transaction.commit()
        return { status: 200, message: 'Updated Avatar' }
    } catch (error) {
        console.error(error)
        if(transaction)
            await transaction.rollback()
        return createError({ status: 500, statusMessage: 'Something went wrong' })
    }
})
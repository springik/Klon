import { User } from "~/server/models/User.model"
import multer from 'multer'

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

export default defineEventHandler(async (event) => {
    await new Promise((resolve, reject) => {
        upload.single('newAvatar')(event.node.req, event.node.res, (err : Error) => {
            if(err) {
                console.error('error in mw', err)
                reject(err)
            }
            resolve(() => {

            })
        })
    })

    const file = event.node.req.file
    if(!file) {
        return createError({ message: 'No file uploaded', status: 400 })
    }
    const fileExtension = file.originalname.split('.').pop()
    try {
        const location = await FileManager.saveFile(fileExtension, file.buffer)

        const user = await getUserSession(event)

        const userInstance = await User.findByPk(user.user.id)
        console.log(userInstance);
        
        if(!userInstance) {
            return createError({ message: 'User not found', status: 404 })
        }
        console.log(location);
        userInstance.avatarUrl = location
        await userInstance.save()

        await setUserSession(event, { user: { avatarUrl: location } })

        return {
            status: 200,
            newAvatar: location
        }
    } catch (error) {
        console.error(error)
        return createError({ message: 'An error occurred', status: 500 })
    }
})


/*
const upload = multer({
    storage: multers3({
        s3: s3,
        bucket: bucket,
        acl: 'public-read',
        key: (req, file, cb) => {
            const fileExtension = file.originalname.split('.').pop()
            const fileName = `${crypto.randomUUID()}`
            cb(null, `public/${fileName}.${fileExtension}`)
        }
    }),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

export default defineEventHandler(async (event) => {
    try{
    const multerMW = upload.single('newAvatar')(event.node.req, event.node.res, (err) => {
        if(err) {
            console.error('error in mw', err)
        }
    })
    console.log(event.node.req.file);
    
    await callNodeListener(
        //@ts-expect-error: Nuxt 3
        multerMW,
        event.node.req,
        event.node.res
    )
    const file = event.node.req.file
    
    if(!file) {
        return createError({ message: 'No file uploaded', status: 400 })
    }
    const user = await getUserSession(event)
    const userIstance = await User.findByPk(user.id)
    userIstance.avatarUrl = file.location
    await userIstance.save()

    await setUserSession(event, {
        avatarUrl: file.location
    })

    return {
        status: 200,
        body: {
            //newAvatar: file.location
            hey: 'hey'
        }
    }
}
catch(error) {
    console.error(error)
    return createError({ message: 'An error occurred', status: 500 })
}
})
*/
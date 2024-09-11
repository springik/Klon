import { User } from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
    const users = await User.findAll()
    return users
})
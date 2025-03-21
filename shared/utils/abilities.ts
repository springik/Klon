import { Server } from "~/server/models/Server.model";
import { User } from "~/server/models/User.model";
import { Message } from "~/server/models/Message.model";

export const manageServer = defineAbility((user : User, server : Server) => {
    return user.id === server.ownerId
})
export const addConversation = defineAbility((user : User, server : Server) => {
    return user.id === server.ownerId
})
export const inviteUsers = defineAbility((user : User, server : Server) => {
    return user.id === server.ownerId
})
export const addCall = defineAbility((user : User, server : Server) => {
    return true
})
export const editMessage = defineAbility((user : User, message : Message) => {
    return user.id === message.authorId && message.githubRepository === undefined || message.githubRepository === null
})
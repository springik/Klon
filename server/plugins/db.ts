import { Conversation } from "../models/Conversation.model";
import { FriendshipRequest } from "../models/Friendship.model";
import { Friendship } from "../models/FriendshipRequest.model";
import { Message } from "../models/Message.model";
import { Server } from "../models/Server.model";
import { User } from "../models/User.model";

export default defineNitroPlugin(async (nitro) => {
    try {
        console.log("Running db plugin");
        
        registerModels()
        console.log(sequelize.models);
        Object.values(sequelize.models).forEach(model => {
            //@ts-expect-error
            if(model.associate)
                //@ts-expect-error
                model.associate(sequelize.models)
        })
        await sequelize.authenticate()
        await sequelize.sync({ alter: false, force: false })
    } catch (error) {
        console.log(error)
    }
})
function registerModels() {
    sequelize.modelManager.addModel(User)
    sequelize.modelManager.addModel(Server)
    sequelize.modelManager.addModel(Friendship)
    sequelize.modelManager.addModel(FriendshipRequest)
    sequelize.modelManager.addModel(Conversation)
    sequelize.modelManager.addModel(Message)
}
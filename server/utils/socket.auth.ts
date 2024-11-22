import { Socket } from "socket.io";
import { User } from "../models/User.model";

export default async function socketAuth(socket : Socket, next : Function) {
    try {
        const user = await User.findByPk(socket.handshake.auth.userId)
        if(user)
            socket.handshake.session = { user }
        else
            next(new Error("Unauthorized"))
        
        next()
    } catch (error) {
        console.error("Socket.io auth middleware error" + error + "*Could be because auth failed (no cookie)")
        next(new Error("Unauthorized"))
    }
}
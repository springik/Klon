import { Socket } from "socket.io";

export default async function socketAuth(socket : Socket, next : Function) {
    try {
        //@ts-expect-error
        socket.handshake.session = await requireUserSession(socket.request)
        next()
    } catch (error) {
        console.error("Socket.io auth middleware error" + error)
        next(new Error("Unauthorized"))
    }
}
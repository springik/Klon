import { Socket } from "socket.io";

export default async function socketAuth(socket : Socket, next : Function) {
    try {
        
        //@ts-expect-error
        //socket.handshake.session = await requireUserSession(socket.request)
        const session = await getUserSession(socket.request)
        console.log(session);
        
        //@ts-expect-error
        console.log(socket.handshake.session);
        
        next()
    } catch (error) {
        console.error("Socket.io auth middleware error" + error + "*Could be because auth failed (no cookie)")
        next(new Error("Unauthorized"))
    }
}
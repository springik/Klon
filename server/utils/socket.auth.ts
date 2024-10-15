import { Socket } from "socket.io";

export default async function socketAuth(socket : Socket, next : Function) {
    //@ts-expect-error
    const session = await requireUserSession(socket.request)
    next()
}
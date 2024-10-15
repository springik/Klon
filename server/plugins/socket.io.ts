import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";

export default defineNitroPlugin((nitroApp: NitroApp) => {

    const engine = new Engine();
    //@ts-expect-error
    const io = new Server(engine);

    io.bind(engine);
    io.use(socketAuth)

    io.on("connection", (socket) => {

    socket.on('test-event', (data) => console.log(`test event + ${data}`))

    socket.on('disconect', () => {
            console.log('disconnected');
        })
    });

    nitroApp.router.use("/socket.io/", defineEventHandler({
    handler(event) {
        //@ts-expect-error
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
    },
    websocket: {
        open(peer) {
            const nodeContext = peer.ctx.node;
            const req = nodeContext.req;

            // @ts-expect-error private method
            engine.prepare(req);

            const rawSocket = nodeContext.req.socket;
            const websocket = nodeContext.ws;

            // @ts-expect-error private method
            engine.onWebSocket(req, rawSocket, websocket);
        }
    }
    }));
});
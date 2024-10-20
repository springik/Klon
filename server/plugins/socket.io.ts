import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  console.log("Running socket.io plugin");
  const engine = new Engine();
  const io = new Server();
  io.bind(engine);
  //io.use(socketAuth)

  io.on("connection", (socket) => {
    socket.on('test-event', (data) => {
        console.log(data);
    })
  });

  nitroApp.router.use("/socket.io/", defineEventHandler({
    handler(event) {
      engine.handleRequest(event.node.req, event.node.res);
      event._handled = true;
    },
    websocket: {
      open(peer) {
        if(!peer.ctx)
          return
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
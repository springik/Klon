import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";
import { User } from "../models/User.model";
import { Friendship } from "../models/FriendshipRequest.model";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  console.log("Running socket.io plugin");
  const engine = new Engine();
  const io = new Server();
  io.bind(engine);
  io.use(socketAuth)

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on('add-friend', async (friendEmail) => {
      try {
        const user : User = await User.findByPk(socket.handshake.session.user.id);
        const friend : User = await User.findOne({where: {email: friendEmail}});
        if(!friend) {
          socket.emit('friend-added', {success: false, message: 'User not found'});
          return;
        }
        
        await Friendship.create({firstFriendId: user.id, secondFriendId: friend.id});
        console.log(friend.dataValues);
        
        socket.emit('friend-added', friend );
      } catch (error) {
        console.error(error);
        socket.emit('friend-added', {success: false, message: 'An error occurred'});
      }
    })
    

    socket.on('request-friends', async () => {
      try {
        const user : User = await User.findByPk(socket.handshake.session.user.id, {
          include: {
            model: User,
            as: 'Friends'
          }
        });
        console.log(user.Friends);
        if(user)
          socket.emit('friends-list', user.Friends);
        else
          socket.emit('friends-list', []);

      } catch (error) {
        console.error(error);
        socket.emit('friends-list', []);
      }
    })
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
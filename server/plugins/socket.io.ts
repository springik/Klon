import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server, Socket } from "socket.io";
import { defineEventHandler } from "h3";
import { User } from "../models/User.model";
import { Friendship } from "../models/FriendshipRequest.model";
import { Message } from "../models/Message.model";
import { Server as ServerModel } from "../models/Server.model";
import { Op, where } from "sequelize";
import { server } from "typescript";

let users = new Map();
export default defineNitroPlugin((nitroApp: NitroApp) => {
  console.log("Running socket.io plugin");
  const engine = new Engine();
  const io = new Server();
  io.bind(engine);
  io.use(socketAuth)

  io.on("connection", (socket) => {
    console.log("A user connected");
    users.set(socket.handshake.session.user.id, socket.id);

    socket.on('send-message', async (data) => {
      const message = await Message.create({
        authorId: socket.handshake.session.user.id,
        receiverId: data.receiverId,
        content: data.content
      });

      await message.reload({
        include: [{
          model: User,
          as: 'author'
        }]
      });
      const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.receiverId));
      const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
      userSocket?.emit('message', message);
      receiverSocket?.emit('message', message);
    })
    socket.on('edit-message', async (data) => {
      const message = await Message.findByPk(data.messageId);
      console.log(data);
      
      if(message) {
        message.content = data.newContent;
        await message.save();
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('message-edited', message);
        const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(message.receiverId));
        receiverSocket?.emit('message-edited', message)
      }
    })
    socket.on('delete-message', async (messageId) => {
      console.log('Got delete message request');
      
      try {
        const message = await Message.findByPk(messageId);
        console.log(message);
      
        if(message) {
          await message.destroy();
          const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
          userSocket?.emit('message-deleted', messageId);
          const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(message.receiverId));
          receiverSocket?.emit('message-deleted', messageId);
        }
      } catch (error) {
        console.error(error);
        //const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        //userSocket?.emit('error', messageId);
      }

    })

    socket.on('add-friend', async (friendEmail) => {
      try {
        const user : User = await User.findByPk(socket.handshake.session.user.id);
        const friend : User = await User.findOne({where: {email: friendEmail}});
        if(!friend)
          return

        const existingFriendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              {firstFriendId: user.id, secondFriendId: friend.id},
              {firstFriendId: friend.id, secondFriendId: user.id}
            ]
          }
        })
        if(existingFriendship)
          return

        await Friendship.create({firstFriendId: user.id, secondFriendId: friend.id});
        const friendSocket : Socket | undefined = io.sockets.sockets.get(users.get(friend.id));
        friendSocket?.emit('friend-added', user);
        
      } catch (error) {
        console.error(error);
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket.emit('friend-added', {success: false, message: 'An error occurred'});
      }
    })
    socket.on('remove-friend', async (friendId) => {
      const transaction = await sequelize.transaction()
      try {
        await Friendship.destroy({
          where: {
            [Op.or]: [
              {firstFriendId: socket.handshake.session.user.id, secondFriendId: friendId},
              {firstFriendId: friendId, secondFriendId: socket.handshake.session.user.id}
            ]
          },
          transaction
        });
        await Message.destroy({
          where: {
            [Op.or]: [
              {authorId: socket.handshake.session.user.id, receiverId: friendId},
              {authorId: friendId, receiverId: socket.handshake.session.user.id}
            ]
          },
          transaction
        })

        await transaction.commit();
      } catch (error) {
        console.error(error);
        await transaction.rollback();
      }
      
    })

    socket.on('request-messages', async (friendId) => {
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            {authorId: socket.handshake.session.user.id, receiverId: friendId},
            {authorId: friendId, receiverId: socket.handshake.session.user.id}
          ]
        },
        include: [{
          model: User,
          as: 'author'
        }]
      })
      const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
      userSocket?.emit('messages', messages);
    })
    

    socket.on('request-friends', async () => {
      try {
        const user : User = await User.findByPk(socket.handshake.session.user.id, {
          include: [{
            model: User,
            as: 'Friends1'
          },
          {
            model: User,
            as: 'Friends2'
          }
        ]
        });
        const friends = user.Friends1.concat(user.Friends2)

        const mappedFriends = friends.map(friend => {
          return {
            id: friend.id,
            username: friend.username,
            email: friend.email,
            avatarUrl: friend.avatarUrl
          }
        })
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        console.log(users);
        console.log(users.get(socket.handshake.session.user.id));
        if(user)
          userSocket?.emit('friends-list', mappedFriends);
        else
          userSocket?.emit('friends-list', []);

      } catch (error) {
        console.error(error);
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
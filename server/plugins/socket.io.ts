import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server, Socket } from "socket.io";
import { defineEventHandler, use } from "h3";
import { User } from "../models/User.model";
import { Friendship } from "../models/FriendshipRequest.model";
import { Message } from "../models/Message.model";
import { Server as ServerModel } from "../models/Server.model";
import { Op, Transaction } from "sequelize";
import { ServerMember } from "../models/ServerMember.model";
import { Conversation } from "../models/Conversation.model";
import { FileManager } from "../utils/FileManager";
import { MessageAttachment } from "../models/MessageAttachment.model";
import { log } from "console";

let users = new Map();
const groups = new Map<string, Map<string, Group>>();
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
      let transaction : Transaction | null = null;
      try {
        transaction = await sequelize.transaction();
        //console.log(data);
        if(data.receiverId !== null) {
          const message = await Message.create({
          authorId: socket.handshake.session.user.id,
          receiverId: data.receiverId,
          content: data.content
          , transaction
        });

        if(data.attachment) {
          //const attachments : MessageAttachment[] = [];
          data.attachment.forEach(async (attachment : { file : Buffer, name : string, extension : string }) => {
            const attachmentPath = `/attachments/${attachment.name}.${attachment.extension}`;
            await FileManager.saveFile(attachmentPath, attachment.file);
            await MessageAttachment.create({
              messageId: message.dataValues.id,
              contentUrl: attachmentPath
            , transaction
            })
          })
        }
        
        await transaction.commit();

        await message.reload({
          include: [{
            model: User,
            as: 'author'
          }, {
            model: MessageAttachment,
            as: 'attachments'
          }]
        });

        const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.receiverId));
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('message', message);
        receiverSocket?.emit('message', message);
        }
        else if(data.conversationId !== null) {
          
          const message = await Message.create({
            authorId: socket.handshake.session.user.id,
            conversationId: data.conversationId,
            content: data.content
          , transaction});

          if(data.attachment) {
            const attachments : MessageAttachment[] = [];
            data.attachment.forEach(async (attachment : { file : Buffer, name : string, extension : string }) => {
              const attachmentPath = `/attachments/${attachment.name}.${attachment.extension}`;
              await FileManager.saveFile(attachmentPath, attachment.file);
              const messageAttachment = await MessageAttachment.create({
                messageId: message.dataValues.id,
                contentUrl: attachmentPath
              , transaction
              })
              attachments.push(messageAttachment);
            })
          }

          await transaction.commit();
  
          await message.reload({
            include: [{
              model: User,
              as: 'author'
            }, {
              model: MessageAttachment,
              as: 'attachments'
            }]
          });
          //console.log(message);
          
          //const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
          //userSocket?.emit('message', message);
  
          const conversation = await Conversation.findByPk(data.conversationId);
          if(conversation) {
            const serverMembers = await ServerMember.findAll({
              where: {
                serverId: conversation.serverId
              }
            })
            serverMembers.forEach(async (member) => {
              const memberSocket : Socket | undefined = io.sockets.sockets.get(users.get(member.userId));
              memberSocket?.emit('message', message);
            })
          }
        }
      } catch (error) {
        console.error(error);
        if(transaction)
          await transaction.rollback();
      }
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
        }, {
          model: MessageAttachment,
          as: 'attachments'
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

    socket.on('create-server', async (serverData) => {
      let transaction : Transaction | null = null
      try {
        transaction = await sequelize.transaction();

        let avatarUrl = '/servers/default.webp';
        if(serverData.avatar) {
          const avatarPath = `/servers/avatars/${serverData.name}.webp`
          await FileManager.saveFile(avatarPath, serverData.avatar);
          avatarUrl = `${avatarPath}`
        }
        const server = await ServerModel.create({
          name: serverData.name,
          description: serverData.description || null,
          avatarUrl: avatarUrl,
          ownerId: socket.handshake.session.user.id
        , transaction});

        await ServerMember.create({
          serverId: server.id,
          userId: socket.handshake.session.user.id
        , transaction})

        await Conversation.create({
          serverId: server.id,
          name: 'General'
        , transaction})

        await transaction.commit();

        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('server-created', server);
      } catch (error) {
        console.error(error);
        if(transaction)
          await transaction.rollback();
      }
    })

    socket.on('request-servers', async () => {
      try {
        const user : User | null = await User.findByPk(socket.handshake.session.user.id, {
          include: [{
            model: ServerModel,
            as: 'ServerMemberships',
          }]
        })
        if(!user)
          return
        
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        if(userSocket)
          userSocket.emit('server-list', user.ServerMemberships);
        
      } catch (error) {
        console.error(error);
      }
    })
    socket.on('create-conversation', async (data) => {
      let transaction : Transaction | null = null
      try {
        transaction = await sequelize.transaction();
        const conversation = await Conversation.create({
          serverId: data.serverId,
          name: data.name
        }, {transaction})

        await transaction.commit();
        const members = await ServerMember.findAll({
          where: {
            serverId: data.serverId
          }
        })
        members.forEach(async (member) => {
          const memberSocket : Socket | undefined = io.sockets.sockets.get(users.get(member.userId));
          memberSocket?.emit('conversation-created', conversation);
        })
      } catch (error) {
        console.error(error);
        if(transaction)
          await transaction.rollback();
      }
    })
    socket.on('request-conversations', async (serverId) => {
      try {
        const conversations = await Conversation.findAll({
          where: {
            serverId
          }
        })
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('conversations-list', conversations);
      } catch (error) {
        console.error(error);
      }
    })
    socket.on('request-conversation-messages', async (conversationId : string) => {
      try {
        const messagesBare = await Message.findAll({
          where: {
            conversationId
          }
        })
        const messages = await Promise.all(messagesBare.map(async (message) => {
          await message.reload({
            include: [{
              model: User,
              as: 'author'
            }, {
              model: MessageAttachment,
              as: 'attachments'
            }]
          })
          return message;
        })
        )
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        if(messages)
          userSocket.emit('conversation-messages', messages);
        else
          userSocket.emit('conversation-messages', []);
      } catch (error) {
        console.error(error);
      }
    })
    socket.on('update-user-avatar', async (newAvatar) => {
    
    let transaction : Transaction | null = null
    try {
        transaction = await sequelize.transaction()
        const avatarPath = `/users/avatars/${newAvatar.name}`

        const user = socket.handshake.session.user
        const userInstance = await User.findByPk(user.id, { transaction })
        if(!userInstance) {
            throw new Error('User Instance not found error')
        }
        userInstance.avatarUrl = avatarPath
        user.avatarUrl = avatarPath
        
        await FileManager.saveFile(avatarPath, newAvatar.file)
        await userInstance?.save({ transaction })
        await transaction.commit()
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('avatar-changed', { status: '200', message: 'Avatar updated', newUrl: avatarPath })
    } catch (error) {
        console.error(error)
        if(transaction)
            await transaction.rollback()
        //return createError({ status: 500, statusMessage: 'Something went wrong' })
    }
    })

    socket.on('call-user', async (data) => {
      try {
        const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.receiverId));
        const callerInstance = await User.findByPk(socket.handshake.session.user.id, { attributes: ['id', 'username', 'avatarUrl'] });
        receiverSocket?.emit('incoming-call', { other: callerInstance });
      }
      catch (error) {
        console.error(error);
      }
    })
    socket.on('accept-call', async (data) => {
      const callerSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.to));
      callerSocket?.emit('call-accepted');
    })
    socket.on('passalong-init-signal', async (data) => {
      const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.to));
      receiverSocket?.emit('init-signal', { signal: data.signal, from: socket.handshake.session.user.id });
    })
    socket.on('decline-call', async (data) => {
      const callerSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.callerId));
      callerSocket?.emit('call-declined');
    })
    socket.on('end-call', async (data) => {
      const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.to));
      receiverSocket?.emit('call-ended');
    })
    socket.on('signal', async (data) => {
      console.log('socket signal', { signal: data.signal });
      
      const receiverSocket : Socket | undefined = io.sockets.sockets.get(users.get(data.to));
      receiverSocket?.emit('signal', { signal: data.signal, from: socket.handshake.session.user.id });
    })

    socket.on('create-call', async (data: { name: string, serverId: string }) => {
      const group : Group = {
        name: data.name,
        members: []
      }

      const calls = groups.get(data.serverId) ?? [];
      calls.forEach((call) => {
        if(call.name === data.name) {
          socket.emit('call-exists', { message: 'Call with this name already exists' });
          return
        }
      })

      const serverGroups = groups.get(data.serverId) ?? new Map<string, Group>();
      serverGroups.set(data.name, group);
      groups.set(data.serverId, serverGroups);

      const members = await ServerMember.findAll({
        where: {
          serverId: data.serverId
        }
      })

      members.forEach((member) => {
        const memberSocket : Socket | undefined = io.sockets.sockets.get(users.get(member.userId));
        memberSocket?.emit('call-created', { serverId: data.serverId, call: group });
      })
    })

    socket.on('join-call', async (data: { groupId: string, serverId: string }) => {
      let receiverSocket : Socket | undefined;
      try {
        receiverSocket = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        if(groups.has(data.serverId)) {
          const group = groups.get(data.serverId)?.get(data.groupId);
          group?.members.push(socket.handshake.session.user.id);

          if(group) {
            groups.get(data.serverId)?.set(data.groupId, group);
          }

          console.log('groups', groups)
        }
        else {
          throw new Error('Group not found');
          //groups.set(data.serverId, [socket.handshake.session.user.id]);
        }
        const peerIds = (groups.get(data.serverId)?.get(data.groupId)?.members ?? []).filter(id => id !== socket.handshake.session.user.id);

        receiverSocket?.emit('join-call', peerIds);
        console.log('chat members', groups.get(data.serverId)?.get(data.groupId)?.members);
        
      } catch (error) {
        console.error(error);
        if(error instanceof Error)
          if(error.message === 'Group not found') {
            receiverSocket?.emit('group-not-found', { message: error.message });
            console.error(error)
          }
      }
    })
    socket.on('request-calls', async (serverId) => {
      try {
        const serverGroupsMap = groups.get(serverId);
        const calls: Group[] = [];
        for(const [key, value] of serverGroupsMap ?? new Map<string, Group>()) {
          calls.push(value);
        }
        const userSocket : Socket | undefined = io.sockets.sockets.get(users.get(socket.handshake.session.user.id));
        userSocket?.emit('calls-list', { calls: calls ?? [] });
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
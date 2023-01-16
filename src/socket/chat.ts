import { neo4jWrapper } from "../config/neo4jDriver";
import { privateNamespace } from "../config/socket";
import {
  ChatMessage,
  ChatMessageAck,
  SocketDefault,
} from "../interfaces/socket";

const chatOnConnection = (socket: SocketDefault) => {
  socket.emit("connection", `Connected to chat ${socket.nsp.name}`);

  socket.on("sendMessage", chatOnSendMessage(socket));
  socket.on("readMessage", chatOnReadMessage(socket));
};

const chatOnSendMessage =
  (socket: SocketDefault) =>
  async ({ message }: ChatMessage, callback: (message: any) => void) => {
    if (!callback) return;

    const senderId = socket.request.user?._id.toString();
    const receiverId = socket.request.params.secondUserId;

    try {
      const records = await neo4jWrapper(
        "MATCH (s:User {_id: $senderId}), (r:User {id: $receiverId}) \
      CREATE (s)-[:SENT]->(m:Message {id: randomUUID(), message: $message, isRead: false, date: datetime()})-[:TO]->(r) \
      RETURN m, s",
        { senderId, receiverId, message },
      );

      const sentMessage = records.records[0].get("m").properties;
      const senderData = records.records[0].get("s").properties;

      socket.broadcast.emit("receiveMessage", {
        ...sentMessage,
        received: true,
      });

      privateNamespace.to(`${receiverId}`).emit("newMessage", {
        user: { ...senderData, _id: "" },
        latestMessage: { ...sentMessage, received: true },
        markAsRead: false,
      });
      callback({ ...sentMessage, received: false });
    } catch (err) {
      return callback(err);
    }
  };

const chatOnReadMessage =
  (socket: SocketDefault) =>
  async ({ messageId }: ChatMessageAck, callback: (message: any) => void) => {
    if (!callback) return;

    const userId = socket.request.user?._id.toString();

    try {
      const records = await neo4jWrapper(
        "MATCH (m:Message {id: $messageId})-[:TO]->(:User {_id: $userId}) \
      SET m.isRead = true \
      RETURN m",
        {
          messageId,
          userId,
        },
      );

      const sentMessage = records.records[0];

      if (sentMessage) {
        callback("Success");
      }

      return callback("Not found");
    } catch (err) {
      return callback(err);
    }
  };

export default chatOnConnection;

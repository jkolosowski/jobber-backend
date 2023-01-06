import { SocketDefault } from "../interfaces/socket";

const userOnConnection = (socket: SocketDefault) => {
  socket.emit("connection", `Connected to private socket ${socket.nsp.name}`);
};

export default userOnConnection;

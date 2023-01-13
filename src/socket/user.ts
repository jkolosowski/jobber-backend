import { SocketDefault } from "../interfaces/socket";

const userOnConnection = (socket: SocketDefault) => {
  socket.emit("connection", `Connected to private socket ${socket.nsp.name}`);
  socket.join(`${socket.request.params.id}`);
};

export default userOnConnection;

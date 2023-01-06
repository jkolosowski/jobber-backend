import { Server } from "socket.io";
import passport from "passport";

import server from "./server";
import session from "./session";
import {
  authenticationCheckSocket,
  authorizationCheckChat,
  authorizationCheckUser,
  chatNamespace,
  parseChatIdMiddleware,
  parseUserIdMiddleware,
  socketMiddlewareWrapper,
  userNamespace,
} from "../helpers/socket";
import chatOnConnection from "../socket/chat";
import userOnConnection from "../socket/user";

const io = new Server(server, {
  path: "/socket.io/",
});

io.of(userNamespace)
  .use(socketMiddlewareWrapper(session))
  .use(socketMiddlewareWrapper(passport.initialize()))
  .use(socketMiddlewareWrapper(passport.session()))
  .use(authenticationCheckSocket)
  .use(parseUserIdMiddleware)
  .use(authorizationCheckUser)
  .on("connection", userOnConnection);

  io.of(chatNamespace)
  .use(socketMiddlewareWrapper(session))
  .use(socketMiddlewareWrapper(passport.initialize()))
  .use(socketMiddlewareWrapper(passport.session()))
  .use(authenticationCheckSocket)
  .use(parseChatIdMiddleware)
  .use(authorizationCheckChat)
  .on("connection", chatOnConnection);

export default io;

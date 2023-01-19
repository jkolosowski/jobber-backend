import { Request, Response, NextFunction } from "express";
import { ExtendedError } from "socket.io/dist/namespace";
import { neo4jWrapper } from "../config/neo4jDriver";

import { SocketDefault } from "../interfaces/socket";

export const authenticationCheckSocket = (
  socket: SocketDefault,
  next: (err?: ExtendedError | undefined) => void,
) => {
  if (!socket.request.isAuthenticated()) {
    return next(Error("Unauthenticated"));
  }
  return next();
};

export const socketMiddlewareWrapper =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (socket: SocketDefault, next: (err?: ExtendedError | undefined) => void) =>
    middleware(socket.request as Request, {} as Response, next as NextFunction);

export const parseUserIdMiddleware = (
  socket: SocketDefault,
  next: (err?: ExtendedError | undefined) => void,
) => {
  const id = socket.nsp.name.split("/").slice(-1)[0];
  socket.request.params = { id };
  return next();
};

export const authorizationCheckUser = async (
  socket: SocketDefault,
  next: (err?: ExtendedError | undefined) => void,
) => {
  const nspId = socket.request.params.id;
  const userId = socket.request.user?._id.toString();
  try {
    const records = await neo4jWrapper(
      "MATCH (u:User {_id: $userId}) RETURN u",
      { userId },
    );
    const user = records.records[0].get("u").properties;

    if (user.id !== nspId) return next(new Error("Unauthorized"));
    return next();
  } catch (err: any) {
    return next(err);
  }
};

export const authorizationCheckChat = async (
  socket: SocketDefault,
  next: (err?: ExtendedError | undefined) => void,
) => {
  const nspName = socket.nsp.name.split("/");
  const firstUserId = nspName.slice(-2)[0];
  const secondUserId = nspName.slice(-1)[0];
  const userId = socket.request.user?._id.toString();
  try {
    const records = await neo4jWrapper(
      "MATCH (u:User {_id: $userId}), (u1:User {id: $firstUserId}), (u2: User {id: $secondUserId }) RETURN u, u1, u2",
      { userId, firstUserId, secondUserId },
    );

    const user = records.records[0].get("u").properties;
    const firstUser = records.records[0].get("u1").properties;
    const secondUser = records.records[0].get("u2").properties;

    if (
      ((user.id === firstUserId && user.id !== secondUserId) ||
        (user.id === secondUserId && user.id !== firstUserId)) &&
      firstUser &&
      secondUser
    )
      return next();
    return next(new Error("Unauthorized"));
  } catch (err: any) {
    return next(new Error("Not found"));
  }
};

export const namespaceWrapper = (namespace: string) =>
  new RegExp(`^${namespace}$`);

export const uuidRegEx =
  "[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}";

export const userNamespace = namespaceWrapper(`/user/${uuidRegEx}`);

export const chatNamespace = namespaceWrapper(
  `/chat/${uuidRegEx}/${uuidRegEx}`,
);

// io.of("/").use(
//   (_socket: SocketDefault, next: (err?: ExtendedError | undefined) => void) =>
//     next(new Error("AuthenticationError")),
// );

type UserDocument = import("./src/interfaces/userDocument").UserDocument;
type ObjectId = import("mongoose").Types.ObjectId;
type MongoSession = import("mongoose").ClientSession;
type Neo4jSession = import("neo4j-driver").Session;

declare namespace Express {
  export interface User extends UserDocument {
    _id: ObjectId;
    changePassword: (currentPassword: string, newPassword: string) => Promise<AuthenticatedUser>;
  }

  export interface AuthenticatedUser extends UserDocument {
    _id: ObjectId;
    salt: string;
    hash: string;
    __v: number;
  }

  export interface Request {
    mongoSession?: MongoSession;
    neo4jSession?: Neo4jSession;
  }
}

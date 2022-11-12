type UserDocument = import("./src/interfaces/userDocument").UserDocument;
type ObjectId = import("mongoose").Types.ObjectId;

declare namespace Express {
  export interface User extends UserDocument {
    _id: ObjectId;
  }

  export interface AuthenticatedUser extends UserDocument {
    _id: ObjectId;
    salt: string;
    hash: string;
    __v: number;
  }
}

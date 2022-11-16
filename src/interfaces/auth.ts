import { Email, AccountType, FirstName, LastName } from "./primitive";

export interface LoginReq extends Email {
  password: string;
}

export interface RegisterReq
  extends LoginReq,
    AccountType,
    FirstName,
    LastName {}

export interface UpdateCredentialsReq extends LoginReq {
  newPassword: string;
}

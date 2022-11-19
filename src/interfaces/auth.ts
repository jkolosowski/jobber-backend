import { Email, AccountType, FirstName, LastName, NewEmail, NewPassword } from "./primitive";

export interface LoginReq extends Email {
  password: string;
}

export interface RegisterReq
  extends LoginReq,
    AccountType,
    FirstName,
    LastName {}

export interface UpdateCredentialsReq extends NewPassword, NewEmail, Omit<LoginReq, "email"> {
  email?: string;
}

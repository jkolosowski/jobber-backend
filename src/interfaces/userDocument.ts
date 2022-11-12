import { Email, AccountType } from "./primitive";

export interface UserDocument extends Email, AccountType {}

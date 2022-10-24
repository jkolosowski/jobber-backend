export interface loginReq {
    username: string;
    password: string;
}

export interface registerReq extends loginReq {
    email: string;
}
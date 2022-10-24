interface User {
    _id: string;
    username: string;
}

declare namespace Express {
    export interface Request {
        user: User;
    }
}

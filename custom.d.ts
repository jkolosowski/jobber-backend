import * as express from "express";

declare namespace Express {
    export interface User {
        _id: string
        email: string;
    }
}
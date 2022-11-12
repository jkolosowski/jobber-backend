const AuthenticationError = require("passport/lib/errors/authenticationerror");
import { Request, Response, NextFunction } from "express";

const authenticationCheck = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  next();
};

export default authenticationCheck;

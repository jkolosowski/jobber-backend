import passport from "passport";
import { AnyValidateFunction } from "ajv/dist/core";
import { Request, Response, NextFunction } from "express";

import mongoConnection from "./mongo";
import validate from "../helpers/validation/validation";
import { ClientSession } from "mongoose";

const authenticationCheck = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  return next();
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.email = req.user!.email;

  passport.authenticate("local", (err, user: Express.User) => {
    if (err) {
      return res.status(500).json({ message: err });
    } else if (!user) {
      return res.status(401).json({ message: "Bad credentials!" });
    }
    return next();
  })(req, res);
};

export const accountTypeCheck =
  (accountType: String) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userAccountType = req.user?.accountType;
    if (accountType !== userAccountType) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    return next();
  };

export const validateRequestBody =
  <T>(validation: AnyValidateFunction<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const data: T = req.body;
    const [vRes, vErrors] = validate<T>(data, validation);

    if (!vRes) {
      return res.status(400).json({
        message: vErrors,
      });
    }

    return next();
  };

export const validateRequestArrayBody =
  <T>(validation: AnyValidateFunction<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const data: Array<T> = req.body;

    data.forEach((el) => {
      const [vRes, vErrors] = validate<T>(el, validation);

      if (!vRes) {
        return res.status(400).json({
          message: vErrors,
        });
      }
      return el;
    });
    return next();
  };

export const startMongoTransaction = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.mongoSession = await mongoConnection.startSession();
  req.mongoSession.startTransaction();
  next();
};

export const commitMongoTransaction = async (
  session: ClientSession | undefined,
) => {
  await session?.commitTransaction();
  await session?.endSession();
};

export const abortMongoTransaction = async (
  session: ClientSession | undefined,
) => {
  await session?.abortTransaction();
  await session?.endSession();
};

export default authenticationCheck;

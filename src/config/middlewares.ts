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
    const candidateData: T = req.body;
    const [vRes, vErrors] = validate<T>(candidateData, validation);

    if (!vRes) {
      return res.status(400).json({
        message: vErrors,
      });
    }

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

export const commitMongoTransaction = async (session: ClientSession | undefined) => {
  await session?.commitTransaction();
  await session?.endSession();
};

export const abortMongoTransaction = async (session: ClientSession | undefined) => {
  await session?.abortTransaction();
  await session?.endSession();
};

export default authenticationCheck;

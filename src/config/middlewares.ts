import { AnyValidateFunction } from "ajv/dist/core";
import { Request, Response, NextFunction } from "express";

import validate from "../helpers/validation/validation";

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

export default authenticationCheck;

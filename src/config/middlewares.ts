import { Request, Response, NextFunction } from "express";

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

export default authenticationCheck;

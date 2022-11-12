import { Request, Response, NextFunction } from "express";
import { neo4jWrapper } from "./neo4jDriver";

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

export const accountTypeCheck =
  (accountType: String) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req?.user?._id.toString();
    try {
      const records = await neo4jWrapper(
        `MATCH (u:User {id: $id}) RETURN distinct labels(u)`,
        {
          id,
        },
      );
      const labels: Array<String> = records.records[0].get(
        records.records[0].keys[0],
      );
      if (!labels.includes(accountType)) {
        return res.status(500).json({ message: "Bad account type" });
      }
    } catch (err) {
      return res.status(500).json({ message: err });
    }
    next();
  };

export default authenticationCheck;

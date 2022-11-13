import { Router, Request, Response } from "express";

import { neo4jWrapper } from "../../config/neo4jDriver";
import { UserInit } from "../../interfaces/user";

const router = Router();

/**
 * @GET
 * Return user object.
 *
 * @path /user
 *
 * @contentType application/json
 *
 * @reqParam email: string            User email.
 * @reqParam password: string         User password.
 *
 * @resParam message: string          Response message.
 * @resParam user: object             User information.
 * @resParam user.id: string          User ID (UUIDv4 standard).
 * @resParam user.email: string       User email.
 * @resParam user.firstName: string   User first name.
 * @resParam user.lastName: string    User last name.
 * @resParam user.accountType: string User account type.
 */

router.get("/", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();

  try {
    const userData = await neo4jWrapper(
      `MATCH (u:User {_id: $_id}) WITH distinct labels(u) AS l, u RETURN u, l`,
      { _id },
    );

    const userResult: UserInit = userData.records[0].get("u").properties;

    const accountType: string = userData.records[0]
      .get("l")
      .filter((role: string) => role !== "User")[0];

    return res
      .status(201)
      .json({
        message: "Success!",
        user: { ...userResult, accountType, _id: undefined },
      });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

export default router;

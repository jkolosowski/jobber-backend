import passport from "passport";
import { Router, Request, Response } from "express";

import User from "../../models/User";
import { RegisterReq } from "../../interfaces/auth";
import { neo4jWrapper } from "../../config/neo4jDriver";
import { validateRegisterFields } from "../../helpers/validation/validation";
import { validateRequestBody } from "../../config/middlewares";
import { getProperties } from "../../helpers/neo4j";

const router = Router();

/**
 * @POST
 * Registers a new user.
 *
 * @path /register
 *
 * @contentType application/json
 *
 * @reqParam email: string                          Unique email.
 * @reqParam password: string                       Password.
 * @reqParam accountType: "Candidate" | "Recruiter" Account type.
 * @reqParam firstName: string                      First name.
 * @reqParam lastName: string                       Last name.
 *
 * @resParam message: string                        Response message.
 * @resParam user: object                           Registered user's information.
 * @resParam user.id: string                        Registered user's ID (UUIDv4 standard).
 * @resParam user.email: string                     Registered user's email.
 * @resParam user.firstName: string                 Registered user's first name.
 * @resParam user.lastName: string                  Registered user's last name.
 * @resParam user.accountType: string               Registered user's account type.
 */
router.post(
  "/register",
  validateRequestBody<RegisterReq>(validateRegisterFields),
  async (req: Request, res: Response) => {
    const { email, password, accountType, firstName, lastName }: RegisterReq =
      req.body;

    return User.register(
      { email, accountType },
      password,
      async (err, user: Express.AuthenticatedUser) => {
        if (err) {
          return res.status(500).json({
            message: err,
          });
        }

        const _id = user?._id.toString();

        try {
          const user = await neo4jWrapper(
            `MERGE (u:User:${accountType} {
            id: randomUUID(),
            _id: $_id,
            email: $email,
            firstName: $firstName,
            lastName: $lastName}) RETURN u.id`,
            {
              _id,
              email,
              firstName,
              lastName,
            },
          );

          return res.status(201).json({
            massage: "Successfully created an account!",
            id: user.records[0]?.get("u.id"),
            email,
            firstName,
            lastName,
            accountType,
          });
        } catch (err) {
          await User.findByIdAndDelete(_id);

          return res.status(500).json({
            message: err,
          });
        }
      },
    );
  },
);

/**
 * @POST
 * Logs in as a given user.
 *
 * @path /login
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
router.post("/login", (req: Request, res: Response) => {
  passport.authenticate("local", (err, user: Express.User) => {
    if (err) {
      return res.status(500).json({ message: err });
    } else if (!user) {
      return res.status(401).json({ message: "Bad credentials!" });
    }

    return req.login(user, async (err) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      const accountType: string = user.accountType;
      const _id: string = user._id.toString();

      const userData = await neo4jWrapper(
        `MATCH (u:${accountType} {_id: $_id}) RETURN u`,
        { _id },
      );

      const userResult = getProperties<any>(userData, ["u"], ["_id"])[0].u;

      return res
        .status(201)
        .json({ message: "Success!", user: { ...userResult, accountType } });
    });
  })(req, res);
});

/**
 * @POST
 * Logs out from current user account.
 *
 * @path /logout
 *
 * @resParam message: string Response message.
 */
router.post("/logout", (req: Request, res: Response) => {
  req.logout(
    {
      keepSessionInfo: false,
    },
    (err) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      return req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Success!" });
      });
    },
  );
});

/**
 * @GET
 * Returns a message whether a user is logged in or not.
 *
 * @path /status
 *
 * @resParam message: string Response message.
 */
router.get("/status", (req: Request, res: Response) => {
  return res.status(200).json({
    message: req.user ? `Logged in as ${req.user.email}` : `Not logged in!`,
  });
});

export default router;

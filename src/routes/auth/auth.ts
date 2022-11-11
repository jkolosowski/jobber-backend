import passport from "passport";
import { Router, Request, Response } from "express";

import User from "../../models/User";
import { RegisterReq } from "../../interfaces/auth";
import { neo4jWrapper } from "../../config/neo4jDriver";
import validate, { validateRegisterFields } from "../../helpers/validation";

const router = Router();

/**
 * @POST
 * Registers a new user.
 *
 * @path /register
 *
 * @contentType application/json
 *
 * @reqParam email: string                            Unique email.
 * @reqParam password: string                         Password.
 * @reqParam accountType: "Candidate" | "Recruiter"   Account type.
 * @reqParam firstName: string                        First name.
 * @reqParam lastName: string                         Last name.
 *
 * @resParam message: string                          Response message.
 * @resParam userId: string                           Id of the registered user.
 */
router.post("/register", (req: Request, res: Response) => {
  const [vRes, vErrors] = validate<RegisterReq>(
    req.body,
    validateRegisterFields,
  );
  if (!vRes) {
    return res.status(400).json({
      message: vErrors,
    });
  }

  const { email, password, accountType, firstName, lastName }: RegisterReq =
    req.body;

  User.register({ email }, password, async (err, user) => {
    if (err) {
      return res.status(500).json({
        message: err,
      });
    }

    const userId = user?._id.toString();

    try {
      await neo4jWrapper(
        `MERGE (u:User:${accountType} {
        id: $userId,
        email: $email,
        firstName: $firstName,
        lastName: $lastName}) RETURN u.id`,
        {
          email,
          firstName,
          lastName,
          userId,
        },
      );

      return res.status(201).json({
        massage: "Succesfully created an account!",
        id: userId,
      });
    } catch (err) {
      await User.findByIdAndDelete(userId);

      return res.status(500).json({
        message: err,
      });
    }
  });
});

/**
 * @POST
 * Logs in as a given user.
 *
 * @path /login
 *
 * @contentType application/json
 *
 * @reqParam email: string      User email.
 * @reqParam password: string   User password.
 *
 * @resParam message: string    Response message.
 */
router.post("/login", (req: Request, res: Response) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({ message: err });
    } else if (!user) {
      return res.status(401).json({ message: "Bad credentials!" });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      return res.status(201).json({ message: "Success!" });
    });
  })(req, res);
});

/**
 * @POST
 * Logs out from current user account.
 *
 * @path /logout
 *
 * @resParam message: string  Response message.
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

      req.session.destroy(() => {
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
 * @resParam message: string  Response message.
 */
router.get("/status", (req: Request, res: Response) => {
  return res.status(200).json({
    message: req.user ? `Logged in as ${req.user.email}` : `Not logged in!`,
  });
});

export default router;

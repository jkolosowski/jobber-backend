import passport from "passport";
import { Router } from "express";

import User from "../../models/User";
import { RegisterReq } from "../../interfaces/authInterfaces";
import { neo4jWrapper } from "../../config/neo4jDriver";
import validate, { validateRegisterFields } from "../../helpers/validation";

const router = Router();

router.post("/register", (req, res) => {
  const [vRes, vErrors] = validate<RegisterReq>(
    req.body,
    validateRegisterFields
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
        }
      );

      return res.status(201).json({
        massage: "Succesfully created an account!",
        id: userId
      });
    } catch (err) {
      await User.findByIdAndDelete(userId);

      return res.status(500).json({
        message: err,
      });
    }
  });
});

router.post("/login", (req, res) => {
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

router.post("/logout", (req, res) => {
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
    }
  );
});

router.get("/status", (req, res) => {
  return res.status(200).json({
    message: req.user ? `Logged in as ${req.user.email}` : `Not logged in!`,
  });
});

export default router;

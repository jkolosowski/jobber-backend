import { Router } from "express";
import User from "../../../models/User";
import { registerReq, loginReq } from "./authInterfaces";
import passport from "passport";

const router = Router();

router.post("/register", (req, res) => {
  const { username, password, email }: registerReq = req.body;

  User.register({ username }, password, (err, user) => {
    if (err) {
      return res.status(500).json({
        message: err,
      });
    }

    res.status(201).json({
      massage: "Succesfully created an account!",
      id: user?._id.toString(),
    });
  });
});

router.post("/login", (req, res) => {
  const { username, password }: loginReq = req.body;

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
  return res.status(200).json({ message: (req.user) ? `Logged in as ${req.user.username}` : `Not logged in!` });
});

export default router;

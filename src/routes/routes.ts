import { Router, Request, Response } from "express";
import authenticationCheck, { accountTypeCheck } from "../config/middlewares";

import auth from "./auth/auth";
import candidate from "./candidate/candidate";
import recruiter from "./recruiter/recruiter";
import offer from "./offer/offer";
import user from "./user/user";
import message from "./message/message";

const router = Router();

router.use("/", auth);
router.use(
  "/candidate",
  authenticationCheck,
  accountTypeCheck("Candidate"),
  candidate,
);
router.use(
  "/recruiter",
  authenticationCheck,
  accountTypeCheck("Recruiter"),
  recruiter,
);
router.use("/offer", authenticationCheck, offer);
router.use("/user", authenticationCheck, user);
router.use("/message", authenticationCheck, message);

router.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

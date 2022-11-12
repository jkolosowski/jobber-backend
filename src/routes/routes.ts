import { Router, Request, Response } from "express";
import authenticationCheck, { accountTypeCheck } from "../config/middlewares";

import auth from "./auth/auth";
import candidate from "./candidate/candidate";
import recruiter from "./recruiter/recruiter";

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

router.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

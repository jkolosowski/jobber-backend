import { Router, Request, Response } from "express";
import authenticationCheck from "../config/middlewares";

import auth from "./auth/auth";
import candidate from "./candidate/candidate";
import recruiter from "./recruiter/recruiter";

const router = Router();

router.use("/", auth);
router.use("/candidate", authenticationCheck, candidate);
router.use("/recruiter", authenticationCheck, recruiter);

router.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

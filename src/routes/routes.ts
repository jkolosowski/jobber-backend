import { Router } from "express";

import auth from "./auth/auth";
import candidate from "./candidate/candidate";
import recruiter from "./recruiter/recruiter";

const router = Router();

router.use("/", auth);
router.use("/candidate", candidate);
router.use("/recruiter", recruiter);

router.use((req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

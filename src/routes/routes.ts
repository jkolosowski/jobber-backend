import { Router } from "express";

import auth from "./auth";
import candidate from "./candidate/candidate";

const router = Router();

router.use("/", auth);
router.use("/candidate", candidate);

router.use((req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

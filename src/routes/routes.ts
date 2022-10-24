import { Router } from "express";

import candidate from "./candidate/candidate";

const router = Router();

router.use("/candidate", candidate);

router.use((req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

export default router;

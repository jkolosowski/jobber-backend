import { Router } from "express";
import auth from "./auth/auth"

const candidates = Router();

candidates.use("/", auth);

export default candidates;

import { Router } from "express";

import validate, { validateCandidateFields } from "../../helpers/validation";
import { Candidate } from "../../interfaces/user";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";

const router = Router();

router.patch("/:id", async (req, res) => {
  const candidateData: Candidate = req.body;
  const [vRes, vErrors] = validate<Candidate>(
    candidateData,
    validateCandidateFields,
  );

  if (!vRes) {
    return res.status(400).json({
      message: vErrors,
    });
  }

  const id = req.params.id;
  let previousEmail = "";

  try {
    const user: { _id: string; email: string } = await User.findById(id).exec();
    previousEmail = user?.email;
    await User.findByIdAndUpdate(id, { $set: { email: candidateData.email } });
  } catch (err) {
    return res.status(500).json({ message: err });
  }

  const queryProps = Object.keys(candidateData)
    .map((key) => `${key}: $${key}`)
    .join(", ");

  try {
    await neo4jWrapper(
      `MATCH (r:Recruiter {id: $id}) SET r += {${queryProps}}`,
      { ...candidateData, id },
    );
  } catch (err) {
    await User.findByIdAndUpdate(id, { $set: { email: previousEmail } });
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ message: "Success!" });
});

export default router;

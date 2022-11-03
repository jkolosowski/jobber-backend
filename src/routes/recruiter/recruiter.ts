import { Router } from "express";

import validate, { validateRecruiterFields } from "../../helpers/validation";
import { Recruiter } from "../../interfaces/userInterfaces";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";

const router = Router();

router.patch("/:id", async (req, res) => {
  const recruiterData: Recruiter = req.body;
  const [vRes, vErrors] = validate<Recruiter>(
    recruiterData,
    validateRecruiterFields,
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
    await User.findByIdAndUpdate(id, { $set: { email: recruiterData.email } });
  } catch (err) {
    return res.status(500).json({ message: err });
  }

  const queryProps = Object.keys(recruiterData)
    .map((key) => `${key}: $${key}`)
    .join(", ");

  try {
    await neo4jWrapper(
      `MATCH (r:Recruiter {id: $id}) SET r += {${queryProps}}`,
      { ...recruiterData, id },
    );
  } catch (err) {
    await User.findByIdAndUpdate(id, { $set: { email: previousEmail } });
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ message: "Success!" });
});

export default router;

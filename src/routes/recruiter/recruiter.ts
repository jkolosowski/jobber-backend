import { Router } from "express";

import validate, { validateRecruiterFields } from "../../helpers/validation";
import { Recruiter } from "../../interfaces/user";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";

const router = Router();

/**
 * @PATCH
 * Modify recruiter account information.
 * 
 * @path /recruiter/:id
 * @pathParam id: string            Id of a user.
 * 
 * @contentType application/json
 * 
 * @reqParam email: string          User email.
 * @reqParam firstName: string      First name.
 * @reqParam lastName: string       Last name.
 * @reqParam phoneNumber: string    Phone number.
 * @reqParam country: string        Home country.
 * @reqParam compant: string        The company for which the recruiter works.
 * 
 * @resParam message: string        Response message.
 */
router.patch("/:id", async (req, res) => {
  //TODO: Check credentials (authorize and check if user id is equal to request id)
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

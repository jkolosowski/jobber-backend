import { Router, Request, Response } from "express";

import validate, { validateCandidateFields } from "../../helpers/validation";
import { Candidate } from "../../interfaces/user";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";

const router = Router();

/**
 * @PATCH
 * Modify candidate account information.
 *
 * @path /candidate
 *
 * @contentType application/json
 *
 * @reqParam email: string          User email.
 * @reqParam firstName: string      First name.
 * @reqParam lastName: string       Last name.
 * @reqParam phoneNumber: string    Phone number.
 * @reqParam country: string        Home country.
 * @reqParam portfolio: string      Portfolio of a candidate.
 * @reqParam bio: string            Short description about candidate.
 *
 * @resParam message: string        Response message.
 */
router.patch("/", async (req: Request, res: Response) => {
  //TODO: Check credentials (check if user id is equal to request id)

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

  const _id = req?.user?._id.toString();
  const previousEmail = req?.user?.email;

  try {
    await User.findByIdAndUpdate(_id, { $set: { email: candidateData.email } });
  } catch (err) {
    return res.status(500).json({ message: err });
  }

  const queryProps = Object.keys(candidateData)
    .map((key) => `${key}: $${key}`)
    .join(", ");

  try {
    await neo4jWrapper(
      `MATCH (r:Candidate {_id: $_id}) SET r += {${queryProps}}`,
      { ...candidateData, _id },
    );
  } catch (err) {
    await User.findByIdAndUpdate(_id, { $set: { email: previousEmail } });
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ message: "Success!" });
});

export default router;

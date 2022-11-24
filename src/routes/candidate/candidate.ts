import { Router, Request, Response } from "express";

import { validateCandidateFields } from "../../helpers/validation/validation";
import { Candidate } from "../../interfaces/user";
import { validateRequestBody } from "../../config/middlewares";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";
import { getQueryProps } from "../../helpers/query";

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
router.patch(
  "/",
  validateRequestBody<Candidate>(validateCandidateFields),
  async (req: Request, res: Response) => {
    const { email, ...candidateData }: Candidate = req.body;
    const _id = req.user!._id.toString();
    const previousEmail = req?.user?.email;

    try {
      await User.findByIdAndUpdate(_id, {
        $set: { email: email },
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }

    const queryProps = getQueryProps(candidateData);

    try {
      await neo4jWrapper(
        `MATCH (c:Candidate {_id: $_id}) SET c += {${queryProps}} RETURN c`,
        { ...candidateData, _id },
      );
    } catch (err) {
      await User.findByIdAndUpdate(_id, { $set: { email: previousEmail } });
      return res.status(500).json({ message: err });
    }

    return res.status(200).json({ message: "Success!" });
  },
);

export default router;

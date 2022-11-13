import { Router, Request, Response } from "express";

import validate, {
  validateOfferFields,
  validateRecruiterFields,
} from "../../helpers/validation";
import { Recruiter } from "../../interfaces/user";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";
import { Offer } from "../../interfaces/offer";
import { getQueryProps } from "../../helpers/query";

const router = Router();

/**
 * @PATCH
 * Modify recruiter account information.
 *
 * @path /recruiter
 *
 * @contentType application/json
 *
 * @reqParam email: string          User email.
 * @reqParam firstName: string      First name.
 * @reqParam lastName: string       Last name.
 * @reqParam phoneNumber: string    Phone number.
 * @reqParam country: string        Home country.
 * @reqParam company: string        The company for which the recruiter works.
 *
 * @resParam message: string        Response message.
 */
router.patch("/", async (req: Request, res: Response) => {
  //TODO: Check credentials (check if user id is equal to request id)

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

  const _id = req?.user?._id.toString();
  const previousEmail = req?.user?.email;

  try {
    await User.findByIdAndUpdate(_id, { $set: { email: recruiterData.email } });
  } catch (err) {
    return res.status(500).json({ message: err });
  }

  const queryProps = getQueryProps(recruiterData);

  try {
    await neo4jWrapper(
      `MATCH (r:Recruiter {_id: $_id}) SET r += {${queryProps}}`,
      { ...recruiterData, _id },
    );
  } catch (err) {
    await User.findByIdAndUpdate(_id, { $set: { email: previousEmail } });
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ message: "Success!" });
});

/**
 * @POST
 * Create a new offer and relation between recruiter and offer.
 *
 * @path /recruiter/offer
 *
 * @contentType application/json
 *
 * @reqParam title: string          Offer title.
 * @reqParam companyName: string      Company name.
 * @reqParam location: string       Location.
 * @reqParam experience: number    Needed experience.
 * @reqParam bottomPayrange: number        Bottom payrange.
 * @reqParam topPayrange: number       Top Payrange.
 * @reqParam currency: string        Currency.
 * @reqParam description: string        Description of the offer.
 *
 * @resParam message: string        Response message.
 * @resParam offer: Offer        Response offer object.
 *
 */
router.post("/offer", async (req: Request, res: Response) => {
  const offerData: Offer = req.body;
  offerData.status = "open";
  const [vRes, vErrors] = validate<Offer>(offerData, validateOfferFields);

  if (!vRes) {
    return res.status(400).json({
      message: vErrors,
    });
  }

  const _id = req?.user?._id.toString();
  const queryProps = getQueryProps(offerData);

  try {
    const records = await neo4jWrapper(
      `MATCH (r:Recruiter {_id: $_id})
      CREATE (o:Offer {${queryProps}, id:randomUUID()})
      MERGE (r)-[:CREATE_OFFER]->(o)
      RETURN o
      `,
      { ...offerData, _id },
    );
    const offer: Offer = records.records[0].get("o").properties;
    return res.status(200).json({ message: "Success!", offer: offer });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @PATCH
 * Update offer.
 *
 * @path /recruiter/offer/:id
 * @pathParam id: string            Id of a offer.
 * 
 * @contentType application/json

 * @reqParam title: string          Offer title.
 * @reqParam companyName: string      Company name.
 * @reqParam location: string       Location.
 * @reqParam experience: number    Needed experience.
 * @reqParam bottomPayrange: number        Bottom payrange.
 * @reqParam topPayrange: number       Top Payrange.
 * @reqParam currency: string        Currency.
 * @reqParam description: string        Description of the offer.
 * @reqParam status: string        Status offer (open or close).
 * 
 * @resParam message: string        Response message.
 * @resParam offer: Offer       Response offer object.
 *
 */
router.patch("/offer/:id", async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const offerData: Offer = req.body;
  const [vRes, vErrors] = validate<Offer>(offerData, validateOfferFields);

  if (!vRes) {
    return res.status(400).json({
      message: vErrors,
    });
  }

  const queryProps = getQueryProps(offerData);

  try {
    const records = await neo4jWrapper(
      `MATCH (o:Offer {id:$id}) SET o += {${queryProps}}
      RETURN o
      `,
      { ...offerData, id },
    );
    const offer: Offer = records.records[0].get("o").properties;

    return res.status(200).json({ message: "Success!", offer: offer });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

export default router;

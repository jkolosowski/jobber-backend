import { Router, Request, Response } from "express";
import { validateCandidateFields } from "../../helpers/validation/validation";
import { Candidate } from "../../interfaces/user";
import { validateRequestBody } from "../../config/middlewares";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";
import { getQueryProps } from "../../helpers/query";
import { Offer } from "../../interfaces/offer";
import {
  getOffer,
  getOffersFromRecords,
} from "../../helpers/converter/offerConverter";

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

/**
 * @POST
 * Candidate apply for offer.
 *
 * @path /candidate/offer/:id/apply
 *
 * @contentType application/json
 *
 *
 * @resParam message: string        Response message.
 * @resParam offer: Offer        Response offer object.
 *
 */
router.post("/offer/:id/apply", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();
  const id: string = req.params.id;

  try {
    const records = await neo4jWrapper(
      `MATCH (c:Candidate {_id: $_id})
      MATCH (o:Offer {id: $id})
      MERGE (c)-[:APPLIED_FOR {status: "waiting"}]->(o)
      RETURN o
      `,
      { _id, id },
    );
    const offer: Offer = getOffer(records.records[0], "o");
    return res.status(200).json({
      message: "Success!",
      offer,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @GET
 * Return all offers applied for by candidate.
 *
 * @path /candidate/offer
 *
 * @contentType application/json

 * @resParam message: string        Response message.
 * @resParam offers: {accepted:Array<Offer>, rejected:Array<Offer>, waiting:Array<Offer>}       Response object of grouped offers.
 *
 */
router.get("/offer", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();

  try {
    const recordsOffersAccepted = await neo4jWrapper(
      `MATCH (c:Candidate {_id: $_id})-[:APPLIED_FOR {status: "accepted"}]->(offerAccepted:Offer)
      RETURN offerAccepted
      `,
      { _id },
    );

    const recordsOffersRejected = await neo4jWrapper(
      `MATCH (c:Candidate {_id: $_id})-[:APPLIED_FOR {status: "rejected"}]->(offerRejected:Offer)
      RETURN offerRejected
      `,
      { _id },
    );

    const recordsOffersWaiting = await neo4jWrapper(
      `MATCH (c:Candidate {_id: $_id})-[:APPLIED_FOR {status: "waiting"}]->(offerWaiting:Offer)
      RETURN offerWaiting
      `,
      { _id },
    );

    const offersAccepted = getOffersFromRecords(
      recordsOffersAccepted,
      "offerAccepted",
    );

    const offersRejected = getOffersFromRecords(
      recordsOffersRejected,
      "offerRejected",
    );

    const offersWaiting = getOffersFromRecords(
      recordsOffersWaiting,
      "offerWaiting",
    );

    return res.status(200).json({
      message: "Success!",
      offers: {
        accepted: offersAccepted,
        rejected: offersRejected,
        waiting: offersWaiting,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @DELETE
 * Candidate cancel the application.
 *
 * @path /candidate/offer/:id/apply
 *
 * @contentType application/json
 *
 *
 * @resParam message: string        Response message.
 *
 */
router.delete("/offer/:id/apply", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();
  const id: string = req.params.id;

  try {
    const records = await neo4jWrapper(
      `MATCH (c:Candidate {_id: $_id})-[r:APPLIED_FOR]->(o:Offer {id: $id})
      DELETE r
      RETURN o
      `,
      { _id, id },
    );
    records.records[0].get("o").properties.id;

    return res.status(200).json({
      message: "Success!",
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

export default router;

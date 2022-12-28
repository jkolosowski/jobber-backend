import { Router, Request, Response, NextFunction } from "express";
import {
  validateOfferFields,
  validateRecruiterFields,
} from "../../helpers/validation/validation";
import { Recruiter } from "../../interfaces/user";
import { neo4jWrapper } from "../../config/neo4jDriver";
import User from "../../models/User";
import { Offer } from "../../interfaces/offer";
import { getQueryProps } from "../../helpers/query";
import { validateRequestBody } from "../../config/middlewares";
import {
  getOffer,
  getOffersFromRecords,
} from "../../helpers/converter/offerConverter";
import { getCandidatesFromRecords } from "../../helpers/converter/candidateConverte";
import { getProperties } from "../../helpers/neo4j";

const router = Router();

/**
 * @GET
 * GET recruiter account information.
 *
 * @path /recruiter
 *
 * @contentType application/json
 *
 *
 * @resParam message: string Response message.
 * @resParam recruiter: Recruiter    Response recruiter object.
 *
 * {
 *    id: string             id.
 *    email: string          User email.
 *    firstName: string      First name.
 *    lastName: string       Last name.
 *    phoneNumber: string    Phone number.
 *    country: string        Home country.
 *    company: string        The company for which the recruiter works.
 *    linkedin: string       The link to Linkedin.
 *    avatar: string         The link to avatar or Base64.
 * }
 *
 */
router.get("/", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();

  try {
    const userData = await neo4jWrapper(
      `MATCH (r:Recruiter {_id: $_id}) RETURN r`,
      {
        _id,
      },
    );
    const recruiter: Recruiter = getProperties(userData, ["r"], ["_id"])[0].r;
    return res.status(200).json({ message: "Success!", recruiter });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

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
 * @reqParam linkedin: string       The link to Linkedin.
 * @reqParam avatar: string         The link to avatar or Base64.
 *
 *
 * @resParam message: string        Response message.
 * @resParam recruiter: Recruiter    Response recruiter object.
 *
 */
router.patch(
  "/",
  validateRequestBody<Recruiter>(validateRecruiterFields),
  async (req: Request, res: Response) => {
    const recruiterData: Recruiter = req.body;

    const _id = req?.user?._id.toString();
    const previousEmail = req?.user?.email;

    try {
      await User.findByIdAndUpdate(_id, {
        $set: { email: recruiterData.email },
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }

    const queryProps = getQueryProps(recruiterData);

    // TODO: Handling picture (avatar)
    try {
      const userData = await neo4jWrapper(
        `MATCH (r:Recruiter {_id: $_id}) SET r += {${queryProps}} RETURN r`,
        { ...recruiterData, _id },
      );

      const recruiter: Recruiter = getProperties(userData, ["r"], ["_id"])[0].r;
      return res.status(200).json({ message: "Success!", recruiter });
    } catch (err) {
      await User.findByIdAndUpdate(_id, { $set: { email: previousEmail } });
      return res.status(500).json({ message: err });
    }
  },
);

// ========================================Offers========================================

/**
 * @GET
 * Get recruiter offer with specified ID.
 *
 * @path /recruiter/offer/:id
 * @pathParam id: string Id of a offer.
 *
 * @contentType application/json
 *
 * @resParam message: string Response message.
 * @resParam offer: Offer    Response offer object.
 *
 */
router.get(
  "/offer/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const offerId: string = req.params.id;
    const userId = req.user?._id.toString();

    try {
      const records = await neo4jWrapper(
        `
       MATCH (:Recruiter {_id: $userId})-[:CREATE_OFFER]->(o:Offer {id: $offerId})
       RETURN o
      `,
        { userId, offerId },
      );
      const offer: Offer = getOffer(records.records[0], "o");

      return res.status(200).json({
        message: "Success!",
        offer,
      });
    } catch (err) {
      return next(err);
    }
  },
);

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
router.post(
  "/offer",
  validateRequestBody<Offer>(validateOfferFields),
  async (req: Request, res: Response) => {
    const offerData: Offer = req.body;
    offerData.status = "open";
    const _id = req?.user?._id.toString();
    const queryProps = getQueryProps(offerData);

    try {
      const records = await neo4jWrapper(
        `MATCH (r:Recruiter {_id: $_id})
      CREATE (o:Offer {${queryProps}, id:randomUUID(), creationDate:datetime({timezone: 'Europe/Warsaw'})})
      MERGE (r)-[:CREATE_OFFER]->(o)
      RETURN o
      `,
        { ...offerData, _id },
      );
      const offer: Offer = getOffer(records.records[0], "o");

      return res.status(200).json({
        message: "Success!",
        offer,
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
);

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
 * @reqParam status: string        Status offer (open or closed).
 * 
 * @resParam message: string        Response message.
 * @resParam offer: Offer       Response offer object.
 *
 */
router.patch(
  "/offer/:id",
  validateRequestBody<Offer>(validateOfferFields),
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const userId = req?.user?._id.toString();
    const offerData: Offer = req.body;
    const queryProps = getQueryProps(offerData);

    try {
      const records = await neo4jWrapper(
        `MATCH (:Recruiter {_id: $userId})-[:CREATE_OFFER]->(o:Offer {id:$id}) SET o += {${queryProps}}
      RETURN o
      `,
        { ...offerData, id, userId },
      );

      const data = records.records[0];

      if (data === undefined) {
        return res.status(200).json({
          message: "Offer did not find",
        });
      }

      const offer: Offer = getOffer(data, "o");

      return res.status(200).json({
        message: "Success!",
        offer,
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
);

/**
 * @GET
 * Return all offers which recruiter created.
 *
 * @path /recruiter/offer
 *
 * @contentType application/json
 *
 * @resParam message: string        Response message.
 * @resParam offers: Array<Offer>        Response list of offer objects.
 *
 */
router.get("/offer", async (req: Request, res: Response) => {
  const offerData: Offer = req.body;
  const _id = req?.user?._id.toString();

  try {
    const records = await neo4jWrapper(
      `MATCH (r:Recruiter {_id: $_id})-[:CREATE_OFFER]->(o:Offer)
      RETURN o
      `,
      { ...offerData, _id },
    );
    const offers = getOffersFromRecords(records, "o");

    return res.status(200).json({ message: "Success!", offers: offers });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @GET
 * Return all candidates who applied for the offer.
 *
 * @path /recruiter/offer/:id/candidate
 * @pathParam id: string            Id of a offer.
 *
 * @contentType application/json

 * @resParam message: string        Response message.
 * @resParam candidates: {accepted:Array<Candidate>, rejected:Array<Candidate>, waiting:Array<Candidate>}       Response object of grouped candidates.
 *
 */
router.get("/offer/:id/candidate", async (req: Request, res: Response) => {
  const id: string = req.params.id;

  try {
    const recordsCandidateAccepted = await neo4jWrapper(
      `MATCH (candidateAccepted:Candidate)-[:APPLIED_FOR {status: "accepted"}]->(o:Offer {id:$id})
      RETURN candidateAccepted
      `,
      { id },
    );

    const recordsCandidatesRejected = await neo4jWrapper(
      `MATCH (candidateRejected:Candidate)-[:APPLIED_FOR {status: "rejected"}]->(o:Offer {id:$id})
      RETURN candidateRejected
      `,
      { id },
    );

    const recordsCandidatesWaiting = await neo4jWrapper(
      `MATCH (candidateWaiting:Candidate)-[:APPLIED_FOR {status: "waiting"}]->(o:Offer {id:$id})
      RETURN candidateWaiting
      `,
      { id },
    );

    const candidatesAccepted = getCandidatesFromRecords(
      recordsCandidateAccepted,
      "candidateAccepted",
    );

    const candidatesRejected = getCandidatesFromRecords(
      recordsCandidatesRejected,
      "candidateRejected",
    );

    const candidatesWaiting = getCandidatesFromRecords(
      recordsCandidatesWaiting,
      "candidateWaiting",
    );

    return res.status(200).json({
      message: "Success!",
      candidates: {
        accepted: candidatesAccepted,
        rejected: candidatesRejected,
        waiting: candidatesWaiting,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @PATCH
 * Recruiter chnage status of application.
 *
 * @path /recruiter/offer/:id/apply?status=&idCandidate=
 * @pathParam id: string            Id of a offer.
 *
 *
 * @queryParam status: string            Status of application.
 * @queryParam idCandidate: string            Id of a candidate.
 *
 *
 * @contentType application/json
 *
 *
 * @resParam message: string        Response message.
 *
 */
router.patch("/offer/:id/apply", async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const idCandidate = req.query.idCandidate;
  const status = req.query.status;

  if (status === "rejected" || status === "accepted" || status === "waiting") {
    try {
      const records = await neo4jWrapper(
        `MATCH (c:Candidate {id: $idCandidate})-[r:APPLIED_FOR]->(o:Offer {id:$id})
        SET r.status = $status
        RETURN o
      `,
        { idCandidate, id, status },
      );
      records.records[0].get("o").properties.id;

      return res.status(200).json({
        message: "Success!",
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  } else {
    return res.status(400).json({
      message: "Bad value status",
    });
  }
});

export default router;

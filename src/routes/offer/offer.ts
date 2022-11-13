import { Router, Request, Response } from "express";

import { neo4jWrapper } from "../../config/neo4jDriver";
import { Offer } from "../../interfaces/offer";

const router = Router();

/**
 * @GET
 * Return all offers with status open.
 *
 * @path /offer
 *
 * @contentType application/json

 * @resParam message: string        Response message.
 * @resParam offers: Array<Offer>       Response array of offer objects.
 *
 */
router.get("/", async (_, res: Response) => {
  try {
    const records = await neo4jWrapper(
      `MATCH (o:Offer {status:"open"})
      RETURN o
      `,
      {},
    );
    const init: Array<Offer> = [];
    const offers: Array<Offer> = records.records.reduce((result, record) => {
      const offer: Offer = record.get("o").properties;
      if (offer) {
        return [offer, ...result];
      }
      return result;
    }, init);

    return res.status(200).json({ message: "Success!", offers: offers });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @GET
 * Return specific offer.
 *
 * @path /offer/:id
 * @pathParam id: string            Id of a offer.
 * 
 * @contentType application/json

 * @resParam message: string        Response message.
 * @resParam offer: Offer       Response offer object.
 *
 */
router.get("/:id", async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const records = await neo4jWrapper(
      `MATCH (o:Offer {id:$id})
      RETURN o
      `,
      { id },
    );
    const offer: Offer = records.records[0].get("o").properties;

    return res.status(200).json({ message: "Success!", offer: offer });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

export default router;

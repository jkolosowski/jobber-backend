import { Router, Request, Response, NextFunction } from "express";

import { neo4jWrapper } from "../../config/neo4jDriver";
import { getProperties } from "../../helpers/neo4j";

const router = Router();

/**
 *
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id.toString();

  try {
    const records = await neo4jWrapper(
      "MATCH (u:User {_id: $userId})--(m:Message)--(r:User) \
      WITH r, MAX(m.date) AS max \
      MATCH (m:Message) \
      WHERE m.date = max \
      WITH r, m, NOT EXISTS((r)-[:SENT]->(m)) AS isOutMsg \
      RETURN r{.*, _id: ''} AS user, m AS latestMessage, isOutMsg OR m.isRead AS markAsRead \
      ORDER BY m.date DESC",
      {
        userId,
      },
    );

    return res.status(200).json({
      message: "Success!",
      conversations: getProperties<any>(records, [
        "user",
        "latestMessage",
        "markAsRead",
      ]),
    });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/get-unread-count",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id.toString();

    try {
      const records = await neo4jWrapper(
        "MATCH (u:User {_id: $userId})<-[:TO]-(m:Message {isRead: false})<-[:SENT]-(r:User) \
        RETURN COUNT(DISTINCT(r)) AS unReadCount",
        {
          userId,
        },
      );

      const result = getProperties<any>(records, ["unReadCount"])[0];

      if (result) {
        return res.status(200).json({
          message: "Success!",
          unReadCount: result.unReadCount.low,
        });
      }

      throw Error("apiGetUnreadCountError");
    } catch (err) {
      return next(err);
    }
  },
);

/**
 *
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id.toString();
  const { id } = req.params;

  try {
    const records = await neo4jWrapper(
      "MATCH (s:User {_id: $senderId}) \
      MATCH (r:User {id: $receiverId}) \
      WITH s, r \
      OPTIONAL MATCH (s)-[:SENT]->(outMsg:Message)-[:TO]->(r) \
      WITH s, r, outMsg \
      OPTIONAL MATCH (r)-[:SENT]->(incMsg:Message)-[:TO]->(s) \
      SET incMsg.isRead = true \
      WITH r, COLLECT(DISTINCT(outMsg{.*, received: false})) + COLLECT(DISTINCT(incMsg{.*, received: true})) AS messages \
      RETURN r{.*, _id: ''} AS receiver, apoc.coll.sortMaps(messages, 'date') AS messages",
      {
        senderId: userId,
        receiverId: id,
      },
    );

    const result = getProperties<any>(records, ["receiver", "messages"])[0];

    if (result) {
      return res.status(200).json({
        message: "Success!",
        conversation: {
          user: result.receiver,
          messages: result.messages,
        },
      });
    }

    throw Error("apiConversationNotFound");
  } catch (err) {
    return next(err);
  }
});

export default router;

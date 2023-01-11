import { Router, Request, Response } from "express";

import { validateRequestBody, authenticate } from "../../config/middlewares";
import { neo4jWrapper } from "../../config/neo4jDriver";
import { getProperties } from "../../helpers/converter/commonConverter";
import { validateUpdateCredentialsFields } from "../../helpers/validation/validation";
import { Additional } from "../../interfaces/additional";
import { UpdateCredentialsReq } from "../../interfaces/auth";
import { Education } from "../../interfaces/education";
import { Experience } from "../../interfaces/experience";
import { Candidate, Recruiter, UserInit } from "../../interfaces/user";
import User from "../../models/User";

const router = Router();

/**
 * @GET
 * Return user object.
 *
 * @path /user
 *
 * @contentType application/json
 *
 * @reqParam email: string            User email.
 * @reqParam password: string         User password.
 *
 * @resParam message: string          Response message.
 * @resParam user: object             User information.
 * @resParam user.id: string          User ID (UUIDv4 standard).
 * @resParam user.email: string       User email.
 * @resParam user.firstName: string   User first name.
 * @resParam user.lastName: string    User last name.
 * @resParam user.accountType: string User account type.
 */

router.get("/", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();

  try {
    const userData = await neo4jWrapper(
      `MATCH (u:User {_id: $_id}) WITH distinct labels(u) AS l, u RETURN u, l`,
      { _id },
    );

    const userResult: UserInit = getProperties(userData, ["u"], ["_id"])[0].u;

    const accountType: string = userData.records[0]
      .get("l")
      .filter((role: string) => role !== "User")[0];

    return res.status(201).json({
      message: "Success!",
      user: { ...userResult, accountType },
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @PATCH
 * Update user email and password.
 *
 * @path /user
 *
 * @contentType application/json
 *
 * @reqParam email: string            User email.
 * @reqParam password: string         User password.
 * @reqParam newPassword: string      User new password.
 *
 * @resParam message: string          Response message.
 * @resParam user: object             User information.
 * @resParam user.id: string          User ID (UUIDv4 standard).
 * @resParam user.email: string       User email.
 * @resParam user.firstName: string   User first name.
 * @resParam user.lastName: string    User last name.
 * @resParam user.accountType: string User account type.
 */
router.patch(
  "/",
  validateRequestBody<UpdateCredentialsReq>(validateUpdateCredentialsFields),
  authenticate,
  async (req: Request, res: Response) => {
    // TODO: Marek Połom - Introduce Mongo transactions (replica set) to get rid of all this redundant code.
    const { newEmail, newPassword, password }: UpdateCredentialsReq = req.body;
    const _id = req.user?._id.toString();

    if (
      (!newEmail || newEmail === "") &&
      (!newPassword || newPassword === "")
    ) {
      return res
        .status(400)
        .json({ message: "Missing both new email and new password!" });
    }

    const newUserEmail =
      !newEmail || newEmail === "" ? req.user!.email : newEmail;
    const newUserPassword =
      !newPassword || newPassword === "" ? password : newPassword;

    try {
      await req.user?.changePassword(password, newUserPassword);
    } catch (err) {
      return res.status(500).json({ message: err });
    }

    try {
      await User.findByIdAndUpdate(_id, {
        $set: { email: newUserEmail },
      });
    } catch (err) {
      await req.user?.changePassword(newUserPassword, password);

      return res.status(500).json({ message: err });
    }

    try {
      const userData = await neo4jWrapper(
        "MATCH (u:User {_id: $_id}) SET u += {email: $email} RETURN u",
        { email: newUserEmail, _id },
      );
      const userProperties = getProperties(userData, ["u"], ["_id"])[0].u;

      return res.status(200).json({
        message: "Success!",
        user: { ...userProperties, accountType: req.user?.accountType },
      });
    } catch (err) {
      await req.user?.changePassword(newUserPassword, password);

      await User.findByIdAndUpdate(_id, {
        $set: { email: req.user?.email },
      });

      return res.status(500).json({ message: err });
    }
  },
);

/**
 * @DELETE
 * Delete user and all associated nodes and relations.
 *
 * @path /user
 *
 * @contentType application/json
 *
 * @resParam message: string     Response message.
 */
router.delete("/", async (req: Request, res: Response) => {
  const _id = req.user?._id.toString();

  await User.findByIdAndDelete(_id);
  await neo4jWrapper(
    `MATCH (u:User {_id: $_id}) WITH u 
    OPTIONAL MATCH (u)-[:CREATE_OFFER]->(o:Offer)
    OPTIONAL MATCH (u)-[:HAS_EDUCATION]->(edu:Education)
    OPTIONAL MATCH (u)-[:HAS_ADDITIONAL]->(adi:Additional)
    OPTIONAL MATCH (u)-[:HAS_EXPERIENCE]->(exp:Experience) SET o.status = 'closed' 
    DETACH DELETE u, edu, exp, adi`,
    { _id },
  );

  return res.status(200).json({ message: "Success!" });
});

/**
 * @GET
 * GET candidate account information.
 *
 * @path user/candidate
 * @pathParam id: id candidate (optional).
 *
 * @contentType application/json
 *
 *
 * @resParam message: string Response message.
 * @resParam candidate: Candidate    Response candidate object.
 *
 *
 * {
 *    id: string             id.
 *    email: string          User email.
 *    firstName: string      First name.
 *    lastName: string       Last name.
 *    phoneNumber: string    Phone number.
 *    country: string        Home country.
 *    portfolio: string      Portfolio of a candidate.
 *    bio: string            Short description about candidate.
 *    linkedin: string       The link to Linkedin.
 *    avatar: string         The link to avatar or Base64.
 * }
 * @resParam experience: Array<Experience>    Response array with experience objects.
 * @resParam education: Array<Education>      Response array with education objects.
 * @resParam additional: Array<Additional>    Response array with additional objects.
 *
 *
 */
router.get("/candidate", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();
  const id = req.query.id;

  const idCandidate = id ? id : _id;
  const idType = id ? "id" : "_id";

  try {
    const userData = await neo4jWrapper(
      `MATCH (c:Candidate {${idType}: $idCandidate}) RETURN c`,
      {
        idCandidate,
      },
    );
    const candidate: Candidate = getProperties(userData, ["c"], ["_id"])[0]?.c;

    const recordsExperience = await neo4jWrapper(
      `MATCH (c:Candidate {${idType}: $idCandidate})-[:HAS_EXPERIENCE]->(e: Experience) RETURN e`,
      { idCandidate },
    );
    const experience: Array<Experience> =
      getProperties(recordsExperience, ["e"], []).map((exp) => exp.e) || [];

    const recordsEducation = await neo4jWrapper(
      `MATCH (c:Candidate {${idType}: $idCandidate})-[:HAS_EDUCATION]->(e: Education) RETURN e`,
      { idCandidate },
    );
    const education: Array<Education> =
      getProperties(recordsEducation, ["e"], []).map((edu) => edu.e) || [];

    const recordsAdditional = await neo4jWrapper(
      `MATCH (c:Candidate {${idType}: $idCandidate})-[:HAS_ADDITIONAL]->(a: Additional) RETURN a`,
      { idCandidate },
    );
    const additional: Array<Additional> =
      getProperties(recordsAdditional, ["a"], []).map((adi) => adi.a) || [];

    return res.status(200).json({
      message: "Success!",
      candidate,
      experience,
      education,
      additional,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

/**
 * @GET
 * GET recruiter account information.
 *
 * @path user/recruiter
 * @pathParam id: id recruiter (optional).
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
router.get("/recruiter", async (req: Request, res: Response) => {
  const _id = req?.user?._id.toString();
  const id = req.query.id;

  const idCandidate = id ? id : _id;
  const idType = id ? "id" : "_id";

  try {
    const userData = await neo4jWrapper(
      `MATCH (r:Recruiter {${idType}: $idCandidate}) RETURN r`,
      {
        idCandidate,
      },
    );
    const recruiter: Recruiter = getProperties(userData, ["r"], ["_id"])[0].r;
    return res.status(200).json({ message: "Success!", recruiter });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

export default router;

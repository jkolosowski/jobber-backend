import Ajv, { ValidateFunction } from "ajv";
import { RegisterReq, UpdateCredentialsReq } from "../../interfaces/auth";
import { Offer } from "../../interfaces/offer";
import { Candidate, Recruiter } from "../../interfaces/user";

import {
  userFragileProps,
  userBasicProps,
  userAdditionalProps,
  candidateOnlyProps,
  recruiterOnlyProps,
  offerProps,
  userEmail,
  userPassword,
  userNewPassword,
} from "./validationInterfaces";

const ajv = new Ajv();

const validate = <T>(data: T, validation: ValidateFunction) => {
  const result = validation(data);
  return [result, ajv.errorsText(validation.errors)];
};

export const validateRegisterFields = ajv.compile<RegisterReq>({
  properties: {
    ...userFragileProps,
    ...userBasicProps,
  },
  required: ["email", "password", "accountType", "firstName", "lastName"],
  type: "object",
  additionalProperties: false,
});

export const validateUpdateCredentialsFields = ajv.compile<UpdateCredentialsReq>({
  properties: {
    ...userEmail,
    ...userPassword,
    ...userNewPassword
  },
  required: ["email", "password"],
  type: "object",
  additionalProperties: false,
});

export const validateRecruiterFields = ajv.compile<Recruiter>({
  properties: {
    ...userBasicProps,
    ...userAdditionalProps,
    ...recruiterOnlyProps,
  },
  required: ["firstName", "lastName", "phoneNumber", "country"],
  type: "object",
  additionalProperties: false,
});

export const validateCandidateFields = ajv.compile<Candidate>({
  properties: {
    ...userBasicProps,
    ...userAdditionalProps,
    ...candidateOnlyProps,
  },
  required: ["firstName", "lastName", "phoneNumber", "country"],
  type: "object",
  additionalProperties: false,
});

export const validateOfferFields = ajv.compile<Offer>({
  properties: {
    ...offerProps,
  },
  required: ["title", "companyName", "location", "experience", "description"],
  type: "object",
  additionalProperties: false,
});

export default validate;

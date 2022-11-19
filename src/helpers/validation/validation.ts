import Ajv, { ValidateFunction } from "ajv";
import { RegisterReq, UpdateCredentialsReq } from "../../interfaces/auth";
import { Offer } from "../../interfaces/offer";
import { Candidate, Recruiter } from "../../interfaces/user";
import { emptyStringRegEx, passwordRegEx, newPasswordRegEx, emailRegEx, newEmailRegEx } from "./regex";

import {
  userFragileProps,
  userBasicProps,
  userAdditionalProps,
  candidateOnlyProps,
  recruiterOnlyProps,
  offerProps,
  userPassword,
  newUserPassword,
  newUserEmail,
} from "./validationInterfaces";

const ajv = new Ajv();

ajv.addFormat("password", passwordRegEx);
ajv.addFormat("newPassword", newPasswordRegEx);
ajv.addFormat("email", emailRegEx);
ajv.addFormat("newEmail", newEmailRegEx);
ajv.addFormat("emptyString", emptyStringRegEx);

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

export const validateUpdateCredentialsFields =
  ajv.compile<UpdateCredentialsReq>({
    properties: {
      ...userPassword,
      ...newUserEmail,
      ...newUserPassword,
    },
    required: ["password"],
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

import Ajv, { ValidateFunction } from "ajv";

import {
  userFragileProps,
  userBasicProps,
  userAdditionalProps,
  candidateOnlyProps,
  recruiterOnlyProps,
} from "./validationInterfaces";

const ajv = new Ajv();

const validate = <T>(data: T, validation: ValidateFunction) => {
  const result = validation(data);
  return [result, ajv.errorsText(validation.errors)];
};

export const validateRegisterFields = ajv.compile({
  properties: {
    ...userFragileProps,
    ...userBasicProps,
  },
  required: ["email", "password", "accountType", "firstName", "lastName"],
  type: "object",
  additionalProperties: false,
});

export const validateRecruiterFields = ajv.compile({
  properties: {
    ...userBasicProps,
    ...userAdditionalProps,
    ...recruiterOnlyProps,
  },
  required: ["firstName", "lastName", "email", "phoneNumber", "country"],
  type: "object",
  additionalProperties: false,
});

export const validateCandidateFields = ajv.compile({
  properties: {
    ...userBasicProps,
    ...userAdditionalProps,
    ...candidateOnlyProps,
  },
  required: ["firstName", "lastName", "email", "phoneNumber", "country"],
  type: "object",
  additionalProperties: false,
});

export default validate;

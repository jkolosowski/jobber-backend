import Ajv, { ValidateFunction } from "ajv";

const ajv = new Ajv();

const validate = <T>(data: T, validation: ValidateFunction) => {
    const result = validation(data);
    return [result, ajv.errorsText(validation.errors)]
};

export const validateRegisterFields = ajv.compile({
  properties: {
    email: {
      type: "string",
    },
    password: {
      type: "string",
    },
    accountType: {
      type: "string",
      pattern: "^(Candidate|Recruiter)$",
    },
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    phoneNumber: {
      type: "string",
    },
    country: {
      type: "string",
    },
    linkedin: {
      type: "string",
    },
    avatar: {
      type: "string",
    },
    portfolio: {
      type: "string",
    },
    bio: {
      type: "string",
    },
    company: {
      type: "string",
    },
  },
  required: ["email", "password", "accountType", "firstName", "lastName", "phoneNumber", "country", "linkedin", "avatar"],
  type: "object",
  additionalProperties: true,
});

export default validate;

import { Additional } from "../interfaces/additional";
import { Education } from "../interfaces/education";
import { Experience } from "../interfaces/experience";
import { Offer } from "../interfaces/offer";
import { Candidate, Recruiter } from "../interfaces/user";

export const getQueryProps = (
  props:
    | Offer
    | Recruiter
    | Candidate
    | Omit<Candidate, "email">
    | Experience
    | Education
    | Additional,
) =>
  Object.keys(props)
    .map((key) => `${key}: $${key}`)
    .join(", ");

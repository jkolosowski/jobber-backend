import { Offer } from "../interfaces/offer";
import { Candidate, Recruiter } from "../interfaces/user";

export const getQueryProps = (props: Offer | Recruiter | Candidate) =>
  Object.keys(props)
    .map((key) => `${key}: $${key}`)
    .join(", ");

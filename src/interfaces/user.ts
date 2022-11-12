import { Email, FirstName, LastName } from "./primitive";

export interface User extends Email, FirstName, LastName {
  phoneNumber: string;
  country: string;
  linkedin: string;
  avatar: string;
}

export interface CandidateProps {
  portfolio: string;
  bio: string;
}

export interface RecruiterProps {
  company: string;
}

export interface Candidate extends User, CandidateProps {}

export interface Recruiter extends User, RecruiterProps {}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

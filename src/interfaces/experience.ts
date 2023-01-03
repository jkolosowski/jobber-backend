import { DateTime } from "neo4j-driver";

export interface Experience {
  id?: string;
  jobTitle: string;
  company: string;
  country: string;
  from: string | DateTime;
  to: string | DateTime;
  details?: string;
}

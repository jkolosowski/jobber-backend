import { DateTime } from "neo4j-driver";

export interface Education {
  id?: string;
  school: string;
  degree: string;
  name: string;
  from: string | DateTime;
  to: string | DateTime;
  details?: string;
}

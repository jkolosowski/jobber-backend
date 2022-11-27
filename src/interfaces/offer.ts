import { DateTime } from "neo4j-driver";

export interface Offer {
  id?: string;
  creationDate?: string | DateTime;
  title: string;
  companyName: string;
  location: string;
  experience: string;
  bottomPayrange?: number;
  topPayrange?: number;
  currency?: string;
  description: string;
  status: "open" | "closed";
  isNew?: boolean;
}

import { QueryResult } from "neo4j-driver";
import { Dict } from "neo4j-driver-core/types/record";
import { Candidate } from "../../interfaces/user";

export const getCandidatesFromRecords = (
  records: QueryResult<Dict<PropertyKey, any>>,
  property: string,
) => {
  const init: Array<Candidate> = [];
  return records.records.reduce((result, record) => {
    const candidate: Candidate = record.get(property).properties;
    if (candidate) {
      return [candidate, ...result];
    }
    return result;
  }, init);
};

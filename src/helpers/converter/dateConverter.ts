import { DateTime } from "neo4j-driver";

export const parseDate = (neo4jDateTime: DateTime): string => {
  const { year, month, day, hour, minute, second, nanosecond } = neo4jDateTime;

  const date = new Date(
    year.toInt(),
    month.toInt() - 1,
    day.toInt(),
    hour.toInt(),
    minute.toInt(),
    second.toInt(),
    nanosecond.toInt() / 1000000,
  );

  return date.toISOString();
};

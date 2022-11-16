import { QueryResult } from "neo4j-driver";

export const getProperties = (
  queryResult: QueryResult,
  pickKeys: string[],
  omitProps: string[] = [],
) => {
  return queryResult.records.map((record) => {
    return pickKeys.reduce((result, key) => {
      const recordProps = Object.entries<any>(
        record.get(key).properties,
      ).reduce((props, [key, value]) => {
        if (omitProps.find((omitProp) => omitProp === key)) {
          return props;
        }
        props[key] = value;
        return { ...props };
      }, {} as { [key: string]: any });
      result[key] = recordProps;
      return { ...result };
    }, {} as { [key: string]: any });
  });
};

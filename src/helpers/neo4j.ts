import { QueryResult } from "neo4j-driver";

const acceptedTypes = ["string", "number", "boolean", "bigint"];

export const getProperties = <T>(
  queryResult: QueryResult,
  pickKeys: string[],
  omitProps: string[] = [],
  renameKeysMap: Record<string, string> = {},
) => {
  return queryResult.records.map((record) => {
    return pickKeys.reduce((result, key) => {
      const recordValue = record.get(key);
      const type = typeof recordValue as string;
      let recordProps;
      if (
        acceptedTypes.find(t => t === type) ||
        Array.isArray(recordValue) ||
        !recordValue.properties
      ) {
        recordProps = recordValue;
      } else {
        recordProps = Object.entries<any>(recordValue.properties).reduce(
          (props, [key, value]) => {
            if (omitProps.find((omitProp) => omitProp === key)) {
              return props;
            }
            props[key] = value;
            return { ...props };
          },
          {} as Record<string, any>,
        );
      }
      const renameKey = renameKeysMap[key];
      result[renameKey ? renameKey : key] = recordProps;
      return { ...result };
    }, {} as Record<string, any>);
  }) as T;
};

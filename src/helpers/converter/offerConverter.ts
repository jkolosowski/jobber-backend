import { DateTime, QueryResult } from "neo4j-driver";
import { Offer } from "../../interfaces/offer";
import { Dict } from "neo4j-driver-core/types/record";
import { parseDate } from "./dateConverter";

export const getOffersFromRecords = (
  records: QueryResult<Dict<PropertyKey, any>>,
  property: string,
) => {
  const init: Array<Offer> = [];
  return records.records.reduce((result, record) => {
    const offer: Offer = getOffer(record, property);
    if (offer) {
      return [offer, ...result];
    }
    return result;
  }, init);
};

const newOfferTime = 60000;

export const getOffer = (record: any, property: string) => {
  if (!record) throw Error("apiOfferNotFound");

  const offer: Offer = record.get(property).properties;
  let recruiterId: string | undefined = undefined;

  try {
    recruiterId = record.get("recruiterId");
  } catch (err) {}

  const creationDate: string = parseDate(offer.creationDate as DateTime);

  const nowDate: number = new Date().getTime();

  const isNew: boolean =
    nowDate < new Date(creationDate).getTime() + newOfferTime;

  return {
    ...offer,
    creationDate: creationDate,
    isNew: isNew,
    recruiterId,
  } as Offer;
};

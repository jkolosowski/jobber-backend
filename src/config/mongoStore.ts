import mongoConnection from "./mongo";
import MongoStore from "connect-mongo";

export default MongoStore.create({
  client: mongoConnection.getClient(),
  collectionName: "sessions",
  stringify: false,
});

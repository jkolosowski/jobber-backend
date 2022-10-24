import mongoose from "./mongo";
import MongoStore from "connect-mongo";

export default MongoStore.create({
  client: mongoose.connection.getClient(),
  collectionName: "sessions",
  stringify: false,
});

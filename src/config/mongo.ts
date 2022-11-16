import serverConfig from "./serverConfig";
import mongoose from "mongoose";

const username = serverConfig.mongoConfig.username;
const password = serverConfig.mongoConfig.password;
const host = serverConfig.mongoConfig.host;
const port = serverConfig.mongoConfig.port;
const database = serverConfig.mongoConfig.database;

const mongoHost = `mongodb://${host}:${port}`;
mongoose.connect(mongoHost, {
  user: username,
  pass: password,
  dbName: database,
});

const mongoConnection = mongoose.connection
  .on("connected", () => {
    console.log("Connected to MongoDB");
  })
  .on("error", (error) => {
    console.log("Error on MongoDB connection\n", error);
  })
  .on("disconnected", () => {
    console.log("Disconnected from MongoDB");
  });

export const Schema = mongoose.Schema;
export const model = mongoose.model;

export default mongoConnection;

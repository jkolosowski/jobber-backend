import dotenv from "dotenv";

import { ServerConfig } from "../interfaces/serverConfig";

dotenv.config();

const serverConfig: ServerConfig = {
  protocol: process.env.PROTOCOL === "https" ? "https" : "http",
  port: process.env.PORT || "5000",
  appPort: process.env.APP_PORT || "3000",
  secret: process.env.EXPRESS_SESSION_SECRET || "jobber",
  mongoConfig: {
    host: process.env.MONGO_HOST || "localhost",
    port: process.env.MONGO_PORT || "27017",
    username: process.env.MONGO_USERNAME || "mongo",
    password: process.env.MONGO_PASSWORD || "password",
    database: process.env.MONGO_DATABASE || "jobber",
  },
  neo4jConfig: {
    host: process.env.NEO4J_HOST || "localhost",
    port: process.env.NEO4J_PORT || "7687",
    username: process.env.NEO4J_USERNAME || "neo4j",
    password: process.env.NEO4J_PASSWORD || "password",
  },
};

export default serverConfig;

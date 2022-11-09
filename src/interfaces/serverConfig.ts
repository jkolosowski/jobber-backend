export interface Database {
  host: string;
  port: string;
  username: string;
  password: string;
}

export interface Neo4jConfig extends Database {}

export interface MongoConfig extends Database {
  database: string;
}

export interface ServerConfig {
  port: string;
  appPort: string;
  protocol: "http" | "https";
  secret: string;
  mongoConfig: MongoConfig;
  neo4jConfig: Neo4jConfig;
}

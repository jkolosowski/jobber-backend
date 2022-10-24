import dotenv from 'dotenv';

dotenv.config();

interface Database {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface Neo4jConfig extends Database {}

interface MongoConfig extends Database {}

interface ServerConfig {
  port: string;
  protocol: 'http' | 'https';
  secret: string;
  mongoConfig: MongoConfig;
  neo4jConfig: Neo4jConfig;
}

const serverConfig: ServerConfig = {
    protocol: process.env.PROTOCOL === 'https' ? 'https' : 'http',
    port: process.env.PORT || '5000',
    secret: process.env.EXPRESS_SESSION_SECRET || 'jobber',
    mongoConfig: {
        host: process.env.MONGO_HOST || 'localhost',
        port: process.env.MONGO_PORT || '27017',
        username: process.env.MONGO_USERNAME || 'mongo',
        password: process.env.MONGO_PASSWORD || 'password',
        database: process.env.MONGO_DATABASE || 'jobber',
    },
    neo4jConfig: {
        host: process.env.NEO4J_HOST || 'localhost',
        port: process.env.NEO4J_PORT || '5432',
        username: process.env.NEO4J_USERNAME || 'neo4j',
        password: process.env.NEO4J_PASSWORD || 'password',
        database: process.env.NEO4J_DATABASE || 'jobber',
    }
}

export default serverConfig;

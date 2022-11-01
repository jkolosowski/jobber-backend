import serverConfig from "./serverConfig";

import neo4j from "neo4j-driver";

const { host, username, password, port } = serverConfig.neo4jConfig;

const driver = neo4j.driver(
  `bolt://${host}:${port}`,
  neo4j.auth.basic(username, password)
);

export const verify = () => {
  driver
    .getServerInfo()
    .then(() => {
      console.log(`Connected with Neo4j!`);
    })
    .catch((err) => {
      console.log("Can't connect to Neo4j\n", err);
      setTimeout(verify, 5000);
    });
};
verify();

export const neo4jWrapper = async (
  query: string,
  parameters: object
) => {
  const session = driver.session();
  try {
    return await session.run(query, parameters);
  } catch (err) {
    throw err;
  } finally {
    try {
      session.close();
    } catch (err) {
      throw err;
    }
  }
};

export default driver;

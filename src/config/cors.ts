import serverConfig from "./serverConfig";

const corsConfig = {
  credentials: true,
  origin: `${serverConfig.protocol}://localhost:${serverConfig.appPort || 3000}`,
};

export default corsConfig;

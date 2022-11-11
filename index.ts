import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import passport from "passport";
import passportLocal from "passport-local";

import corsConfig from "./src/config/cors";
import driver from "./src/config/neo4jDriver";
import routes from "./src/routes/router";
import serverConfig from "./src/config/serverConfig";
import session from "./src/config/session";
import User, { usernameField } from "./src/models/User";

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsConfig));

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new passportLocal.Strategy(
    {
      usernameField: usernameField,
    },
    User.authenticate(),
  ),
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(routes);

app.listen(serverConfig.port, () => {
  console.log(
    `⚡️[server]: Server is running at ${serverConfig.protocol}://localhost:${serverConfig.port}`,
  );
});

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import passportLocal from "passport-local";

import serverConfig from "./src/config/serverConfig";
import session from "./src/config/session";
import driver from "./src/config/neo4jDriver";
import User, { usernameField } from "./src/models/User";
import routes from "./src/routes/routes";

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

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

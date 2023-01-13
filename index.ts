import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import passport from "passport";
import passportLocal from "passport-local";

import corsConfig from "./src/config/cors";
import routes from "./src/routes/routes";
import serverConfig from "./src/config/serverConfig";
import session from "./src/config/session";
import User, { usernameField } from "./src/models/User";
import errorHandler from "./src/errors/errorHandler";
import bodyParser from "body-parser";

const app: Express = express();

app.use(bodyParser.json({ limit: "15MB" }));
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

app.use(errorHandler);

app.listen(serverConfig.port, () => {
  console.log(
    `⚡️[server]: Server is running at ${serverConfig.protocol}://localhost:${serverConfig.port}`,
  );
});

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import passport from "passport";
import passportLocal from "passport-local";

import app from "./src/config/expressApp";
import server from "./src/config/server";
import corsConfig from "./src/config/cors";
import routes from "./src/routes/routes";
import serverConfig from "./src/config/serverConfig";
import session from "./src/config/session";
import User, { usernameField } from "./src/models/User";
import errorHandler from "./src/errors/errorHandler";
import io from "./src/config/socket";

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

io;

server.listen(serverConfig.port, () => {
  console.log(
    `⚡️[server]: Server is running at ${serverConfig.protocol}://localhost:${serverConfig.port}`,
  );
});

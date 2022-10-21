import express, { Express } from "express";
import serverConfig from "./src/config/serverConfig";
import session from "./src/config/session";
import cookieParser from "cookie-parser";
import passport from "passport";
import passportLocal from "passport-local";
import User from "./src/models/User";

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy({}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(serverConfig.port, () => {
  console.log(
    `⚡️[server]: Server is running at ${serverConfig.protocol}://localhost:${serverConfig.port}`
  );
});

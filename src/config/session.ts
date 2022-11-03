import mongoStore from "./mongoStore";
import session from "express-session";
import serverConfig from "./serverConfig";

export default session({
  secret: serverConfig.secret,
  saveUninitialized: false,
  resave: false,
  store: mongoStore,
});

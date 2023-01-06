import http from "http";

import app from "./expressApp"

export default http.createServer(app);

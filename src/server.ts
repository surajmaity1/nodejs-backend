import { config } from "@/config/config";
import logger from "./utils/logger";
import app from "./app";
import * as http from "http";

const port = parseInt(config.PORT);

app.set("port", port);

let server;

if (process.env.ENV !== "TEST") {
  server = http.createServer(app);
  server.listen(port);
  server.on("listening", listening);

  function listening() {
    logger.info(`Server running on port:${port}`);
  }
}

export default process.env.ENV === "TEST" ? app : server;

import { logInit, logger } from "./utils/logger";
import app from "./app";
import getConfig from "./utils/createConfig";
import * as fs from "fs";
import * as path from "path";

// READ FILE JWT PUBLIC KEY FIRST
export const publicKey = fs.readFileSync(
  path.join(__dirname, "../public_key.pem"),
  "utf-8"
);

// RUN THE SERVER GATEWAY
async function run() {
  try {
    const currentEnv = process.env.NODE_ENV || "development";
    const config = getConfig(currentEnv);

    // Activate Logger
    logInit({ env: process.env.NODE_ENV, logLevel: config.logLevel });

    // Start Server
    logger.info(`Gateway server has started with process id ${process.pid}`);

    const server = app.listen(config.port, () => {
      logger.info(`Gateway server is listening on port: ${config.port}`);
    });

    const exitHandler = async () => {
      if (server) {
        server.close(async () => {
          logger.info("server closed!");
          logger.info("mongodb disconnected!");

          // Gracefully Terminate
          process.exit(1); // terminate the process due to error
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      logger.error("unhandled error", { error });
      exitHandler();
    };

    // Error that might occur duing execution that not caught by any try/catch blocks
    process.on("uncaughtException", unexpectedErrorHandler); // Syncronous
    process.on("unhandledRejection", unexpectedErrorHandler); // Asyncronous

    // A termination signal typically sent from OS or other software (DOCKER, KUBERNETES)
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received");
      if (server) {
        // Stop the server from accepting new request but keeps existing connection open until all ongoin request are done
        server.close();
      }
    });
  } catch (error) {
    logger.error("Gateway Service Failed", { error });
    process.exit(1);
  }
}

// start the api-gateway server
run();

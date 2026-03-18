import "dotenv/config";
import { app } from "./app";
import { parseEnv } from "./config/env";
import logger from "./lib/logger";

const config = parseEnv(process.env);

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
});

// Graceful shutdown
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

import winston from "winston";

export function createLogger(level = "info"): winston.Logger {
  return winston.createLogger({
    level,
    format:
      process.env["NODE_ENV"] === "production"
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
    transports: [
      process.env["NODE_ENV"] === "test"
        ? new winston.transports.Console({ silent: true })
        : new winston.transports.Console(),
    ],
  });
}

const logger = createLogger(process.env["LOG_LEVEL"] ?? "info");
export default logger;

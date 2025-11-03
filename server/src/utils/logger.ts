import { WinstonModule } from "nest-winston";
import * as winston from "winston";

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: "error.log",
    level: "error",
  }),
  new winston.transports.File({ filename: "combined.log" }),
];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

export default loggerConfig;


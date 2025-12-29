import pino from "pino";

const isDevelopment = import.meta.env.DEV;

/**
 * Structured logger using pino.
 * In development, uses pino-pretty for readable output.
 * In production, outputs JSON for log aggregation services.
 */
export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  browser: {
    asObject: true,
  },
});

export type { Logger } from "pino";

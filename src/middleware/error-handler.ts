import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";
import { buildError } from "../lib/response";
import { NotFoundError } from "../services/book.service";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).json(buildError(err.message));
    return;
  }

  logger.error(err);
  res.status(500).json(buildError("Internal Server Error"));
}

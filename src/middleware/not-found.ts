import type { Request, Response } from "express";
import { buildError } from "../lib/response";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json(buildError("Not Found"));
}

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BookService } from "../services/book.service";
import type { FindAllOptions } from "../repositories/book.repository";
import {
  CreateBookSchema,
  UpdateBookSchema,
  PatchBookSchema,
  IdParamSchema,
  formatZodError,
  type PatchBook,
} from "../schemas/book.schema";
import { buildSuccess, buildError, buildPaginated } from "../lib/response";

export class BookController {
  constructor(private readonly service: BookService) {}

  async listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const querySchema = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).optional(),
      });

      const parseResult = querySchema.safeParse(req.query);
      if (!parseResult.success) {
        res.status(422).json(buildError(formatZodError(parseResult.error)));
        return;
      }

      const { page, limit } = parseResult.data;
      const options: FindAllOptions = {
        ...(page !== undefined && { page }),
        ...(limit !== undefined && { limit }),
      };
      const result = await this.service.listBooks(options);

      const meta = {
        total: result.total,
        page: page ?? 1,
        limit: limit ?? result.total,
      };

      res.status(200).json(buildPaginated(result.books, meta));
    } catch (err) {
      next(err);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = IdParamSchema.safeParse(req.params);
      if (!parseResult.success) {
        res.status(422).json(buildError(formatZodError(parseResult.error)));
        return;
      }

      const { id } = parseResult.data;
      const book = await this.service.getBook(id);

      res.status(200).json(buildSuccess(book));
    } catch (err) {
      next(err);
    }
  }

  async createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = CreateBookSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(422).json(buildError(formatZodError(parseResult.error)));
        return;
      }

      const book = await this.service.createBook(parseResult.data);

      res.status(201).json(buildSuccess(book));
    } catch (err) {
      next(err);
    }
  }

  async replaceBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParseResult = IdParamSchema.safeParse(req.params);
      if (!idParseResult.success) {
        res.status(422).json(buildError(formatZodError(idParseResult.error)));
        return;
      }

      const bodyParseResult = UpdateBookSchema.safeParse(req.body);
      if (!bodyParseResult.success) {
        res.status(422).json(buildError(formatZodError(bodyParseResult.error)));
        return;
      }

      const { id } = idParseResult.data;
      const book = await this.service.replaceBook(id, bodyParseResult.data);

      res.status(200).json(buildSuccess(book));
    } catch (err) {
      next(err);
    }
  }

  async patchBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParseResult = IdParamSchema.safeParse(req.params);
      if (!idParseResult.success) {
        res.status(422).json(buildError(formatZodError(idParseResult.error)));
        return;
      }

      const bodyParseResult = PatchBookSchema.safeParse(req.body);
      if (!bodyParseResult.success) {
        res.status(422).json(buildError(formatZodError(bodyParseResult.error)));
        return;
      }

      const { id } = idParseResult.data;
      const book = await this.service.patchBook(id, bodyParseResult.data as PatchBook);

      res.status(200).json(buildSuccess(book));
    } catch (err) {
      next(err);
    }
  }

  async deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = IdParamSchema.safeParse(req.params);
      if (!parseResult.success) {
        res.status(422).json(buildError(formatZodError(parseResult.error)));
        return;
      }

      const { id } = parseResult.data;
      await this.service.deleteBook(id);

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

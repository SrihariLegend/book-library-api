import { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { InMemoryBookRepository } from "../repositories/in-memory-book.repository";
import { BookService } from "../services/book.service";

export function createBookRouter(): Router {
  const repo = new InMemoryBookRepository();
  const service = new BookService(repo);
  const controller = new BookController(service);
  const router = Router();

  router.get("/", (req, res, next) => controller.listBooks(req, res, next));
  router.get("/:id", (req, res, next) => controller.getBook(req, res, next));
  router.post("/", (req, res, next) => controller.createBook(req, res, next));
  router.put("/:id", (req, res, next) => controller.replaceBook(req, res, next));
  router.patch("/:id", (req, res, next) => controller.patchBook(req, res, next));
  router.delete("/:id", (req, res, next) => controller.deleteBook(req, res, next));

  return router;
}

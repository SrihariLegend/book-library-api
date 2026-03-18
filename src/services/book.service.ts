import type { IBookRepository, FindAllOptions } from "../repositories/book.repository";
import type { Book, CreateBookDto, UpdateBookDto, PatchBookDto } from "../types/book";

export class NotFoundError extends Error {
  public readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BookService {
  constructor(private readonly repo: IBookRepository) {}

  async listBooks(options?: FindAllOptions) {
    return this.repo.findAll(options);
  }

  async getBook(id: string): Promise<Book> {
    const book = await this.repo.findById(id);
    if (!book) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }
    return book;
  }

  async createBook(dto: CreateBookDto): Promise<Book> {
    return this.repo.create(dto);
  }

  async replaceBook(id: string, dto: UpdateBookDto): Promise<Book> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }
    return updated;
  }

  async patchBook(id: string, dto: PatchBookDto): Promise<Book> {
    const patched = await this.repo.patch(id, dto);
    if (!patched) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }
    return patched;
  }

  async deleteBook(id: string): Promise<void> {
    const exists = await this.repo.findById(id);
    if (!exists) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }
    await this.repo.delete(id);
  }
}

import { randomUUID } from "crypto";
import type {
  Book,
  CreateBookDto,
  UpdateBookDto,
  PatchBookDto,
} from "../types/book";
import type {
  IBookRepository,
  FindAllOptions,
  FindAllResult,
} from "./book.repository";

export class InMemoryBookRepository implements IBookRepository {
  private store: ReadonlyArray<Book> = [];

  async findAll(options?: FindAllOptions): Promise<FindAllResult> {
    const limit = options?.limit ?? this.store.length;
    const page = options?.page ?? 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const books = this.store.slice(startIndex, endIndex);

    return {
      books,
      total: this.store.length,
    };
  }

  async findById(id: string): Promise<Book | undefined> {
    return this.store.find((book) => book.id === id);
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const now = new Date().toISOString();

    const book: Book = Object.freeze({
      id: randomUUID(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    });

    this.store = [...this.store, book];

    return book;
  }

  async update(
    id: string,
    dto: UpdateBookDto
  ): Promise<Book | undefined> {
    const index = this.store.findIndex((book) => book.id === id);

    if (index === -1) {
      return undefined;
    }

    const existingBook = this.store[index]!;
    const now = new Date().toISOString();

    const updatedBook: Book = Object.freeze({
      id: existingBook.id,
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      publishedYear: dto.publishedYear,
      genre: dto.genre,
      createdAt: existingBook.createdAt,
      updatedAt: now,
    });

    this.store = [
      ...this.store.slice(0, index),
      updatedBook,
      ...this.store.slice(index + 1),
    ];

    return updatedBook;
  }

  async patch(
    id: string,
    dto: PatchBookDto
  ): Promise<Book | undefined> {
    const index = this.store.findIndex((book) => book.id === id);

    if (index === -1) {
      return undefined;
    }

    const existingBook = this.store[index]!;
    const now = new Date().toISOString();

    const patchedBook: Book = Object.freeze({
      id: existingBook.id,
      title: dto.title ?? existingBook.title,
      author: dto.author ?? existingBook.author,
      isbn: dto.isbn ?? existingBook.isbn,
      publishedYear: dto.publishedYear ?? existingBook.publishedYear,
      genre: dto.genre ?? existingBook.genre,
      createdAt: existingBook.createdAt,
      updatedAt: now,
    });

    this.store = [
      ...this.store.slice(0, index),
      patchedBook,
      ...this.store.slice(index + 1),
    ];

    return patchedBook;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.store.findIndex((book) => book.id === id);

    if (index === -1) {
      return false;
    }

    this.store = [
      ...this.store.slice(0, index),
      ...this.store.slice(index + 1),
    ];

    return true;
  }
}

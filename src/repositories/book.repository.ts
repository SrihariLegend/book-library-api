import type { Book, CreateBookDto, UpdateBookDto, PatchBookDto } from "../types/book";

export type FindAllOptions = { page?: number; limit?: number };
export type FindAllResult = { books: ReadonlyArray<Book>; total: number };

export interface IBookRepository {
  findAll(options?: FindAllOptions): Promise<FindAllResult>;
  findById(id: string): Promise<Book | undefined>;
  create(dto: CreateBookDto): Promise<Book>;
  update(id: string, dto: UpdateBookDto): Promise<Book | undefined>;
  patch(id: string, dto: PatchBookDto): Promise<Book | undefined>;
  delete(id: string): Promise<boolean>;
}

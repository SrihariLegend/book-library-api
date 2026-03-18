export const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Biography",
  "History",
] as const;

export type Genre = (typeof GENRES)[number];

export type Book = Readonly<{
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: Genre;
  createdAt: string;
  updatedAt: string;
}>;

export type CreateBookDto = Omit<Book, "id" | "createdAt" | "updatedAt">;
export type UpdateBookDto = CreateBookDto;
export type PatchBookDto = Partial<CreateBookDto>;

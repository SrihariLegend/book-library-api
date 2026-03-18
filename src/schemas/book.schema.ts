import { z } from "zod";
import type { PatchBookDto } from "../types/book";
import { GENRES } from "../types/book";

export const CreateBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must not exceed 200 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author must not exceed 100 characters"),
  isbn: z.string().regex(/^\d{13}$/, "ISBN must be 13 digits"),
  publishedYear: z
    .number()
    .int("Published year must be an integer")
    .min(1000, "Published year must be at least 1000")
    .refine((year) => year <= new Date().getFullYear(), {
      message: `Published year must not exceed ${new Date().getFullYear()}`,
    }),
  genre: z.enum(GENRES),
});

export const UpdateBookSchema = CreateBookSchema;

export const PatchBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must not exceed 200 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author must not exceed 100 characters"),
  isbn: z.string().regex(/^\d{13}$/, "ISBN must be 13 digits"),
  publishedYear: z
    .number()
    .int("Published year must be an integer")
    .min(1000, "Published year must be at least 1000")
    .refine((year) => year <= new Date().getFullYear(), {
      message: `Published year must not exceed ${new Date().getFullYear()}`,
    }),
  genre: z.enum(GENRES),
}).partial();

export const IdParamSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type CreateBook = z.infer<typeof CreateBookSchema>;
export type UpdateBook = z.infer<typeof UpdateBookSchema>;
export type PatchBook = PatchBookDto;
export type IdParam = z.infer<typeof IdParamSchema>;

// Re-export PatchBookDto for convenience
export type { PatchBookDto };

export function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return issues.join("; ");
}

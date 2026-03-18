import { CreateBookSchema, UpdateBookSchema, PatchBookSchema, IdParamSchema } from '../../../schemas/book.schema';

describe("Book Schemas", () => {
  describe("CreateBookSchema", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("accepts valid payload", () => {
      const result = CreateBookSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    describe("title validation", () => {
      it("rejects missing title", () => {
        const payload = { ...validPayload };
        delete (payload as any).title;
        const result = CreateBookSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("rejects empty string title", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, title: "" });
        expect(result.success).toBe(false);
      });

      it("rejects title over 200 chars", () => {
        const longTitle = "a".repeat(201);
        const result = CreateBookSchema.safeParse({ ...validPayload, title: longTitle });
        expect(result.success).toBe(false);
      });
    });

    describe("author validation", () => {
      it("rejects missing author", () => {
        const payload = { ...validPayload };
        delete (payload as any).author;
        const result = CreateBookSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("rejects author over 100 chars", () => {
        const longAuthor = "a".repeat(101);
        const result = CreateBookSchema.safeParse({ ...validPayload, author: longAuthor });
        expect(result.success).toBe(false);
      });
    });

    describe("isbn validation", () => {
      it("rejects missing isbn", () => {
        const payload = { ...validPayload };
        delete (payload as any).isbn;
        const result = CreateBookSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("rejects invalid isbn (non-13-digit string)", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, isbn: "1234" });
        expect(result.success).toBe(false);
      });

      it("rejects isbn with non-digit characters", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, isbn: "978044101359a" });
        expect(result.success).toBe(false);
      });
    });

    describe("publishedYear validation", () => {
      it("rejects missing publishedYear", () => {
        const payload = { ...validPayload };
        delete (payload as any).publishedYear;
        const result = CreateBookSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("rejects publishedYear below 1000", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, publishedYear: 999 });
        expect(result.success).toBe(false);
      });

      it("rejects publishedYear above current year (2026)", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, publishedYear: 2027 });
        expect(result.success).toBe(false);
      });

      it("accepts publishedYear equal to current year", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, publishedYear: 2026 });
        expect(result.success).toBe(true);
      });

      it("accepts publishedYear of 1000", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, publishedYear: 1000 });
        expect(result.success).toBe(true);
      });
    });

    describe("genre validation", () => {
      it("rejects missing genre", () => {
        const payload = { ...validPayload };
        delete (payload as any).genre;
        const result = CreateBookSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it("rejects invalid genre", () => {
        const result = CreateBookSchema.safeParse({ ...validPayload, genre: "InvalidGenre" });
        expect(result.success).toBe(false);
      });

      it("accepts all valid genres", () => {
        const validGenres = [
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
        ];

        validGenres.forEach((genre) => {
          const result = CreateBookSchema.safeParse({ ...validPayload, genre });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe("UpdateBookSchema", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("accepts complete valid payload", () => {
      const result = UpdateBookSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects when title is missing", () => {
      const payload = { ...validPayload };
      delete (payload as any).title;
      const result = UpdateBookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects when author is missing", () => {
      const payload = { ...validPayload };
      delete (payload as any).author;
      const result = UpdateBookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects when isbn is missing", () => {
      const payload = { ...validPayload };
      delete (payload as any).isbn;
      const result = UpdateBookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects when publishedYear is missing", () => {
      const payload = { ...validPayload };
      delete (payload as any).publishedYear;
      const result = UpdateBookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects when genre is missing", () => {
      const payload = { ...validPayload };
      delete (payload as any).genre;
      const result = UpdateBookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("PatchBookSchema", () => {
    it("accepts with only title", () => {
      const result = PatchBookSchema.safeParse({ title: "New Title" });
      expect(result.success).toBe(true);
    });

    it("accepts with only author", () => {
      const result = PatchBookSchema.safeParse({ author: "New Author" });
      expect(result.success).toBe(true);
    });

    it("accepts with only genre", () => {
      const result = PatchBookSchema.safeParse({ genre: "Fantasy" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object (no-op patch)", () => {
      const result = PatchBookSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects invalid value when field is present (bad isbn)", () => {
      const result = PatchBookSchema.safeParse({ isbn: "1234" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid genre when present", () => {
      const result = PatchBookSchema.safeParse({ genre: "InvalidGenre" });
      expect(result.success).toBe(false);
    });

    it("accepts combination of valid optional fields", () => {
      const result = PatchBookSchema.safeParse({
        title: "Updated Title",
        author: "Updated Author",
        genre: "Mystery",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("IdParamSchema", () => {
    it("accepts valid UUID v4 string", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = IdParamSchema.safeParse({ id: validUuid });
      expect(result.success).toBe(true);
    });

    it("rejects non-UUID string (abc)", () => {
      const result = IdParamSchema.safeParse({ id: "abc" });
      expect(result.success).toBe(false);
    });

    it("rejects non-UUID string (123)", () => {
      const result = IdParamSchema.safeParse({ id: "123" });
      expect(result.success).toBe(false);
    });

    it("rejects empty string", () => {
      const result = IdParamSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing id", () => {
      const result = IdParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

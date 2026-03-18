import request from "supertest";
import { createApp } from "../../app";

describe("Books API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  describe("POST /api/v1/books", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should create a book with valid payload and return 201", async () => {
      const response = await request(app).post("/api/v1/books").send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe("Dune");
      expect(response.body.data.author).toBe("Frank Herbert");
      expect(response.body.data.isbn).toBe("9780441013593");
      expect(response.body.data.publishedYear).toBe(1965);
      expect(response.body.data.genre).toBe("Science Fiction");
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it("should return 422 when title is missing", async () => {
      const payload = { ...validPayload };
      delete (payload as any).title;

      const response = await request(app).post("/api/v1/books").send(payload);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe("string");
    });

    it("should return 422 when author is missing", async () => {
      const payload = { ...validPayload };
      delete (payload as any).author;

      const response = await request(app).post("/api/v1/books").send(payload);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 422 when ISBN is not 13 digits", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, isbn: "12345" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 422 when ISBN contains non-digits", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, isbn: "978044101359X" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
    });

    it("should return 422 when genre is invalid", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, genre: "InvalidGenre" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 422 when publishedYear is below 1000", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, publishedYear: 999 });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 422 when publishedYear is in the future", async () => {
      const futureYear = new Date().getFullYear() + 1;
      const response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, publishedYear: futureYear });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
    });
  });

  describe("GET /api/v1/books", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should return 200 with empty books array initially", async () => {
      const response = await request(app).get("/api/v1/books");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBeGreaterThanOrEqual(0);
    });

    it("should return 200 with books created in earlier tests", async () => {
      // Create a couple of books
      const book1Response = await request(app).post("/api/v1/books").send(validPayload);
      expect(book1Response.status).toBe(201);

      const book2Response = await request(app)
        .post("/api/v1/books")
        .send({ ...validPayload, title: "Foundation", isbn: "9780553293357", publishedYear: 1951 });
      expect(book2Response.status).toBe(201);

      // List books
      const listResponse = await request(app).get("/api/v1/books");

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.error).toBe(null);
      expect(Array.isArray(listResponse.body.data)).toBe(true);
      expect(listResponse.body.data.length).toBe(2);
      expect(listResponse.body.meta.total).toBe(2);
      expect(listResponse.body.meta.page).toBe(1);
    });

    it("should respect page and limit query parameters", async () => {
      // Create 5 books
      for (let i = 0; i < 5; i++) {
        const isbn = `978044101359${i}`.padEnd(13, "0");
        await request(app)
          .post("/api/v1/books")
          .send({ ...validPayload, isbn, title: `Book ${i}` });
      }

      // Get page 2 with limit 2
      const response = await request(app).get("/api/v1/books?page=2&limit=2");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.total).toBe(5);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(2);
    });

    it("should return 422 when page is not an integer", async () => {
      const response = await request(app).get("/api/v1/books?page=abc");

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe("string");
    });
  });

  describe("GET /api/v1/books/:id", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should return 200 with book for valid UUID that exists", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Get the book
      const response = await request(app).get(`/api/v1/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(response.body.data.id).toBe(bookId);
      expect(response.body.data.title).toBe("Dune");
    });

    it("should return 404 for valid UUID that does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app).get(`/api/v1/books/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe("string");
    });

    it("should return 422 for invalid UUID format", async () => {
      const response = await request(app).get("/api/v1/books/not-a-uuid");

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/books/:id", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    const updatePayload = {
      title: "Dune: Updated",
      author: "Frank Herbert",
      isbn: "9780441013594",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should return 200 with updated book for valid full payload", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Update the book
      const response = await request(app)
        .put(`/api/v1/books/${bookId}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(response.body.data.id).toBe(bookId);
      expect(response.body.data.title).toBe("Dune: Updated");
      expect(response.body.data.isbn).toBe("9780441013594");
    });

    it("should return 422 when missing required field in PUT", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Try to update without title
      const incompletePayload = { ...updatePayload };
      delete (incompletePayload as any).title;

      const response = await request(app).put(`/api/v1/books/${bookId}`).send(incompletePayload);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 when updating non-existent book", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .put(`/api/v1/books/${nonExistentId}`)
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 422 when updating with invalid field value", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Try to update with invalid genre
      const response = await request(app)
        .put(`/api/v1/books/${bookId}`)
        .send({ ...updatePayload, genre: "InvalidGenre" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
    });
  });

  describe("PATCH /api/v1/books/:id", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should return 200 with updated book for partial payload (only title)", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Patch the book with only title
      const response = await request(app)
        .patch(`/api/v1/books/${bookId}`)
        .send({ title: "Dune: Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(response.body.data.id).toBe(bookId);
      expect(response.body.data.title).toBe("Dune: Updated Title");
      expect(response.body.data.author).toBe("Frank Herbert"); // unchanged
      expect(response.body.data.isbn).toBe("9780441013593"); // unchanged
    });

    it("should return 200 when patching only author", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Patch the book with only author
      const response = await request(app)
        .patch(`/api/v1/books/${bookId}`)
        .send({ author: "Frank Herbert (Updated)" });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("Dune"); // unchanged
      expect(response.body.data.author).toBe("Frank Herbert (Updated)");
    });

    it("should return 422 when patching with invalid field value", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Try to patch with invalid genre
      const response = await request(app)
        .patch(`/api/v1/books/${bookId}`)
        .send({ genre: "InvalidGenre" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 when patching non-existent book", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .patch(`/api/v1/books/${nonExistentId}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should return 200 with empty patch (no changes)", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;
      const originalData = createResponse.body.data;

      // Patch with empty object
      const response = await request(app).patch(`/api/v1/books/${bookId}`).send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(bookId);
      expect(response.body.data.title).toBe(originalData.title);
      expect(response.body.data.author).toBe(originalData.author);
    });
  });

  describe("DELETE /api/v1/books/:id", () => {
    const validPayload = {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      publishedYear: 1965,
      genre: "Science Fiction",
    };

    it("should return 204 when deleting existing book", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Delete the book
      const response = await request(app).delete(`/api/v1/books/${bookId}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should return 404 when deleting non-existent book", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app).delete(`/api/v1/books/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).toBeDefined();
    });

    it("should not be able to get deleted book", async () => {
      // Create a book
      const createResponse = await request(app).post("/api/v1/books").send(validPayload);
      const bookId = createResponse.body.data.id;

      // Delete the book
      await request(app).delete(`/api/v1/books/${bookId}`);

      // Try to get it
      const response = await request(app).get(`/api/v1/books/${bookId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Security and Response Format", () => {
    it("should include security headers from helmet", async () => {
      const response = await request(app).get("/api/v1/books");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("every successful response should have success: true and error: null", async () => {
      const validPayload = {
        title: "Dune",
        author: "Frank Herbert",
        isbn: "9780441013593",
        publishedYear: 1965,
        genre: "Science Fiction",
      };

      const response = await request(app).post("/api/v1/books").send(validPayload);

      expect(response.body.success).toBe(true);
      expect(response.body.error).toBe(null);
      expect(response.body.data).not.toBe(null);
    });

    it("every error response should have success: false and data: null", async () => {
      const invalidPayload = {
        title: "Dune",
        // missing required fields
        isbn: "9780441013593",
        publishedYear: 1965,
      };

      const response = await request(app).post("/api/v1/books").send(invalidPayload);

      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe(null);
      expect(response.body.error).not.toBe(null);
    });
  });
});

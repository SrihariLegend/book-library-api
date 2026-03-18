import request from "supertest";
import { app } from "../../app";

describe("Book Library CRUD lifecycle", () => {
  let bookId: string;

  // Valid book payload for testing
  const validBookPayload = {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441013593",
    publishedYear: 1965,
    genre: "Science Fiction",
  };

  // Step 1: POST /api/v1/books with valid payload → 201 → capture bookId
  it("should create a new book and return 201 with book data including id", async () => {
    const response = await request(app)
      .post("/api/v1/books")
      .send(validBookPayload)
      .expect("Content-Type", /application\/json/)
      .expect(201);

    // Assert response envelope
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("error", null);
    expect(response.body).not.toHaveProperty("meta");

    // Assert book data structure
    const book = response.body.data;
    expect(book).toHaveProperty("id");
    expect(book).toHaveProperty("title", validBookPayload.title);
    expect(book).toHaveProperty("author", validBookPayload.author);
    expect(book).toHaveProperty("isbn", validBookPayload.isbn);
    expect(book).toHaveProperty("publishedYear", validBookPayload.publishedYear);
    expect(book).toHaveProperty("genre", validBookPayload.genre);
    expect(book).toHaveProperty("createdAt");
    expect(book).toHaveProperty("updatedAt");

    // Capture bookId for subsequent tests
    bookId = book.id;
    expect(typeof bookId).toBe("string");
    expect(bookId.length).toBeGreaterThan(0);
  });

  // Step 2: GET /api/v1/books/:bookId → 200, assert title and author
  it("should retrieve the created book by id and return 200 with correct data", async () => {
    const response = await request(app)
      .get(`/api/v1/books/${bookId}`)
      .expect("Content-Type", /application\/json/)
      .expect(200);

    // Assert response envelope
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("error", null);

    // Assert book data
    const book = response.body.data;
    expect(book.id).toBe(bookId);
    expect(book.title).toBe("Dune");
    expect(book.author).toBe("Frank Herbert");
  });

  // Step 3: PATCH /api/v1/books/:bookId with partial update → 200, assert new title and timestamp
  it("should partially update the book title via PATCH and return 200", async () => {
    const patchPayload = {
      title: "Dune Messiah",
    };

    const getBeforeResponse = await request(app).get(`/api/v1/books/${bookId}`);
    const originalCreatedAt = getBeforeResponse.body.data.createdAt;

    const response = await request(app)
      .patch(`/api/v1/books/${bookId}`)
      .send(patchPayload)
      .expect("Content-Type", /application\/json/)
      .expect(200);

    // Assert response envelope
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("error", null);

    // Assert patched data
    const book = response.body.data;
    expect(book.id).toBe(bookId);
    expect(book.title).toBe("Dune Messiah");
    expect(book.author).toBe("Frank Herbert"); // unchanged
    expect(book.isbn).toBe("9780441013593"); // unchanged
    expect(book.publishedYear).toBe(1965); // unchanged
    expect(book.genre).toBe("Science Fiction"); // unchanged

    // Assert timestamps
    expect(book.createdAt).toBe(originalCreatedAt);
    expect(book.updatedAt).not.toBe(originalCreatedAt);
  });

  // Step 4: PUT /api/v1/books/:bookId with full replacement → 200, assert all new fields
  it("should fully replace the book via PUT and return 200 with all new data", async () => {
    const replacePayload = {
      title: "Children of Dune",
      author: "Frank Herbert",
      isbn: "9780450028564",
      publishedYear: 1976,
      genre: "Science Fiction",
    };

    const response = await request(app)
      .put(`/api/v1/books/${bookId}`)
      .send(replacePayload)
      .expect("Content-Type", /application\/json/)
      .expect(200);

    // Assert response envelope
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("error", null);

    // Assert replaced data
    const book = response.body.data;
    expect(book.id).toBe(bookId);
    expect(book.title).toBe("Children of Dune");
    expect(book.author).toBe("Frank Herbert");
    expect(book.isbn).toBe("9780450028564");
    expect(book.publishedYear).toBe(1976);
    expect(book.genre).toBe("Science Fiction");
    expect(book).toHaveProperty("createdAt");
    expect(book).toHaveProperty("updatedAt");
  });

  // Step 5: GET /api/v1/books → 200, assert response contains the book
  it("should list all books and include the created book", async () => {
    const response = await request(app)
      .get("/api/v1/books")
      .expect("Content-Type", /application\/json/)
      .expect(200);

    // Assert response envelope with pagination
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("error", null);
    expect(response.body).toHaveProperty("meta");

    // Assert data is an array
    const books = response.body.data;
    expect(Array.isArray(books)).toBe(true);

    // Assert metadata
    const meta = response.body.meta;
    expect(meta).toHaveProperty("total");
    expect(meta).toHaveProperty("page");
    expect(meta).toHaveProperty("limit");

    // Assert our book is in the list
    const foundBook = books.find((b: any) => b.id === bookId);
    expect(foundBook).toBeDefined();
    expect(foundBook.title).toBe("Children of Dune");
  });

  // Step 6: DELETE /api/v1/books/:bookId → 204
  it("should delete the book and return 204 No Content", async () => {
    const response = await request(app)
      .delete(`/api/v1/books/${bookId}`)
      .expect(204);

    // 204 No Content should not have a body, but supertest allows checking it
    expect(response.body).toEqual({});
  });

  // Step 7: GET /api/v1/books/:bookId → 404
  it("should return 404 when trying to retrieve a deleted book", async () => {
    const response = await request(app)
      .get(`/api/v1/books/${bookId}`)
      .expect("Content-Type", /application\/json/)
      .expect(404);

    // Assert error response envelope
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
    expect(response.body.error.length).toBeGreaterThan(0);
  });
});

import { InMemoryBookRepository } from "../../../repositories/in-memory-book.repository";
import type { CreateBookDto } from "../../../types/book";

describe("InMemoryBookRepository", () => {
  let repository: InMemoryBookRepository;

  beforeEach(() => {
    repository = new InMemoryBookRepository();
  });

  describe("findAll()", () => {
    it("should return empty array initially", async () => {
      const result = await repository.findAll();
      expect(result.books).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return all books after creates", async () => {
      const book1 = await repository.create({
        title: "Book 1",
        author: "Author 1",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const book2 = await repository.create({
        title: "Book 2",
        author: "Author 2",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      const result = await repository.findAll();
      expect(result.books.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.books).toContainEqual(book1);
      expect(result.books).toContainEqual(book2);
    });

    it("should return all books with no args", async () => {
      await repository.create({
        title: "Book 1",
        author: "Author 1",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const result = await repository.findAll();
      expect(result.books.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it("should paginate with page and limit options", async () => {
      // Create 3 books
      await repository.create({
        title: "Book 1",
        author: "Author 1",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      await repository.create({
        title: "Book 2",
        author: "Author 2",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      await repository.create({
        title: "Book 3",
        author: "Author 3",
        isbn: "1111111111",
        publishedYear: 2022,
        genre: "Mystery",
      });

      // Page 1, limit 2 should return 2 books, total 3
      const page1 = await repository.findAll({ page: 1, limit: 2 });
      expect(page1.books.length).toBe(2);
      expect(page1.total).toBe(3);

      // Page 2, limit 2 should return 1 book, total 3
      const page2 = await repository.findAll({ page: 2, limit: 2 });
      expect(page2.books.length).toBe(1);
      expect(page2.total).toBe(3);
    });
  });

  describe("findById()", () => {
    it("should return undefined for unknown ID", async () => {
      const result = await repository.findById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return the correct book when found", async () => {
      const created = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const found = await repository.findById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe("create()", () => {
    it("should return a Book with system-assigned id (UUID)", async () => {
      const dto: CreateBookDto = {
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      };

      const book = await repository.create(dto);

      expect(book.id).toBeDefined();
      expect(typeof book.id).toBe("string");
      expect(book.id.length).toBeGreaterThan(0);
      // UUID v4 is typically 36 chars with hyphens
      expect(book.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should return a Book with createdAt and updatedAt as ISO strings", async () => {
      const book = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      expect(book.createdAt).toBeDefined();
      expect(book.updatedAt).toBeDefined();
      expect(typeof book.createdAt).toBe("string");
      expect(typeof book.updatedAt).toBe("string");
      // ISO string format check
      expect(new Date(book.createdAt).toISOString()).toBe(book.createdAt);
      expect(new Date(book.updatedAt).toISOString()).toBe(book.updatedAt);
    });

    it("should NOT mutate the input dto", async () => {
      const dto: CreateBookDto = {
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      };

      const dtoSnapshot = { ...dto };

      await repository.create(dto);

      expect(dto).toEqual(dtoSnapshot);
      expect((dto as any).id).toBeUndefined();
      expect((dto as any).createdAt).toBeUndefined();
      expect((dto as any).updatedAt).toBeUndefined();
    });

    it("should create independent book instances without shared references", async () => {
      const book1 = await repository.create({
        title: "Book 1",
        author: "Author 1",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const book2 = await repository.create({
        title: "Book 2",
        author: "Author 2",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      expect(book1.id).not.toBe(book2.id);
      expect(book1).not.toBe(book2);
    });

    it("should return a frozen book object", async () => {
      const book = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      expect(Object.isFrozen(book)).toBe(true);
    });
  });

  describe("update()", () => {
    it("should return updated book with all new fields and a new updatedAt", async () => {
      const created = await repository.create({
        title: "Original Title",
        author: "Original Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.update(created.id, {
        title: "New Title",
        author: "New Author",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      expect(updated).toBeDefined();
      expect(updated!.id).toBe(created.id);
      expect(updated!.title).toBe("New Title");
      expect(updated!.author).toBe("New Author");
      expect(updated!.isbn).toBe("0987654321");
      expect(updated!.publishedYear).toBe(2021);
      expect(updated!.genre).toBe("Fantasy");
      expect(updated!.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(updated!.updatedAt) > new Date(originalUpdatedAt)).toBe(
        true
      );
    });

    it("should return undefined for unknown ID", async () => {
      const result = await repository.update("unknown-id", {
        title: "New Title",
        author: "New Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      expect(result).toBeUndefined();
    });

    it("should NOT mutate the previously stored book", async () => {
      const created = await repository.create({
        title: "Original Title",
        author: "Original Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const snapshot = { ...created };

      await repository.update(created.id, {
        title: "New Title",
        author: "New Author",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      // Original should not be mutated
      expect(created).toEqual(snapshot);
      expect(created.title).toBe("Original Title");
      expect(created.author).toBe("Original Author");
    });

    it("should return a frozen updated book", async () => {
      const created = await repository.create({
        title: "Original Title",
        author: "Original Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const updated = await repository.update(created.id, {
        title: "New Title",
        author: "New Author",
        isbn: "0987654321",
        publishedYear: 2021,
        genre: "Fantasy",
      });

      expect(Object.isFrozen(updated)).toBe(true);
    });
  });

  describe("patch()", () => {
    it("should apply only provided fields, leaving others unchanged", async () => {
      const created = await repository.create({
        title: "Original Title",
        author: "Original Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const patched = await repository.patch(created.id, {
        title: "New Title",
      });

      expect(patched).toBeDefined();
      expect(patched!.title).toBe("New Title");
      expect(patched!.author).toBe("Original Author");
      expect(patched!.isbn).toBe("1234567890");
      expect(patched!.publishedYear).toBe(2020);
      expect(patched!.genre).toBe("Fiction");
    });

    it("should return undefined for unknown ID", async () => {
      const result = await repository.patch("unknown-id", {
        title: "New Title",
      });

      expect(result).toBeUndefined();
    });

    it("should update updatedAt even on patch", async () => {
      const created = await repository.create({
        title: "Original Title",
        author: "Original Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const originalUpdatedAt = created.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const patched = await repository.patch(created.id, {
        title: "New Title",
      });

      expect(patched!.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(patched!.updatedAt) > new Date(originalUpdatedAt)).toBe(
        true
      );
    });
  });

  describe("delete()", () => {
    it("should return true on success", async () => {
      const created = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const result = await repository.delete(created.id);
      expect(result).toBe(true);
    });

    it("should return false for unknown ID", async () => {
      const result = await repository.delete("unknown-id");
      expect(result).toBe(false);
    });

    it("should decrease length of findAll after delete", async () => {
      const created = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const beforeDelete = await repository.findAll();
      expect(beforeDelete.books.length).toBe(1);

      await repository.delete(created.id);

      const afterDelete = await repository.findAll();
      expect(afterDelete.books.length).toBe(0);
    });

    it("should make deleted book unretrievable via findById", async () => {
      const created = await repository.create({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        publishedYear: 2020,
        genre: "Fiction",
      });

      const foundBefore = await repository.findById(created.id);
      expect(foundBefore).toBeDefined();

      await repository.delete(created.id);

      const foundAfter = await repository.findById(created.id);
      expect(foundAfter).toBeUndefined();
    });
  });
});

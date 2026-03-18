import type { IBookRepository, FindAllResult } from "../../../repositories/book.repository";
import type { Book, CreateBookDto, UpdateBookDto, PatchBookDto } from "../../../types/book";
import { BookService, NotFoundError } from "../../../services/book.service";

class MockBookRepository implements IBookRepository {
  findAll = jest.fn<Promise<FindAllResult>, [any?]>();
  findById = jest.fn<Promise<Book | undefined>, [string]>();
  create = jest.fn<Promise<Book>, [CreateBookDto]>();
  update = jest.fn<Promise<Book | undefined>, [string, UpdateBookDto]>();
  patch = jest.fn<Promise<Book | undefined>, [string, PatchBookDto]>();
  delete = jest.fn<Promise<boolean>, [string]>();
}

describe("BookService", () => {
  let service: BookService;
  let mockRepo: MockBookRepository;

  const mockBook: Book = {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    publishedYear: 1925,
    genre: "Fiction",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    mockRepo = new MockBookRepository();
    service = new BookService(mockRepo);
    jest.clearAllMocks();
  });

  describe("listBooks()", () => {
    it("should call repo.findAll() without options and return result", async () => {
      const expected: FindAllResult = { books: [mockBook], total: 1 };
      mockRepo.findAll.mockResolvedValueOnce(expected);

      const result = await service.listBooks();

      expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expected);
    });

    it("should call repo.findAll({ page, limit }) when pagination options provided", async () => {
      const expected: FindAllResult = { books: [mockBook], total: 10 };
      mockRepo.findAll.mockResolvedValueOnce(expected);

      const result = await service.listBooks({ page: 1, limit: 10 });

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(expected);
    });

    it("should return empty books array when no books found", async () => {
      const expected: FindAllResult = { books: [], total: 0 };
      mockRepo.findAll.mockResolvedValueOnce(expected);

      const result = await service.listBooks();

      expect(result).toEqual(expected);
    });
  });

  describe("getBook(id)", () => {
    it("should call repo.findById(id) and return the book when found", async () => {
      mockRepo.findById.mockResolvedValueOnce(mockBook);

      const result = await service.getBook("1");

      expect(mockRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockBook);
    });

    it("should throw NotFoundError when repo returns undefined", async () => {
      mockRepo.findById.mockResolvedValueOnce(undefined);

      await expect(service.getBook("999")).rejects.toThrow(NotFoundError);
      await expect(service.getBook("999")).rejects.toThrow("Book with id 999 not found");
    });

    it("should throw NotFoundError with statusCode 404", async () => {
      mockRepo.findById.mockResolvedValueOnce(undefined);

      try {
        await service.getBook("999");
        fail("Should have thrown NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).statusCode).toBe(404);
        expect((error as NotFoundError).name).toBe("NotFoundError");
      }
    });
  });

  describe("createBook(dto)", () => {
    it("should call repo.create(dto) and return result", async () => {
      const dto: CreateBookDto = {
        title: "New Book",
        author: "New Author",
        isbn: "978-1234567890",
        publishedYear: 2025,
        genre: "Fiction",
      };
      mockRepo.create.mockResolvedValueOnce(mockBook);

      const result = await service.createBook(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBook);
    });
  });

  describe("replaceBook(id, dto)", () => {
    it("should call repo.update(id, dto) and return updated book", async () => {
      const dto: UpdateBookDto = {
        title: "Updated Title",
        author: "Updated Author",
        isbn: "978-1234567890",
        publishedYear: 2025,
        genre: "Fiction",
      };
      const updatedBook: Book = { ...mockBook, ...dto };
      mockRepo.update.mockResolvedValueOnce(updatedBook);

      const result = await service.replaceBook("1", dto);

      expect(mockRepo.update).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(updatedBook);
    });

    it("should throw NotFoundError when update returns undefined", async () => {
      const dto: UpdateBookDto = {
        title: "Updated Title",
        author: "Updated Author",
        isbn: "978-1234567890",
        publishedYear: 2025,
        genre: "Fiction",
      };
      mockRepo.update.mockResolvedValueOnce(undefined);

      await expect(service.replaceBook("999", dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe("patchBook(id, dto)", () => {
    it("should call repo.patch(id, dto) and return patched book", async () => {
      const dto: PatchBookDto = { title: "Patched Title" };
      const patchedBook: Book = { ...mockBook, title: "Patched Title" };
      mockRepo.patch.mockResolvedValueOnce(patchedBook);

      const result = await service.patchBook("1", dto);

      expect(mockRepo.patch).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(patchedBook);
    });

    it("should throw NotFoundError when patch returns undefined", async () => {
      const dto: PatchBookDto = { title: "Patched Title" };
      mockRepo.patch.mockResolvedValueOnce(undefined);

      await expect(service.patchBook("999", dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteBook(id)", () => {
    it("should call repo.findById first, then repo.delete(id) when found", async () => {
      mockRepo.findById.mockResolvedValueOnce(mockBook);
      mockRepo.delete.mockResolvedValueOnce(true);

      const result = await service.deleteBook("1");

      expect(mockRepo.findById).toHaveBeenCalledWith("1");
      expect(mockRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toBeUndefined();
    });

    it("should throw NotFoundError when findById returns undefined", async () => {
      mockRepo.findById.mockResolvedValueOnce(undefined);

      await expect(service.deleteBook("999")).rejects.toThrow(NotFoundError);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});

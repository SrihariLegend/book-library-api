import { errorHandler } from "../../../middleware/error-handler";
import { NotFoundError } from "../../../services/book.service";
import { Request, Response, NextFunction } from "express";

describe("Error Handler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should return 404 with error message for NotFoundError", () => {
    const err = new NotFoundError("Book with id 123 not found");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: "Book with id 123 not found",
    });
  });

  it("should return 500 with generic message for generic Error", () => {
    const err = new Error("Something went wrong");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  });

  it("should verify NotFoundError has correct name property", () => {
    const err = new NotFoundError("Test error");

    expect(err.name).toBe("NotFoundError");
  });
});

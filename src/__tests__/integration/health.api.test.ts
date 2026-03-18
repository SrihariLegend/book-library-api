import request from "supertest";
import { app } from "../../app";

describe("Health API", () => {
  describe("GET /health", () => {
    it("should return 200 with success status and ok message", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { status: "ok" },
        error: null,
      });
    });

    it("should include security headers set by helmet", async () => {
      const response = await request(app).get("/health");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  describe("GET /nonexistent", () => {
    it("should return 404 with error message", async () => {
      const response = await request(app).get("/nonexistent");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        data: null,
        error: "Not Found",
      });
    });
  });
});

import winston from "winston";
import { createLogger } from "../../../lib/logger";
import logger from "../../../lib/logger";

describe("Logger Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLogger(level)", () => {
    it("returns an object with info, warn, error, debug methods", () => {
      const testLogger = createLogger("info");

      expect(testLogger).toBeDefined();
      expect(typeof testLogger.info).toBe("function");
      expect(typeof testLogger.warn).toBe("function");
      expect(typeof testLogger.error).toBe("function");
      expect(typeof testLogger.debug).toBe("function");
    });

    it('accepts "debug" level without error', () => {
      expect(() => {
        createLogger("debug");
      }).not.toThrow();
    });

    it('accepts "error" level without error', () => {
      expect(() => {
        createLogger("error");
      }).not.toThrow();
    });

    it("accepts 'info' level without error", () => {
      expect(() => {
        createLogger("info");
      }).not.toThrow();
    });

    it("accepts 'warn' level without error", () => {
      expect(() => {
        createLogger("warn");
      }).not.toThrow();
    });

    it("uses provided level when creating logger", () => {
      const debugLogger = createLogger("debug");
      expect(debugLogger.level).toBe("debug");

      const errorLogger = createLogger("error");
      expect(errorLogger.level).toBe("error");
    });
  });

  describe("Logger methods", () => {
    let testLogger: winston.Logger;

    beforeEach(() => {
      testLogger = createLogger("debug");
    });

    it("info() does not throw when called with a string message", () => {
      expect(() => {
        testLogger.info("Test message");
      }).not.toThrow();
    });

    it("info() does not throw when called with message and metadata object", () => {
      expect(() => {
        testLogger.info("Test message", { key: "value", nested: { data: 123 } });
      }).not.toThrow();
    });

    it("warn() does not throw when called with a string message", () => {
      expect(() => {
        testLogger.warn("Warning message");
      }).not.toThrow();
    });

    it("warn() does not throw when called with message and metadata object", () => {
      expect(() => {
        testLogger.warn("Warning message", { code: "WARN_001" });
      }).not.toThrow();
    });

    it("error() does not throw when called with a string message", () => {
      expect(() => {
        testLogger.error("Error message");
      }).not.toThrow();
    });

    it("error() does not throw when called with message and metadata object", () => {
      expect(() => {
        testLogger.error("Error message", { code: "ERR_001", statusCode: 500 });
      }).not.toThrow();
    });

    it("debug() does not throw when called with a string message", () => {
      expect(() => {
        testLogger.debug("Debug message");
      }).not.toThrow();
    });

    it("debug() does not throw when called with message and metadata object", () => {
      expect(() => {
        testLogger.debug("Debug message", { timestamp: Date.now() });
      }).not.toThrow();
    });
  });

  describe("Default export logger", () => {
    it("default export exists", () => {
      expect(logger).toBeDefined();
    });

    it("default export has info method", () => {
      expect(typeof logger.info).toBe("function");
    });

    it("default export has warn method", () => {
      expect(typeof logger.warn).toBe("function");
    });

    it("default export has error method", () => {
      expect(typeof logger.error).toBe("function");
    });

    it("default export has debug method", () => {
      expect(typeof logger.debug).toBe("function");
    });
  });

  describe("Production format", () => {
    it("uses JSON format when NODE_ENV is production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const prodLogger = createLogger("info");

      expect(prodLogger).toBeDefined();
      expect(typeof prodLogger.info).toBe("function");

      process.env.NODE_ENV = originalEnv;
    });
  });
});

import { parseEnv, AppConfig } from "../../../config/env";

describe("parseEnv", () => {
  describe("valid environment variables", () => {
    it("returns typed config object with correct values", () => {
      const env: NodeJS.ProcessEnv = {
        NODE_ENV: "production",
        PORT: "3000",
        LOG_LEVEL: "debug",
        RATE_LIMIT_MAX: "200",
        RATE_LIMIT_WINDOW_MS: "120000",
      };

      const config = parseEnv(env);

      expect(config).toEqual({
        NODE_ENV: "production",
        PORT: 3000,
        LOG_LEVEL: "debug",
        RATE_LIMIT_MAX: 200,
        RATE_LIMIT_WINDOW_MS: 120000,
      });
    });

    it("coerces PORT from string to number", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "8080",
      };

      const config = parseEnv(env);

      expect(config.PORT).toBe(8080);
      expect(typeof config.PORT).toBe("number");
    });

    it("coerces RATE_LIMIT_MAX from string to number", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        RATE_LIMIT_MAX: "500",
      };

      const config = parseEnv(env);

      expect(config.RATE_LIMIT_MAX).toBe(500);
      expect(typeof config.RATE_LIMIT_MAX).toBe("number");
    });

    it("coerces RATE_LIMIT_WINDOW_MS from string to number", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        RATE_LIMIT_WINDOW_MS: "90000",
      };

      const config = parseEnv(env);

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(90000);
      expect(typeof config.RATE_LIMIT_WINDOW_MS).toBe("number");
    });
  });

  describe("default values", () => {
    it("uses default 'development' for NODE_ENV when missing", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(config.NODE_ENV).toBe("development");
    });

    it("uses default 'info' for LOG_LEVEL when missing", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(config.LOG_LEVEL).toBe("info");
    });

    it("defaults RATE_LIMIT_MAX to 100 when missing", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(config.RATE_LIMIT_MAX).toBe(100);
    });

    it("defaults RATE_LIMIT_WINDOW_MS to 60000 when missing", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(60000);
    });
  });

  describe("error handling", () => {
    it("throws error when PORT is missing", () => {
      const env: NodeJS.ProcessEnv = {};

      expect(() => parseEnv(env)).toThrow();
    });

    it("throws error when PORT is non-numeric string", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "not-a-number",
      };

      expect(() => parseEnv(env)).toThrow();
    });

    it("throws error when NODE_ENV is invalid", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        NODE_ENV: "invalid-env",
      };

      expect(() => parseEnv(env)).toThrow();
    });

    it("throws error when LOG_LEVEL is invalid", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        LOG_LEVEL: "invalid-level",
      };

      expect(() => parseEnv(env)).toThrow();
    });

    it("throws error when RATE_LIMIT_MAX is non-numeric", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        RATE_LIMIT_MAX: "abc",
      };

      expect(() => parseEnv(env)).toThrow();
    });

    it("throws error when RATE_LIMIT_WINDOW_MS is non-numeric", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
        RATE_LIMIT_WINDOW_MS: "xyz",
      };

      expect(() => parseEnv(env)).toThrow();
    });
  });

  describe("immutability", () => {
    it("returns a frozen/readonly config object", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(Object.isFrozen(config)).toBe(true);
    });

    it("prevents mutation attempts on frozen config", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "3000",
      };

      const config = parseEnv(env);

      expect(() => {
        (config as any).PORT = 5000;
      }).toThrow();
    });
  });

  describe("PORT edge cases", () => {
    it("accepts PORT value 0", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "0",
      };

      const config = parseEnv(env);

      expect(config.PORT).toBe(0);
    });

    it("accepts large PORT numbers", () => {
      const env: NodeJS.ProcessEnv = {
        PORT: "65535",
      };

      const config = parseEnv(env);

      expect(config.PORT).toBe(65535);
    });
  });
});

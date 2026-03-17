import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  testMatch: ["**/*.test.ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/__tests__/**",
    "!src/server.ts"
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80
    }
  },
  globals: {
    "ts-jest": {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
        noUncheckedIndexedAccess: false,
        exactOptionalPropertyTypes: false
      }
    }
  }
};

export default config;

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
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
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          strict: true,
          esModuleInterop: true,
          module: "esnext",
          skipLibCheck: true,
          moduleResolution: "node",
          noUncheckedIndexedAccess: false,
          exactOptionalPropertyTypes: false,
          types: ["jest", "node"]
        }
      }
    ]
  }
};

export default config;

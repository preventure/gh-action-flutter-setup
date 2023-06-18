// eslint-disable-next-line import/no-unresolved
import {defineConfig} from "vitest/config";
const CI_MODE = process.env.CI === "true";
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    coverage: {
      enabled: true,
      reporter: CI_MODE
        ? ["text-summary", "json-summary"]
        : ["text", "json", "html"]
    }
  }
});

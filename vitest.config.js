import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/**/*.test.{js,jsx}"],
    reporter: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/engine/**", "src/data/**"],
    },
  },
});

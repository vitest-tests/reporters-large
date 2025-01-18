import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: true,
    reporters: [["verbose", { summary: true, isTTY: true }]],
    pool: "threads",
    poolOptions: {
      threads: {
        isolate: false,
        execArgv: ["cpu-prof-dir", "disabled-threads-profiling"],
      },
    },
  },
});

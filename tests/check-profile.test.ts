import { readFileSync } from "fs";
import { expect, test } from "vitest";

interface Results {
  functionExecutionTimes: {
    name: string;
    time: number;
  }[];

  /** Total test execution time in seconds */
  totalTime: number;
}

const results: Results = JSON.parse(readFileSync("./results.json", "utf-8"));

test("main thread is mostly idle", () => {
  expect(results.functionExecutionTimes[0].name).toBe("(idle)");
});

test("total execution time is smaller than 3 minute", () => {
  expect(results.totalTime).toBeLessThan(3 * 60);
});

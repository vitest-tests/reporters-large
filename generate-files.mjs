import * as fs from "node:fs";
import { resolve } from "node:path";

const TEST_COUNT = parseInt(process.env.TEST_COUNT || 5000);
const LOG_WIDTH = parseInt(process.env.LOG_WIDTH || 10);

console.log("Generating files", { TEST_COUNT, LOG_WIDTH });

const testDir = new URL("fixtures/tests", import.meta.url).pathname;
const someText = "Hello world "
  .repeat(LOG_WIDTH)
  .slice(0, LOG_WIDTH - 3)
  .concat("...");

if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true });
}

fs.mkdirSync(testDir, { recursive: true });

for (const i of toList(TEST_COUNT)) {
  const index = 1 + i;

  const filename = resolve(testDir, `test-${index}.test.ts`);
  const contents = `import { describe, test } from "vitest";

describe("test set ${index} - ${someText}", (file) => {
  test("test #1 - ${someText}", () => {
    console.log('${someText}');
  });

  test("test #2 - ${someText}", () => {
    console.log('${someText}');
  });

  test("test #3 - ${someText}", () => {
    console.log('${someText}');
  });

  test("test #4 - ${someText}", () => {
    console.log('${someText}');
  });
});
`;

  fs.writeFileSync(filename, contents, "utf-8");
}

function toList(count) {
  return Array.from(Array(count).fill(0).keys());
}

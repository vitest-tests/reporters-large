import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { convert } from "./utils/cpu-profile.mjs";

const directory = "main-thread-profiling";
const contents = readdirSync(directory);

const profileFilename = contents.find((filename) =>
  filename.endsWith("001.cpuprofile")
);

const profile = readFileSync(join(directory, profileFilename), "utf-8");
const json = JSON.parse(profile);

const converted = convert(json);

// TODO: Verify these with tests
console.log("Slowest function is", converted.functionExecutionTimes[0]);
// Slowest function is {
//   name: 'stringWidth at reporters-large/node_modules/.pnpm/vitest@1.0.3_@types+node@20.10.4/node_modules/vitest/dist/vendor/reporters.pr8MinP9.js',
//   time: 32.097999
// }

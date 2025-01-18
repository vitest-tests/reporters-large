import { spawn } from "@lydell/node-pty";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { convert } from "./utils/cpu-profile.mjs";
import { join } from "node:path";

const TIMEOUT_MINUTES = parseInt(process.env.TIMEOUT_MINUTES || 30);
const directory = "main-thread-profiling";

for (const name of [directory, "threads-profiling", "./results.json"]) {
  if (existsSync(name)) {
    rmSync(name, { recursive: true });
  }
}

const env = { ...process.env };
delete env.CI;
delete env.GITHUB_ACTIONS;

const pty = spawn(
  "node",
  [
    "--cpu-prof",
    `--cpu-prof-dir=./${directory}`,
    "./node_modules/vitest/vitest.mjs",
    "fixtures",
  ],
  {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    cols: 80,
    rows: 120,
  }
);

const logs = [];

const timer = setTimeout(() => {
  console.error("Stuck, did not detect tests finishing");
  console.log(logs);
  pty.kill();
}, TIMEOUT_MINUTES * 60 * 1000);

pty.onData((data) => {
  logs.push(data);

  if (data.includes("Waiting for file changes")) {
    clearTimeout(timer);
    pty.write("q");
  }
});

// Wait for tests to finish
await new Promise((resolve) => pty.onExit(resolve));

const profileFilename = readdirSync(directory).find((filename) =>
  filename.endsWith("001.cpuprofile")
);

const profile = readFileSync(join(directory, profileFilename), "utf-8");
const json = JSON.parse(profile);
const converted = convert(json);

console.log("Tests took", converted.totalTime);
console.log(
  "Top 5 slowest functions",
  converted.functionExecutionTimes.slice(0, 5)
);

writeFileSync("./results.json", JSON.stringify(converted), "utf8");
console.log("Generated ./results.json");

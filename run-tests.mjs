import { spawn } from "node-pty";
import { existsSync, rmSync } from "fs";

const TIMEOUT_MINUTES = parseInt(process.env.TIMEOUT_MINUTES || 5);

for (const directory of ["main-thread-profiling", "threads-profiling"]) {
  if (existsSync(directory)) {
    rmSync(directory, { recursive: true });
  }
}

const pty = spawn(
  "node",
  [
    "--cpu-prof",
    "--cpu-prof-dir=./main-thread-profiling",
    "./node_modules/vitest/vitest.mjs",
  ],
  {
    cwd: process.cwd(),
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

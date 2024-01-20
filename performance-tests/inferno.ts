import { readableStreamToText, spawn, write } from "bun";
import { program } from "commander";
import { exit } from "process";

import { METRICS } from "./common";
import { trafficControl } from "./traffic-control";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

program
  .version("1.0.0", "-v, --version")
  .description(
    "Simple performance test that spams GET requests to given address"
  )
  .usage("[OPTIONS]...")
  .argument("<ipAddress>", "IP address to benchmark")
  .option("-h3, --http3", "Use HTTP/3 protocol")
  .option("-n <integer>", "Number of test runs, defaults to 1", "1")
  .option(
    "-o, --output <path>",
    "Path to write output to, defaults to - (stdin)",
    "-"
  )
  .option("-t", "Use traffic control");

program.parse();

const { http3, n, output, t } = program.opts() as {
  http3: boolean;
  n: string;
  output: string;
  t: boolean;
};
const ipAddress = program.args[0];
if (t) {
  trafficControl();
}

const writeFormat = METRICS.map((field) => `%{${field}}`).join(";");

const resultsPromise = [] as Promise<string>[];

for (let i = 0; i < Number(n); i++) {
  resultsPromise.push(
    execPromise(
      [
        "curl",
        "-s",
        "-o /dev/null",
        `-w "${writeFormat}"`,
        ...(http3 ? ["--http3"] : []),
        ipAddress,
      ].join(" ")
    )
      .then(({ stdout }) => stdout.replaceAll('"', ""))
      .catch(() => METRICS.map(() => "0").join(";"))
  );
}

const columns = METRICS.join(";");
const texts = (await Promise.all(resultsPromise)).join("\n");

const data = columns + "\n" + texts;

if (output === "-") {
  console.log(data);
  exit(0);
}

write(output, data);
exit(0);

import { readableStreamToText, spawn, write } from "bun";
import { program } from "commander";
import { exit } from "process";

program
  .version("1.0.0", "-v, --version")
  .description(
    "Simple performance test that spams GET requests to given address"
  )
  .usage("[OPTIONS]...")
  .argument("<ipAddress>", "IP address to benchmark")
  .option("-s, --sync", "Synchronous curl calls")
  .option("-h3, --http3", "Use HTTP/3 protocol")
  .option("-n <integer>", "Number of test runs, defaults to 1", "1")
  .option(
    "-o, --output <path>",
    "Path to write output to, defaults to - (stdin)",
    "-"
  );

program.parse();

const { http3, n, output, sync } = program.opts() as {
  http3: boolean;
  n: string;
  output: string;
  sync: boolean;
};
const ipAddress = program.args[0];

const writeFields = [
  "response_code",
  "http_version",
  "speed_download",
  "speed_upload",
  "time_starttransfer",
  "time_pretransfer",
  "time_appconnect",
  "time_total",
  "time_connect",
];

const writeFormat = writeFields.map((field) => `%{${field}}`).join(";");

const resultsPromise = [] as Promise<string>[];
const resultsSync = [] as string[];

for (let i = 0; i < Number(n); i++) {
  const { stdout } = spawn([
    "curl",
    "-s",
    "-o /dev/null",
    `-w "${writeFormat}"`,
    ...(http3 ? ["--http3-only"] : []),
    ipAddress,
  ]);

  if (sync) {
    resultsSync.push(await readableStreamToText(stdout));
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      `--- ${(((i + 1) / Number(n)) * 100).toString()}% ---`
    );
  } else {
    resultsPromise.push(readableStreamToText(stdout));
  }
}
if (sync) console.log("Finished!");

const columns = writeFields.join(";");
const texts = (sync ? resultsSync : await Promise.all(resultsPromise))
  .join("\n")
  .replaceAll('"', "");

const data = columns + "\n" + texts;

if (output === "-") {
  console.log(data);
  exit(0);
}

write(output, data);
exit(0);

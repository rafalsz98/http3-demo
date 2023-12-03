import { readableStreamToText, spawn } from "bun";
import { program } from "commander";
import { exit } from "process";
import { METRICS } from "./common";

program
  .version("1.0.0", "-v, --version")
  .description("Benchmark testing for file upload endpoint")
  .usage("[OPTIONS]...")
  .argument("<ipAddress>", "IP address of the server to benchmark")
  .option("-h3, --http3", "Use HTTP/3 protocol")
  .option("-n <integer>", "Number of test runs, defaults to 1", "1")
  .option(
    "-o, --output <path>",
    "Path to write output to, defaults to - (stdin)",
    "-"
  )
  .option("-f, --file <path>", "Path of the file to upload");

program.parse();
const ipAddress = program.args[0];
const { http3, n, output, file } = program.opts() as {
  ipAddress: string;
  http3: boolean;
  n: string;
  output: string;
  file: string;
};

const writeFormat = METRICS.map((field) => `%{${field}}`).join(";");

const getCurlSpawn = () => [
  "curl",
  "-s",
  "-k",
  "-o /dev/null",
  `-w "${writeFormat}"`,
  "-F",
  `file=@${file}`,
  ...(http3 ? ["--http3"] : []),
  `${ipAddress}/upload`,
];

const columns = METRICS.join(";");
const results: string[] = [columns];

const fileWriter = output === "-" ? undefined : Bun.file(output).writer();
fileWriter?.write(columns + "\n");

for (let i = 0; i < Number(n); i++) {
  const { stdout, exited } = spawn(getCurlSpawn());
  await exited;
  const output = (await readableStreamToText(stdout)).replaceAll('"', "");

  fileWriter?.write(output + "\n");
  results.push(output);

  console.log(`${((i + 1) / Number(n)) * 100}%`);
}

const dataToSave = results.join("\n");

if (output === "-") {
  console.log(dataToSave);
}

fileWriter?.end();
exit(0);

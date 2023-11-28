import { readableStreamToText, spawn, write } from "bun";
import { program } from "commander";
import { exit } from "process";
import { METRICS } from "./common";

program
  .version("1.0.0", "-v, --version")
  .description("Simulation of browser behaviour")
  .usage("[OPTIONS]...")
  .argument("<ipAddress>", "IP address to benchmark")
  .option("-h3, --http3", "Use HTTP/3 protocol")
  .option("-n <integer>", "Number of test runs, defaults to 1", "1")
  .option(
    "-o, --output <path>",
    "Path to write output to, defaults to - (stdin)",
    "-"
  );

program.parse();
const ipAddress = program.args[0];
const { http3, n, output } = program.opts() as {
  http3: boolean;
  n: string;
  output: string;
};

const writeFormat = METRICS.map((field) => `%{${field}}`).join(";");
const createResourcePaths = (
  n: number,
  resourceName: string,
  resourceExtension: string
) =>
  Array.from(
    { length: n },
    (_, i) => `/public/${resourceName}${i + 1}.${resourceExtension}`
  );
const getCurlSpawn = (fileName: string) => [
  "curl",
  "-s",
  "-o /dev/null",
  `-w "${writeFormat}"`,
  ...(http3 ? ["--http3-only"] : []),
  `${ipAddress}${fileName}`,
];

const scriptPaths = createResourcePaths(15, "script", "js");
const stylesPaths = createResourcePaths(6, "style", "css");
const paths = ["/public/", ...scriptPaths, ...stylesPaths];
const columns = [...METRICS, "iteration", "fileName"].join(";");

const results: string[] = [columns];

for (let i = 0; i < Number(n); i++) {
  // download index.html file
  const indexFile = paths[0];
  const { stdout: indexStdout } = spawn(getCurlSpawn(indexFile));
  const indexOutput = (await readableStreamToText(indexStdout))
    .replaceAll('"', "")
    .split(";");
  indexOutput.push(i.toString(), indexFile);

  results.push(indexOutput.join(";"));

  const promises: Promise<string>[] = [];
  paths.slice(1).forEach((path) => {
    const { stdout } = spawn(getCurlSpawn(path));
    promises.push(
      readableStreamToText(stdout).then((value) =>
        `${value};${i};${path}`.replaceAll('"', "")
      )
    );
  });

  const promisesResults = await Promise.all(promises);
  results.push(...promisesResults);
}

const dataToSave = results.join("\n");

if (output === "-") {
  console.log(dataToSave);
  exit(0);
}

write(output, dataToSave);
exit(0);

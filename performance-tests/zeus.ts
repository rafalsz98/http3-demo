import { program } from "commander";
import { exit } from "process";
import { exec } from "child_process";
import { promisify } from "util";

import { METRICS } from "./common";
import { trafficControl } from "./traffic-control";

const execPromise = promisify(exec);

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
  )
  .option("-t", "Use traffic control");

program.parse();
const ipAddress = program.args[0];
const { http3, n, output, t } = program.opts() as {
  http3: boolean;
  n: string;
  output: string;
  t: boolean;
};
if (t) {
  trafficControl();
}

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
const getCurlSpawn = (fileName: string) =>
  [
    "curl",
    "-s",
    "-o /dev/null",
    `-w "${writeFormat}"`,
    ...(http3 ? ["--http3"] : []),
    `${ipAddress}${fileName}`,
  ].join(" ");

const scriptPaths = createResourcePaths(15, "script", "js");
const stylesPaths = createResourcePaths(6, "style", "css");
const paths = ["/public/", ...scriptPaths, ...stylesPaths];
const columns = [...METRICS, "iteration", "fileName"].join(";");

const results: string[] = [columns];

const file = output === "-" ? undefined : Bun.file(output);
const writer = file?.writer();

writer?.write(columns + "\n");

for (let i = 0; i < Number(n); i++) {
  // download index.html file
  const indexFile = paths[0];
  const { stdout: indexStdout } = await execPromise(getCurlSpawn(indexFile));

  const indexOutput = indexStdout.replaceAll('"', "").split(";");
  indexOutput.push(i.toString(), indexFile);

  writer?.write(indexOutput.join(";") + "\n");
  results.push(indexOutput.join(";"));

  const promises: Promise<string>[] = [];

  paths.slice(1).forEach((path) => {
    promises.push(
      execPromise(getCurlSpawn(path)).then(({ stdout }) =>
        `${stdout};${i};${path}`.replaceAll('"', "")
      )
    );
  });

  const promisesResults = await Promise.all(promises);

  writer?.write(promisesResults.join("\n") + "\n");

  results.push(...promisesResults);

  if (writer) {
    console.log(`${((i + 1) / Number(n)) * 100}%`);
  }
}

const dataToSave = results.join("\n");

if (output === "-") {
  console.log(dataToSave);
}

writer?.flush();
exit(0);

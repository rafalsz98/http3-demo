import { spawnSync } from "bun";
// tc qdisc add dev eth1 root netem loss 1%

const OPTIONS = [
  // ["rate", "50kbps"]
  ["loss", "30%"],
];

export const trafficControl = () => {
  OPTIONS.forEach((options) => {
    const { exitCode, stderr } = spawnSync([
      "tc",
      "qdisc",
      "add",
      "dev",
      "eth0",
      "root",
      "netem",
      ...options,
    ]);

    if (exitCode !== 0) {
      throw new Error(stderr.toString());
    }
  });
};

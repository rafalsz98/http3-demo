import { spawnSync } from "bun";
// tc qdisc add dev eth1 root netem loss 1%

const OPTIONS = [
  ["delay", "250ms", "50ms"], // High and variable latency + jitter
  ["loss", "5%"], // Packet loss
  ["rate", "500kbps"], // Bandwidth limit
  ["duplicate", "1%"], // Packet duplication
  ["reorder", "3%", "50%"], // Packet reordering
  ["corrupt", "0.1%"], // Packet corruption
];

export const trafficControl = () => {
  const { exitCode, stderr } = spawnSync([
    "tc",
    "qdisc",
    "add",
    "dev",
    "eth0",
    "root",
    "netem",
    ...OPTIONS.flat(),
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr.toString());
  }
};

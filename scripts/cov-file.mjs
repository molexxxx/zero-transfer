import fs from "node:fs";
const lcov = fs.readFileSync("coverage/lcov.info", "utf8").split(/\r?\n/);
const target = process.argv[2];
let inFile = false;
const lines = [];
const branches = [];
for (const line of lcov) {
  if (line.startsWith("SF:")) {
    inFile = line.includes(target);
    continue;
  }
  if (!inFile) continue;
  if (line === "end_of_record") {
    break;
  }
  if (line.startsWith("DA:")) {
    const [, ln, hit] = line.match(/^DA:(\d+),(\d+)/) ?? [];
    if (hit === "0") lines.push(Number(ln));
  } else if (line.startsWith("BRDA:")) {
    const m = line.match(/^BRDA:(\d+),\d+,\d+,(.+)$/);
    if (m && m[2] === "0") branches.push(Number(m[1]));
  }
}
console.log("Uncovered statement lines:", lines.join(","));
console.log("Uncovered branch lines:", [...new Set(branches)].sort((a, b) => a - b).join(","));

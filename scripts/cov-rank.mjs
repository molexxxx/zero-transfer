import fs from "node:fs";
const d = JSON.parse(fs.readFileSync("coverage/coverage-summary.json", "utf8"));
const out = [];
for (const [k, v] of Object.entries(d)) {
  if (k === "total") continue;
  if (v.branches.pct < 95 && v.statements.total > 30) {
    out.push({
      f: k.replace(/.*molex-ftp[\\\/]/, "").replace(/\\/g, "/"),
      st: v.statements.pct,
      br: v.branches.pct,
      fn: v.functions.pct,
      ln: v.lines.pct,
      n: v.statements.total,
      miss: v.statements.total - v.statements.covered,
      missBr: v.branches.total - v.branches.covered,
    });
  }
}
out.sort((a, b) => b.missBr - a.missBr);
for (const x of out.slice(0, 40)) {
  console.log(
    `${x.f.padEnd(60)} br=${String(x.br).padStart(5)} st=${String(x.st).padStart(5)} missSt=${x.miss}/${x.n} missBr=${x.missBr}`,
  );
}
const t = d.total;
console.log("---");
console.log(
  `TOTAL: st=${t.statements.pct} br=${t.branches.pct} fn=${t.functions.pct} ln=${t.lines.pct}`,
);

/**
 * Runs the content guard over every seed page, so a canonical fact typed into
 * a default composition fails the build the same way it would fail a publish.
 */
import { auditContent, explainRule } from "../src/content/content-guard";
import { PAGES } from "../src/puck/pages";

let bad = 0;
for (const page of PAGES) {
  const findings = auditContent(page.seed(), page.key);
  for (const f of findings) { bad++; console.error(`  ✗ ${f.where}: "${f.value}" — ${explainRule(f.rule)}`); }
}
if (bad) { console.error(`\n${bad} content finding${bad === 1 ? "" : "s"}. Fix the seeds in src/puck/pages.ts.`); process.exit(1); }
console.log(`✓ content lint: ${PAGES.length} pages clean`);

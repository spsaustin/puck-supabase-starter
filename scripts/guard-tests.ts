import assert from "node:assert/strict";
import { auditContent } from "../src/content/content-guard";

const hits = auditContent({ content: [{ type: "Prose", props: { id: "a", body: "Call us at (512) 555-0123 or visit 100 Congress Ave today." } }] });
assert.deepEqual(hits.map((h) => h.rule), ["phone-number", "street-address"]);
assert.equal(auditContent({ content: [{ type: "Prose", props: { id: "a", href: "/contact", body: "Plain copy with no facts." } }] }).length, 0);
assert.equal(auditContent({ props: { body: "We were founded in 2020." } }).map((h) => h.rule)[0], "founding-year");
console.log("✓ guard tests passed");

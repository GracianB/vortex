import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const readme=readFileSync(new URL("../README.md",import.meta.url),"utf8");
test("Vórtice README is an honest, self-hosted repository storefront",()=>{
  assert.ok(readme.length<6000);
  for(const name of ["public/vortex-cover.svg","docs/V6_REFERENCE.md","docs/REPOSITORY_REVIEW.md","RELEASE_V6.md"]) {
    assert.ok(existsSync(new URL("../"+name,import.meta.url)),name+" is missing");
  }
  assert.match(readme,/npm run quality/);
  assert.match(readme,/npm run test:browser/);
  assert.match(readme,/independientemente/);
  assert.doesNotMatch(readme,/capsule-render\.vercel|readme-typing-svg\.demolab/);
});

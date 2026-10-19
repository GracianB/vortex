import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
test('repository readme links to actual Vórtice source, live entry and concise guides',()=>{
 const readme=readFileSync('README.md','utf8');
 assert.ok(readme.length<7000);
 for(const file of ['public/vortex-cover.svg','docs/ARCHITECTURE.md','docs/CONTROLS.md','docs/RELEASE_STATUS.md','RELEASE_V6.md']) assert.ok(existsSync(file),'missing '+file);
 assert.match(readme,/vortex-gilt-xi\.vercel\.app/);
 assert.match(readme,/WebGL/);
 assert.match(readme,/Production Smoke/);
 assert.doesNotMatch(readme,/127\.0\.0\.1:8001/);
});

test('lockfile does not install unused TanStack Start server packages',()=>{
 const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 const installed=Object.keys(lock.packages).filter(path=>path.startsWith('node_modules/@tanstack/'));
 assert.deepEqual(installed,[],'orphaned optional server packages should not be locked into this client-only app');
});

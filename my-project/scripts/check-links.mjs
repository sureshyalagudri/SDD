// Serves out/ locally and crawls it with linkinator (the CLI's glob handling fails on Windows).
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { LinkChecker } from "linkinator";

const require = createRequire(import.meta.url);
const handler = require("serve-handler");

const server = createServer((req, res) =>
  handler(req, res, { public: "out", cleanUrls: false, trailingSlash: true }),
);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/`;

const checker = new LinkChecker();
checker.on("link", (l) => {
  if (l.state === "BROKEN") console.error(`BROKEN ${l.status} ${l.url} (from ${l.parent})`);
});
const result = await checker.check({
  path: base,
  recurse: true,
  concurrency: 20,
  linksToSkip: ["/_next/"],
});
server.close();

const broken = result.links.filter((l) => l.state === "BROKEN");
console.log(`Checked ${result.links.length} links; ${broken.length} broken.`);
process.exit(result.passed ? 0 : 1);

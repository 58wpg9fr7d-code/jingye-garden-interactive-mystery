import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the ScriptLab product workspace", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /谜构 ScriptLab/);
  assert.match(html, /人物关系网络/);
  assert.match(html, /逻辑健康度/);
  assert.match(html, /无喙镜渊/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("keeps the playable routes available", async () => {
  for (const pathname of ["/phone", "/puzzle"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /谜构 ScriptLab/);
  }
});

test("uses product metadata and the expected source structure", async () => {
  const [layout, page, phonePage, puzzlePage] = await Promise.all([
    readFile(new URL("app/layout.tsx", templateRoot), "utf8"),
    readFile(new URL("app/page.tsx", templateRoot), "utf8"),
    readFile(new URL("app/phone/page.tsx", templateRoot), "utf8"),
    readFile(new URL("app/puzzle/page.tsx", templateRoot), "utf8"),
  ]);
  assert.match(layout, /谜构 ScriptLab/);
  assert.match(page, /MVP 成功指标/);
  assert.match(page, /线索平衡/);
  assert.match(phonePage, /静夜园/);
  assert.match(puzzlePage, /终局谜题|VectorPuzzlePage/);
});

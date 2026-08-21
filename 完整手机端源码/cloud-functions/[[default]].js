import fs from "node:fs/promises";
import path from "node:path";
import worker from "../dist/server/index.js";

const clientRoot = path.resolve(process.cwd(), "dist/client");

function safeAssetPath(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const relative = pathname.replace(/^\/+/, "") || "index.html";
  const absolute = path.resolve(clientRoot, relative);
  if (absolute !== clientRoot && !absolute.startsWith(`${clientRoot}${path.sep}`)) return null;
  return absolute;
}

const assets = {
  async fetch(request) {
    const filePath = safeAssetPath(request.url);
    if (!filePath) return new Response("Not Found", { status: 404 });
    try {
      const data = await fs.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".txt": "text/plain; charset=utf-8",
      };
      return new Response(data, {
        headers: { "content-type": contentTypes[extension] || "application/octet-stream" },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
};

export default async function onRequest({ request }) {
  const response = await worker.fetch(request, { ASSETS: assets }, {
    waitUntil() {},
  });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: response.headers,
  });
}

import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp"
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const fullPath = resolve(root, `.${normalize(requested)}`);

  if (!fullPath.startsWith(root)) return null;
  if (!existsSync(fullPath)) return null;
  if (!statSync(fullPath).isFile()) return null;

  return fullPath;
}

const server = createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || "/");

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  createReadStream(filePath).pipe(res);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`端口 ${port} 已被占用。请尝试：PORT=${port + 1} npm start`);
    process.exit(1);
  }

  if (error.code === "EACCES" || error.code === "EPERM") {
    console.error(`无法监听 ${host}:${port}。请尝试：PORT=${port + 1} npm start`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, host, () => {
  console.log(`AI 教学助手已启动: http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
});

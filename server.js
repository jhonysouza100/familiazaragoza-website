const http = require("http")
const fs = require("fs")
const path = require("path")
const { URL } = require("url")

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "0.0.0.0"

const ROOT = __dirname
const SRC_DIR = path.join(ROOT, "src")
const PUBLIC_DIR = path.join(ROOT, "public")

// Mapa de extensiones a tipos MIME
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
}

// Resuelve la ruta de la URL a un archivo del disco replicando el enrutamiento de Nginx:
//  - /public/*  -> carpeta public
//  - todo lo demas -> carpeta src (incluye /checkout, /robots.txt, etc.)
function resolveFilePath(pathname) {
  // Normaliza y evita path traversal
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    decoded = pathname
  }

  let baseDir
  let relativePath

  if (decoded === "/public" || decoded.startsWith("/public/")) {
    baseDir = PUBLIC_DIR
    relativePath = decoded.replace(/^\/public/, "")
  } else {
    baseDir = SRC_DIR
    relativePath = decoded
  }

  // Resuelve dentro del directorio base y previene salir de el
  const safeRelative = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "")
  let filePath = path.join(baseDir, safeRelative)

  if (!filePath.startsWith(baseDir)) {
    return null
  }

  return filePath
}

function sendFile(res, filePath, statusCode = 200) {
  const stream = fs.createReadStream(filePath)
  stream.on("open", () => {
    res.writeHead(statusCode, { "Content-Type": getContentType(filePath) })
    stream.pipe(res)
  })
  stream.on("error", () => {
    send404(res)
  })
}

function send404(res) {
  const notFound = path.join(SRC_DIR, "404.html")
  fs.access(notFound, fs.constants.F_OK, (err) => {
    if (!err) {
      sendFile(res, notFound, 404)
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      res.end("404 Not Found")
    }
  })
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let filePath = resolveFilePath(url.pathname)

  if (!filePath) {
    return send404(res)
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      return send404(res)
    }

    // Si es un directorio, sirve su index.html
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, "index.html")
      return fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
        if (indexErr) return send404(res)
        sendFile(res, indexPath)
      })
    }

    sendFile(res, filePath)
  })
})

server.listen(PORT, HOST, () => {
  console.log(`[v0] Servidor estatico corriendo en http://${HOST}:${PORT}`)
  console.log(`[v0] Sirviendo "src" en / y "public" en /public/`)
})
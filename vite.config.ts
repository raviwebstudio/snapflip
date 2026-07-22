import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

// Local storage middleware for Vite dev server (development only)
function devStoragePlugin() {
  return {
    name: 'dev-storage-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const urlObj = new URL(req.url || '', 'http://localhost');
        const pathname = urlObj.pathname;

        // 1. Serve files from /storage/
        if (pathname.startsWith('/storage/')) {
          const relativePath = decodeURIComponent(pathname.substring(1)); // strip leading slash
          const filePath = path.join(process.cwd(), relativePath);

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.webp': 'image/webp',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
          res.statusCode = 404;
          res.end('Local file not found');
          return;
        }

        // 1.5. Serve files from /playwright-report/ and /test-results/
        if (pathname.startsWith('/playwright-report/') || pathname.startsWith('/test-results/')) {
          const relativePath = decodeURIComponent(pathname.substring(1)); // strip leading slash
          const filePath = path.join(process.cwd(), relativePath);

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.html': 'text/html',
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.webm': 'video/webm',
              '.zip': 'application/zip',
              '.json': 'application/json',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }

        // 2. Handle POST APIs for writing/deleting files
        if (pathname.startsWith('/api/storage/') && req.method === 'POST') {
          try {
            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const body = JSON.parse(bodyStr);

            if (pathname === '/api/storage/upload') {
              const { userId, albumId, original, optimized, thumbnail } = body;

              const writeVariant = (type: string, variant: any) => {
                const dir = path.join(process.cwd(), 'storage', userId, albumId, type);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                const filePath = path.join(dir, variant.fileName);
                fs.writeFileSync(filePath, Buffer.from(variant.fileBase64, 'base64'));
                return `/storage/${userId}/${albumId}/${type}/${variant.fileName}`;
              };

              const originalPath = writeVariant('original', original);
              const optimizedPath = writeVariant('optimized', optimized);
              const thumbnailPath = writeVariant('thumbnail', thumbnail);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ originalPath, optimizedPath, thumbnailPath }));
              return;
            }

            if (pathname === '/api/storage/upload_single') {
              const { userId, albumId, type, fileName, fileBase64 } = body;
              const dir = path.join(process.cwd(), 'storage', userId, albumId, type);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              const filePath = path.join(dir, fileName);
              const buffer = Buffer.from(fileBase64, 'base64');
              fs.writeFileSync(filePath, buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ url: `/storage/${userId}/${albumId}/${type}/${fileName}`, size: buffer.length }));
              return;
            }

            if (pathname === '/api/storage/delete_paths') {
              const { paths } = body;
              for (const p of paths) {
                if (p && p.startsWith('/storage/')) {
                  const filePath = path.join(process.cwd(), p.substring(1));
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                  }
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            if (pathname === '/api/storage/delete_folder') {
              const { userId, albumId } = body;
              const albumDir = path.join(process.cwd(), 'storage', userId, albumId);
              if (fs.existsSync(albumDir)) {
                fs.rmSync(albumDir, { recursive: true, force: true });
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            if (pathname === '/api/storage/exists') {
              const { path: checkPath } = body;
              let exists = false;
              if (checkPath && checkPath.startsWith('/storage/')) {
                const filePath = path.join(process.cwd(), checkPath.substring(1));
                exists = fs.existsSync(filePath);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ exists }));
              return;
            }
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devStoragePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

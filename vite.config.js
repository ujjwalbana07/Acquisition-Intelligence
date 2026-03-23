import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import dotenv from 'dotenv'

// Load env vars for the config file itself
dotenv.config()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/copilot' && req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body)
                  // Reuse the handler logic
                  const handler = (await import('./api/copilot.js')).default;
                  
                  // Mock req/res for the handler
                  const mockReq = { method: 'POST', body: payload };
                  const mockRes = {
                    status: (code) => ({
                      json: (data) => {
                        res.statusCode = code;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                      }
                    })
                  };
                  
                  await handler(mockReq, mockRes);
                } catch (e) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Server Error', details: e.message }));
                }
              })
              return;
            }
            next()
          })
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// En desarrollo (npm run dev) ejecuta las funciones de /api igual que Vercel,
// para poder probar todo en local. Las variables SIN prefijo VITE_ (ej. la llave
// de Firebase Admin) solo existen en el servidor, nunca llegan al navegador.
function apiInDev(env) {
  return {
    name: 'api-en-desarrollo',
    apply: 'serve',
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v

      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0]
        if (!path.startsWith('/api/')) return next()
        const route = path.slice(5).replace(/\/+$/, '')
        if (!/^[a-z0-9/-]+$/i.test(route) || route.split('/').some(p => p.startsWith('_'))) {
          res.statusCode = 404; return res.end('{"error":"No existe"}')
        }

        let mod
        try { mod = await server.ssrLoadModule(`/api/${route}.js`) } catch {
          res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); return res.end('{"error":"No existe"}')
        }

        let raw = ''
        for await (const chunk of req) raw += chunk
        try { req.body = raw ? JSON.parse(raw) : {} } catch { req.body = raw }
        res.status = (code) => { res.statusCode = code; return res }
        res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        try { await mod.default(req, res) } catch (e) {
          console.error(e)
          if (!res.writableEnded) res.status(500).json({ error: 'Error en el servidor local.' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), apiInDev(loadEnv(mode, process.cwd(), ''))],
  resolve: {
    // "@/..." apunta a src/ (imports cortos y estables al mover archivos)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
}))

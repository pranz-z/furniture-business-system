import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { handleChatRequest } from './api/_lib/chatHandler.js'
import { MAX_BODY_BYTES, ValidationError, parseJsonBody } from './api/_lib/validation.js'

function readRequestBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0

    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new ValidationError('Request body is too large.'))
        req.destroy()
        return
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function getClientKey(req: import('http').IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || 'local-dev'
  }
  return req.socket.remoteAddress || 'local-dev'
}

export function geminiChatApiPlugin(): Plugin {
  return {
    name: 'gemini-chat-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
      if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/chat') {
          next()
          return
        }

        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Content-Type', 'application/json; charset=utf-8')

        try {
          const raw = await readRequestBody(req)
          const body = raw.trim() ? parseJsonBody(raw) : {}
          const result = await handleChatRequest({
            method: req.method,
            body,
            clientKey: getClientKey(req),
          })

          if (result.headers) {
            for (const [key, value] of Object.entries(result.headers)) {
              res.setHeader(key, value)
            }
          }

          res.statusCode = result.status
          res.end(JSON.stringify(result.body))
        } catch (error) {
          if (error instanceof ValidationError) {
            res.statusCode = 400
            res.end(
              JSON.stringify({
                success: false,
                error: error.message,
                code: 'validation',
              }),
            )
            return
          }

          console.error('[chat] Dev middleware failure')
          res.statusCode = 500
          res.end(
            JSON.stringify({
              success: false,
              error: 'Unable to respond right now.',
              code: 'unavailable',
            }),
          )
        }
      })
    },
  }
}

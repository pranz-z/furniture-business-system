import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleChatRequest } from './_lib/chatHandler.js'
import { MAX_BODY_BYTES, ValidationError, parseJsonBody } from './_lib/validation.js'

function getClientKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0]
  }
  return req.socket?.remoteAddress || 'unknown'
}

function readRawBody(req: VercelRequest): Promise<string> {
  if (typeof req.body === 'string') return Promise.resolve(req.body)
  if (req.body && typeof req.body === 'object') return Promise.resolve(JSON.stringify(req.body))

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
      chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })

    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  try {
    let body: unknown = req.body

    if (typeof body === 'string') {
      body = body.trim() ? parseJsonBody(body) : {}
    } else if (body == null) {
      const raw = await readRawBody(req)
      body = raw.trim() ? parseJsonBody(raw) : {}
    }

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

    return res.status(result.status).json(result.body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'validation',
      })
    }

    console.error('[chat] Endpoint failure')
    return res.status(500).json({
      success: false,
      error: 'Unable to respond right now.',
      code: 'unavailable',
    })
  }
}

import { GoogleGenAI } from '@google/genai'
import { buildSystemInstruction } from './systemInstruction.js'
import type { ChatHistoryMessage, ProductContext } from './types.js'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

function toGeminiHistory(history: ChatHistoryMessage[] = []): Array<{ role: 'user' | 'model'; parts: { text: string }[] }> {
  return history
    .filter((entry) => entry && typeof entry.content === 'string' && entry.content.trim())
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }],
    }))
}

export type GeminiAssistantReply =
  | {
      ok: true
      text: string
      latencyMs: number
      category: 'ok'
    }
  | {
      ok: false
      text: string
      latencyMs: number
      category: 'quota' | 'timeout' | 'safety' | 'unavailable'
    }

export async function generateAssistantReply({
  message,
  history,
  productContext,
}: {
  message: string
  history: ChatHistoryMessage[]
  productContext?: ProductContext | null
}): Promise<GeminiAssistantReply> {
  try {
    const contents = toGeminiHistory(history)
    const userPrompt = productContext
      ? `Product Context:\n${JSON.stringify(productContext, null, 2)}\n\nCustomer: ${message}`
      : message

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    })

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: buildSystemInstruction(),
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    })

    return {
      ok: true,
      text: response.text || '',
      latencyMs: 0,
      category: 'ok',
    }
  } catch (error) {
    console.error('[gemini] generateAssistantReply failed', error)
    return {
      ok: false,
      text: 'Unable to respond right now.',
      latencyMs: 0,
      category: 'unavailable',
    }
  }
}

export const generateResponse = async (
  message: string,
  history: ChatHistoryMessage[],
  productContext?: ProductContext | null,
) => {
  const result = await generateAssistantReply({
    message,
    history,
    productContext,
  })

  return result.text
}

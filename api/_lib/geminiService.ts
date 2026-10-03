import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction } from './systemInstruction';
import type { ChatHistoryMessage, ProductContext } from './types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = ai.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  systemInstruction: buildSystemInstruction(),
});

export const generateResponse = async (
  message: string,
  history: ChatHistoryMessage[],
  productContext?: ProductContext
) => {
  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(
    productContext
      ? `Product Context: ${JSON.stringify(productContext)}

Customer: ${message}`
      : message
  );

  return result.response.text();
};

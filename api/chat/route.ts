import { NextResponse } from 'next/server';
import { generateResponse } from '../_lib/geminiService';
import type { ChatHistoryMessage, ProductContext } from '../_lib/types';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 10;

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

const validateRequest = (body: any) => {
  if (!body.message || typeof body.message !== 'string' || body.message.length > MAX_MESSAGE_LENGTH) {
    return false;
  }

  if (body.history && (!Array.isArray(body.history) || body.history.length > MAX_HISTORY_LENGTH)) {
    return false;
  }

  if (body.productContext && typeof body.productContext !== 'object') {
    return false;
  }

  return true;
};

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Rate limiting
  if (rateLimitMap.has(ip)) {
    const lastRequestTime = rateLimitMap.get(ip);
    if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }
  }

  rateLimitMap.set(ip, now);

  try {
    const body = await request.json();

    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
        },
        { status: 400 }
      );
    }

    const { message, history = [], productContext } = body;

    const response = await generateResponse(message, history, productContext);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to respond right now. Please try again later.',
      },
      { status: 500 }
    );
  }
}
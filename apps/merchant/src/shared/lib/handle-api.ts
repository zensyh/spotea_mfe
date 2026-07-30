import { NextResponse } from 'next/server';
import { HttpError } from '@repo/auth';

export async function handleApi(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error(`[merchant] Unhandled API error:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

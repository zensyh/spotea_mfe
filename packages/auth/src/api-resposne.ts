import { NextResponse } from 'next/server';

export const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

export const unauthorized = (message = 'Unauthorized') =>
  NextResponse.json({ message }, { status: 401 });

export const notFound = (message = 'Not found') =>
  NextResponse.json({ message }, { status: 404 });

export const serverError = (message = 'Internal server error.') =>
  NextResponse.json({ message }, { status: 500 });

export function apiResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

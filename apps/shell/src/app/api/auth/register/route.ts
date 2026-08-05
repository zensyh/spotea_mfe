import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/features/auth/register/components/form/form-model/register.schema';
import { formatZodError } from '@/shared/lib/format-zod-validation';
import { API_PREFIX } from '@repo/auth/cookie';
import { apiResponse, serverError } from '@repo/auth';

const backendUrl = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    if (!backendUrl) {
      return serverError('Internal server error.');
    }

    const payload: Record<string, unknown> = {
      name: parsed.data.name,
      username: parsed.data.username,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    };
    if (parsed.data.email) payload.email = parsed.data.email;

    let res: Response;

    try {
      res = await fetch(`${backendUrl}${API_PREFIX}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            'Registration service is temporarily unavailable. Please try again.',
        },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (!res.ok) {
      return apiResponse(res.status, data.message || 'Signin failed.');
    }

    if (!res.ok) {
      const message =
        data && typeof data.message === 'string'
          ? data.message
          : 'Registrasi gagal';
      return apiResponse(res.status, message);
    }

    return NextResponse.json({ data: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : 'Terjadi kesalahan internal',
      },
      { status: 500 },
    );
  }
}

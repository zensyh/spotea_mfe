import { NextRequest, NextResponse } from 'next/server';
import { formatZodError } from '@/shared/lib/format-zod-validation';
import {
  apiResponse,
  badRequest,
  COOKIE_NAME,
  createSession,
  DEVICE_ID_COOKIE,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  serverError,
} from '@repo/auth';
import { buildDeviceHeaders } from '@/shared/lib/device-headers';
import { signinRequestSchema } from '@/features/auth/login/components/form/form-model/signin-request.schema';
import { API_PREFIX } from '@repo/auth/cookie';
import { signinBackendResponseSchema } from '@/features/auth/login/components/form/form-model/signin-response.schema';

export async function POST(request: NextRequest): Promise<Response> {

  const backendUrl = process.env.BACKEND_API_URL;


  try {
    const body = await request.json();
    const validated = signinRequestSchema.safeParse(body);

    if (!validated.success) {
      return badRequest(formatZodError(validated.error));
    }

    if (!backendUrl) {
      return serverError('Internal server error.');
    }

    const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
    const deviceId = existingDeviceId ?? crypto.randomUUID();

    let res: Response;

    try {
      res = await fetch(`${backendUrl}${API_PREFIX}/auth/signin`, {
        method: 'POST',
        headers: buildDeviceHeaders(request, deviceId),
        body: JSON.stringify(validated.data),
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            'Signin service is temporarily unavailable. Please try again.',
        },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (!res.ok) {
      return apiResponse(res.status, data.message || 'Signin failed.');
    }

    const responseSchema = signinBackendResponseSchema.safeParse(data);

    if (!responseSchema.success) {
      console.error(
        '[BFF signin] Backend response validation failed:',
        responseSchema.error.flatten(),
      );
      return NextResponse.json(
        { message: 'Unexpected backend response.' },
        { status: 502 },
      );
    }

    const { user, access_token, refresh_token } = responseSchema.data.data;

    const sid = crypto.randomUUID();
    const name = user.username;

    await createSession(
      sid,
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        userId: user.id,
        role: user.role,
        username: user.username,
        name,
        createdAt: new Date().toISOString(),
      },
      REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    );

    const response = NextResponse.json({
      user: {
        id: user.id,
        name,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    if (!existingDeviceId) {
      response.cookies.set(DEVICE_ID_COOKIE, deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}



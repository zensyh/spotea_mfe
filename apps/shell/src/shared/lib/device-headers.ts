function getDeviceName(userAgent: string | null): string {
  if (!userAgent) return 'Web Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg'))
    return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  return 'Web Browser';
}

export function buildDeviceHeaders(
  request: Request,
  deviceId: string,
): Record<string, string> {
  const forwardedFor =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent');
  const deviceName = getDeviceName(userAgent);

  return {
    'Content-Type': 'application/json',
    'x-forwarded-for': forwardedFor,
    'x-device-id': deviceId,
    'x-device-name': deviceName,
  };
}

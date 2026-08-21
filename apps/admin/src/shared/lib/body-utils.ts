export async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();
  const body: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    body[key] = value;
  }
  return body;
}

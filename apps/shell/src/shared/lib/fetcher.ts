type FetcherOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function fetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.message || 'Request gagal', res.status, data.errors);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

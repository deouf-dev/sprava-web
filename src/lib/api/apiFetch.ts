type apiFetchOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
};

async function apiFetch(path: string, options?: apiFetchOptions) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options?.token ? { Authorization: `${options.token}` } : {}),
    },
    ...(options?.body
      ? {
          body:
            options.body instanceof FormData
              ? options.body
              : JSON.stringify(options.body),
        }
      : {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(
        `STATUS: ${res.status} API request failed: ${errorData.message}`,
      );
    }
    throw new Error(`API request failed with status ${res.status}`);
  }
  return res.json();
}

export { apiFetch };

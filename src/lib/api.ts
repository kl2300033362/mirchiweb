const getApiBaseUrl = () => {
  const explicitBase = import.meta.env.VITE_API_BASE_URL;
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  return '';
};

const apiBaseUrl = getApiBaseUrl();

export const apiPath = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!apiBaseUrl) {
    return `/api${normalized}`;
  }
  return `${apiBaseUrl}/api${normalized}`;
};

export const postJson = async <T>(path: string, payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(apiPath(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? 'Request failed';
    throw new Error(message);
  }

  return data as T;
};

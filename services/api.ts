const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

interface ApiOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers,
    }
  );

  if (!response.ok) {
    let message = "Request failed";

    try {
      const data = await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Ignore invalid error response
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(endpoint: string, token?: string) {
    return request<T>(endpoint, {
      method: "GET",
      token,
    });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ) {
    return request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ) {
    return request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  },

  delete<T>(endpoint: string, token?: string) {
    return request<T>(endpoint, {
      method: "DELETE",
      token,
    });
  },
};

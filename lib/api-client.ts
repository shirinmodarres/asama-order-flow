const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/$/, "")
  : "http://localhost:4000";

type ApiRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: HeadersInit = {};

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    headers.Accept = "application/json";
  }

  if (typeof window !== "undefined") {
    const sessionToken = window.localStorage.getItem("sessionToken");
    if (sessionToken) {
      headers["session-token"] = sessionToken;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      getErrorMessage(payload) ??
      (typeof payload === "string" && payload.trim() ? payload : null) ??
      response.statusText ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error;

  return typeof message === "string" && message.trim() ? message : null;
}

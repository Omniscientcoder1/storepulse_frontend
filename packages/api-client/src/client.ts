import { ApiError } from "./errors";

export interface ApiClientConfig {
  /** Backend origin, e.g. `process.env.NEXT_PUBLIC_API_URL`. No trailing slash required. */
  baseUrl: string;
  /**
   * Returns the current admin JWT to attach as `Authorization: Bearer <token>`,
   * or `null`/`undefined` when there is none (storefront calls, logged-out admin).
   * A function rather than a stored value so each app decides *where* the
   * token lives (cookie, memory, next-auth session, ...) — this package never
   * reads storage itself. Never resolve this from anything holding a
   * client-supplied tenant ID; the token itself is the only tenant signal
   * that reaches the backend (KB §4 / AGENTS.md non-negotiable).
   */
  getAuthToken?: () => string | null | undefined;
  /** Extra headers merged into every request, e.g. for server-side calls that forward the incoming Host header. */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Serialized as the JSON request body. Do not pass an already-stringified body. */
  json?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
): string {
  const url = new URL(path.replace(/^\//, ""), baseUrl.replace(/\/?$/, "/"));
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Thin typed fetch wrapper — the *only* place frontend code makes HTTP calls
 * to the backend (AGENTS.md / FE-03 non-negotiable). Add typed methods per
 * resource in sibling files under `resources/`, each taking an `ApiClient`
 * instance; don't call `fetch` directly anywhere else in the frontend.
 */
export class ApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  /**
   * Issues one request and returns the parsed JSON body as `T`. Callers pass
   * the response type explicitly (`request<HealthResponse>(...)`) since these
   * types are meant to be regenerated from the backend's OpenAPI schema
   * rather than inferred.
   *
   * Throws `ApiError` for a non-2xx response, a network/timeout failure, or a
   * 2xx response whose body isn't valid JSON — never lets a raw fetch
   * exception or a parse error escape unwrapped.
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildUrl(this.config.baseUrl, path, options.query);
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    const token = this.config.getAuthToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    let init: RequestInit = {
      method: options.method ?? "GET",
      headers,
      signal: options.signal,
    };

    if (options.json !== undefined) {
      headers["Content-Type"] = "application/json";
      init = { ...init, body: JSON.stringify(options.json) };
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (cause) {
      throw new ApiError(
        cause instanceof Error ? cause.message : "Network request failed",
        0,
      );
    }

    const rawBody = await response.text();
    const parsedBody = rawBody.length > 0 ? tryParseJson(rawBody) : undefined;

    if (!response.ok) {
      throw new ApiError(
        describeError(parsedBody) ?? `Request failed with status ${response.status}`,
        response.status,
        parsedBody,
      );
    }

    if (rawBody.length === 0) {
      return undefined as T;
    }

    if (parsedBody === PARSE_FAILURE) {
      throw new ApiError(
        "Response was not valid JSON",
        response.status,
        rawBody,
      );
    }

    return parsedBody as T;
  }
}

const PARSE_FAILURE = Symbol("json-parse-failure");

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return PARSE_FAILURE;
  }
}

/** FastAPI's default error shape is `{"detail": "..." | [...]}` — surface it as the message when present. */
function describeError(body: unknown): string | undefined {
  if (body === PARSE_FAILURE || body === undefined || body === null) {
    return undefined;
  }
  if (typeof body === "object" && "detail" in body) {
    const { detail } = body as { detail: unknown };
    if (typeof detail === "string") return detail;
  }
  return undefined;
}

/**
 * Every failure the client can produce — network failure, non-2xx response,
 * or a 2xx body that doesn't parse as JSON — is normalized into this so
 * callers never need to catch a raw `TypeError` from `fetch` alongside a
 * typed API error.
 */
export class ApiError extends Error {
  /** HTTP status code, or `0` when the request never reached the server (network error, timeout). */
  readonly status: number;
  /** Parsed JSON error body, when the response had one. Shape is endpoint-specific (FastAPI's `{"detail": ...}` today). */
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /** True for network/timeout failures where no HTTP response was received at all. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

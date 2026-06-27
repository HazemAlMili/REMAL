/**
 * Normalized API error thrown by the storefront's fetch client.
 * Mirrors the platform's ApiError so callers can branch on `status`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

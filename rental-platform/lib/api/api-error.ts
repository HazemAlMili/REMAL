export class ApiError extends Error {
  public readonly status: number
  public readonly errors: string[]

  constructor(status: number, message: string, errors: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  // helper: is this a validation error with field details?
  hasFieldErrors(): boolean {
    return this.status === 422 && this.errors.length > 0
  }
}

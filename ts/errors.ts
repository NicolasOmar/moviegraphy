/** Error carrying an HTTP status code, so API endpoints can translate it into a Response without inspecting error internals. */
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'HttpError'
    this.status = status
  }
}

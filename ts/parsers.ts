import { HTTP_STATUS, USER_ERROR_MESSAGES } from './constants'
import { HttpError } from './errors'

export const parseModelToFormData = <T extends object>(rawFormData: T): FormData => {
  const _formData = new FormData()

  ;(Object.keys(rawFormData) as Array<keyof T>).forEach(key =>
    _formData.append(String(key), String(rawFormData[key]))
  )

  return _formData
}

export const parseFormDataToModel = <T extends object>(_formData: FormData): T => {
  return Array.from(_formData.entries()).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: value
    }),
    {} as T
  )
}

export const handleErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

export const parseResponseErrorToMessage = async (_response: Response) => {
  const errorMessage = (await _response.json()).message as string | string[]
  return Array.isArray(errorMessage) ? errorMessage.join('. ') : errorMessage
}

export const parseMessageToResponse = <T>(
  message: string | string[] | T,
  status: number
): Response => new Response(JSON.stringify({ message }), { status })

export const parseHttpErrorToResponse = (error: HttpError | unknown): Response => {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ message: error.message }), { status: error.status })
  }

  return parseMessageToResponse(USER_ERROR_MESSAGES.UNEXPECTED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
}

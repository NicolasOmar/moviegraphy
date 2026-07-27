import { HTTP_STATUS, USER_ERROR_MESSAGES } from './constants'
import { HttpError } from './types'

export const parseModelToFormData = <T extends object>(rawFormData: T): FormData => {
  const _formData = new FormData()

  ;(Object.keys(rawFormData) as Array<keyof T>).forEach(key =>
    _formData.append(String(key), String(rawFormData[key]))
  )

  return _formData
}

export const parseRequestToModel = async <T extends object>(request: Request): Promise<T> => {
  const extractedFormData = await request.formData()
  return Array.from(extractedFormData.entries()).reduce(
    (_finalModel, [_formDataKey, _formDataValue]) => ({
      ..._finalModel,
      [_formDataKey]: _formDataValue
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
    return parseMessageToResponse(error.message, error.status)
  }

  return parseMessageToResponse(USER_ERROR_MESSAGES.UNEXPECTED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
}

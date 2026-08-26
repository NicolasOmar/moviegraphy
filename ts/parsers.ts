import { HTTP_STATUS, USER_ERROR_MESSAGES } from './constants'
import { HttpError } from './types/api'

/** Converts a raw data object into a FormData for API consumption
 *
 * @param _rawFormData - A generic data object which shape is provided by the user
 * @returns A `FormData` object fo be sended from the React component to the `/pages/api` routes and be handled
 */
export const parseModelToFormData = <UserDefinedModel extends object>(
  _rawFormData: UserDefinedModel
): FormData => {
  const _formData = new FormData()

  ;(Object.keys(_rawFormData) as Array<keyof UserDefinedModel>).forEach(key =>
    _formData.append(String(key), String(_rawFormData[key]))
  )

  return _formData
}

/** Sort of inverted `parseModelToFormData` method. Used to parse a `FormData`
 * object into a user-defined data object
 *
 * @param _formData - A `FormData` object to be parsed
 * @returns A user-defined data object
 */
export const parseFormDataToModel = <UserDefinedModel extends object>(
  _formData: FormData
): UserDefinedModel => {
  return Array.from(_formData.entries()).reduce(
    (_finalModel, [_formDataKey, _formDataValue]) => ({
      ..._finalModel,
      [_formDataKey]: _formDataValue
    }),
    {} as UserDefinedModel
  )
}

/** Handles an API `Request` and obtains its `FormData` object to be parsed
 * into a user-defined data object using `parseFormDataToModel`
 *
 * @param _requestObject - A `Request` object obtained from a `APIRoute` request
 * @returns A user-defined data object inside a promise
 */
export const parseRequestToModel = async <UserDefinedModel extends object>(
  _requestObject: Request
): Promise<UserDefinedModel> => {
  const extractedFormData = await _requestObject.formData()

  return parseFormDataToModel<UserDefinedModel>(extractedFormData)
}

/** Normalizes a concatenated list of id strings into a clean list of individual ones
 *
 * - Accepts either a comma (or specific separator) separated string (as sent through `FormData`) or an array
 * - Filters out empty values, so an unselected/empty field never yields a bogus id
 *
 * @param _concatenatedString - Raw `genres` value coming from a form submission
 * @param _separator - `_concatenatedString` separator to return the individual ones. Is a comma (`,`) by default
 * @returns An array of non-empty strings
 */
export const parseIdStringToArray = (
  _concatenatedString: string | string[],
  _separator: string = ','
): string[] =>
  (Array.isArray(_concatenatedString)
    ? _concatenatedString
    : _concatenatedString.split(_separator)
  ).filter(Boolean)

/** Extract Response's success message from the `/pages/api` request and
 * displays it as a user-defined entity (which is `object` by default)
 *
 * @param _response - An API `Response` (in this case, a success)
 * @returns An common `object` or an user-defined one to be displayed by the front-end
 */
export const parseResponseMessageToEntity = async <OutputEntity = object>(
  _response: Response
): Promise<OutputEntity> => {
  return (await _response.json()).message as OutputEntity
}

/** Extract Response's error message from the `/pages/api` request and
 * displays it (even if is an array of strings, it joins them)
 *
 * @param _response - An API `Response` (in this case, an error)
 * @returns A single string to be displayed by the front-end
 */
export const parseResponseErrorToMessage = async (_response: Response) => {
  const errorMessage = (await _response.json()).message as string | string[]
  return Array.isArray(errorMessage) ? errorMessage.join('. ') : errorMessage
}

/** Parses a message string or a specific type of error object into a Response
 * from the `/pages/api` response to the front-end
 *
 * - Mostly used for success messages or `zod` schema errors
 *
 * @param _message - A string, list of strings or user-defined object with the mentioned message
 * @param _status - A [standard HTTP code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
 * @returns An API Response with standard `message` and `status`
 */
export const parseMessageToResponse = <T>(
  _message: string | string[] | T,
  _status: number
): Response => new Response(JSON.stringify({ message: _message }), { status: _status })

/** Parses an error (HTTP type or unknown) into a `Response` using
 * `parseMessageToResponse`
 *
 * - Mostly used for `/pages/api` error catching (it simplifies the
 * handling into a single return function)
 *
 * - If `_error` is an instance of `HttpError`, it will parse it into
 * a `Response` based on its data
 *    - Else, it will return an `UNEXPECTED` error message because as default
 *
 * @param _error - The error to be handled
 * @returns A `Response` object to ha handled to the front-end
 */
export const parseHttpErrorToResponse = (_error: HttpError | unknown): Response => {
  if (_error instanceof HttpError) {
    return parseMessageToResponse(_error.message, _error.status)
  }

  return parseMessageToResponse(USER_ERROR_MESSAGES.UNEXPECTED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
}

/** Parses an error related to `Prisma` handling into an `HttpError` to be handled by
 * the `/pages/api` handlers
 *
 * - Consoles the error at the `backend/api` level
 * - If the `_error` is an instance of `Error`. It return its `message` property
 * - Else, the `_error` is stringified and returned as the message
 * - Then, it returns the parsed message with a `INTERNAL_SERVER_ERROR` HTTP code
 *
 * @param _error - The error to be handled
 * @param _apiPath - A string path to trace, locate and debug the issue at the `backend/api` level
 * @returns An `HttpError` object to be handled by `/pages/api` responses
 */
export const parseApiErrorToHttpError = (
  _error: HttpError | unknown,
  _apiPath: string
): HttpError => {
  console.error(_apiPath, { error: _error })

  if (_error instanceof HttpError) {
    return _error
  }

  const errorMessage = _error instanceof Error ? _error.message : String(_error)

  return new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
}

/** Handles a value into a date formatted into ISO format (as standar)
 *
 * - If the _rawDate is a date, it will parse into a ISO-format string
 * - If is a string or a number, it will create a new Date to parse into ISO-format
 *
 * @param _rawDate - Date to be parsed from a string, number or a Date
 * @returns An ISO-formatted Date object
 */
export const parseValueToIsoDate = (_rawDate: Date | number | string): Date => {
  const dateIsoString =
    _rawDate instanceof Date ? _rawDate.toISOString() : new Date(_rawDate).toISOString()

  return new Date(dateIsoString)
}

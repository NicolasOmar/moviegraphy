import { HTTP_STATUS, PAGE_URL } from './constants'

/**
 * `fetch` wrapper for API calls that require an authenticated session. A plain `fetch` would
 * silently follow a 401-turned-redirect and resolve with the login page's HTML, leaving the
 * browser on the current page. This checks the status itself and navigates to the login page
 * when the session is invalid or expired, instead of relying on the fetch redirect chain.
 */
export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init)

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.assign(PAGE_URL.LOGIN)
  }

  return response
}

/** Compares two passwords if are equal
 *
 * - If both exists, it compare its values
 * - If one of boths are null, it will return true
 *
 * @param _firstPassword - Password to compare, it could be null
 * @param _secondPassword - Password to compare, it could be null
 */
export const arePassworsEqual = (_firstPassword?: string, _secondPassword?: string): boolean => {
  if (_firstPassword && _secondPassword) {
    return _firstPassword === _secondPassword
  }

  return true
}

/** Handles a value into a date formatted into ISO format (as standar)
 *
 * - If the _rawDate is a date, it will parse into a ISO-format string
 * - If is a string or a number, it will create a new Date to parse into ISO-format
 *
 * @param _rawDate - Date to be parsed from a string, number or a Date
 * @returns An ISO-formatted Date object
 */
export const parseToIsoDate = (_rawDate: Date | number | string): Date => {
  const dateIsoString =
    _rawDate instanceof Date ? _rawDate.toISOString() : new Date(_rawDate).toISOString()

  return new Date(dateIsoString)
}

/**
 * Current moment rebuilt from its ISO 8601 UTC string representation, so dates
 * persisted to the database stay independent of the server's local timezone.
 */
export const getCurrentISODate = (): Date => new Date(new Date().toISOString())

/**
 * `Date` offset by the given number of days from an ISO 8601 UTC baseline,
 * used to derive dates (e.g. session expiry) without server-timezone drift.
 */
export const getISODateWithDaysOffset = (days: number): Date => {
  const isoNow = getCurrentISODate()
  return new Date(isoNow.getTime() + days * 24 * 60 * 60 * 1000)
}

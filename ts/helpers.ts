export const passwordsAreEqual = (_firstPassword?: string, _secondPassword?: string): boolean => {
  if (_firstPassword && _secondPassword) {
    return _firstPassword === _secondPassword
  }

  return true
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

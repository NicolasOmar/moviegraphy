export const passwordsAreEqual = (_firstPassword?: string, _secondPassword?: string): boolean => {
  if (_firstPassword && _secondPassword) {
    return _firstPassword === _secondPassword
  }

  return true
}

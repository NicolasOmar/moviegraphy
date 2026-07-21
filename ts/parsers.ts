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

export const handleError = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { handleError, parseFormDataToModel } from '@ts/parsers'
import { v6 } from 'uuid'

const handleErrorResponse = (error: HttpError | unknown): Response => {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ message: error.message }), { status: error.status })
  }

  console.error(`[POST /api/users] ${handleError(error)}`)

  return new Response(JSON.stringify({ message: USER_ERROR_MESSAGES.UNEXPECTED }), {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  })
}

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)

  if (!newUserModel.name || !newUserModel.email || !newUserModel.password) {
    return new Response(JSON.stringify({ message: USER_ERROR_MESSAGES.MISSING_FIELDS }), {
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  if (newUserModel.password !== newUserModel.repeatPassword) {
    return new Response(JSON.stringify({ message: USER_ERROR_MESSAGES.PASSWORD_MISMATCH }), {
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  try {
    const createdUser = await createUser({
      email: newUserModel.email,
      id: v6(),
      name: newUserModel.name,
      password: newUserModel.password
    })

    return new Response(JSON.stringify({ message: createdUser }), { status: HTTP_STATUS.OK })
  } catch (error) {
    return handleErrorResponse(error)
  }
}

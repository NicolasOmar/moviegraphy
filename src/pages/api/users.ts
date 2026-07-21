export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { handleErrorMessage, parseFormDataToModel } from '@ts/parsers'
import { v6 } from 'uuid'

const handleErrorResponse = (error: HttpError | unknown): Response => {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ message: error.message }), { status: error.status })
  }

  console.error(`[POST /api/users] ${handleErrorMessage(error)}`)

  return new Response(JSON.stringify({ message: USER_ERROR_MESSAGES.UNEXPECTED }), {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  })
}

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)

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

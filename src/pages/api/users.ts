export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { parseFormDataToModel } from '@ts/parsers'
import { UserSchema } from 'prisma/schemas/user'
import { v6 } from 'uuid'
import { ZodError } from 'zod'

const handleErrorResponse = (error: HttpError | unknown): Response => {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ message: error.message }), { status: error.status })
  }

  return new Response(JSON.stringify({ message: USER_ERROR_MESSAGES.UNEXPECTED }), {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  })
}

const handleZodErrors = (errors: ZodError) => errors.issues.map(({ message }) => message)

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)
  const newUserToGenerate = {
    email: newUserModel.email,
    id: v6(),
    name: newUserModel.name,
    password: newUserModel.password
  }

  try {
    const safeUser = await UserSchema.safeParseAsync(newUserToGenerate)

    if (safeUser.error) {
      const errorMessage = handleZodErrors(safeUser.error)
      return new Response(JSON.stringify({ message: errorMessage }), {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    const createdUser = await createUser(newUserToGenerate)
    return new Response(JSON.stringify({ message: createdUser }), { status: HTTP_STATUS.OK })
  } catch (error) {
    return handleErrorResponse(error)
  }
}

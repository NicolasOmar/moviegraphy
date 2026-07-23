export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { UserCreateSchema } from '@schemas/user'
import { HTTP_STATUS } from '@ts/constants'
import { parseFormDataToModel, parseHttpErrorToResponse, parseMessageToResponse } from '@ts/parsers'
import { v6 } from 'uuid'
import { ZodError } from 'zod'

const handleZodErrors = (errors: ZodError) => errors.issues.map(({ message }) => message)

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)

  try {
    const { error } = await UserCreateSchema.safeParseAsync(newUserModel)

    if (error) {
      const userCreateZodMessage = handleZodErrors(error)
      return parseMessageToResponse(userCreateZodMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const userCreated = await createUser({
      email: newUserModel.email,
      id: v6(),
      name: newUserModel.name,
      password: newUserModel.password
    })

    return parseMessageToResponse(userCreated, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}

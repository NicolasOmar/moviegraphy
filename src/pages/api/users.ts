export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { handleError, parseFormDataToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ request }) => {
  try {
    const newUserFormData = await request.formData()
    const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)

    const createdUser = await createUser({
      email: newUserModel.email,
      id: v6(),
      name: newUserModel.name,
      password: newUserModel.password
    })

    return new Response(
      JSON.stringify({
        message: createdUser
      }),
      { status: 200 }
    )
  } catch (e) {
    throw new Error(handleError(e))
  }
}

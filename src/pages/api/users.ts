export const prerender = false
import type { UserFormModel } from '@components/users/ReactUserForm'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { parseFormDataToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)

  await createUser({
    email: newUserModel.email,
    id: v6(),
    name: newUserModel.name,
    password: newUserModel.password
  })

  return new Response(
    JSON.stringify({
      message: 'Success!'
    }),
    { status: 200 }
  )
}

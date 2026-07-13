export const prerender = false
import type { APIRoute } from 'astro'

import { createMovie } from '@api/movies'
import { faker } from '@faker-js/faker'

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData()
  await createMovie({
    countryMade: formData.get('countryMade') as string,
    description: formData.get('description') as string,
    id: faker.number.int({ max: 1000, min: 1 }),
    name: formData.get('name') as string,
    releaseYear: formData.get('releaseYear') as string
  })

  return new Response(
    JSON.stringify({
      message: 'Success!'
    }),
    { status: 200 }
  )
}

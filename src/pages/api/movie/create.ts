export const prerender = false
import type { MovieModel } from '@prisma/models'
import type { APIRoute } from 'astro'

import { createMovie } from '@api/movies'
import { v6 } from 'uuid'

const parseFormDataToModel = <T extends object>(_formData: FormData): T => {
  return Array.from(_formData.entries()).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: value
    }),
    {} as T
  )
}

export const POST: APIRoute = async ({ request }) => {
  const newMovieFormData = await request.formData()
  const newMovieModel = parseFormDataToModel<MovieModel>(newMovieFormData)

  await createMovie({
    ...newMovieModel,
    id: v6(),
    releaseYear: +newMovieModel.releaseYear
  })

  return new Response(
    JSON.stringify({
      message: 'Success!'
    }),
    { status: 200 }
  )
}

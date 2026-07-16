export const prerender = false
import type { MovieModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { parseFormDataToModel } from '@ts/parsers'
import { v6 } from 'uuid'

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

export const PATCH: APIRoute = async ({ request }) => {
  const updateMovieFormData = await request.formData()
  const updateMovieModel = parseFormDataToModel<MovieModel>(updateMovieFormData)

  await updateMovie({
    ...updateMovieModel,
    releaseYear: +updateMovieModel.releaseYear
  })

  return new Response(
    JSON.stringify({
      message: 'Success!'
    }),
    { status: 200 }
  )
}

export const DELETE: APIRoute = async ({ request }) => {
  const deleteMovieFormData = await request.formData()
  const deleteMovieModel = parseFormDataToModel<{ id: string }>(deleteMovieFormData)

  await deleteMovie(deleteMovieModel.id)

  return new Response(
    JSON.stringify({
      message: 'Success!'
    }),
    { status: 200 }
  )
}

import type { MovieModel } from '@models'
import type { CreateOrUpdateOne, DeleteOne, GetMany } from '@ts/misc'

import { handleErrorMessage } from '@ts/parsers'

import prismaInstance from './prisma'

export const getMovieList: GetMany<MovieModel> = async () => {
  try {
    return await prismaInstance.movie.findMany()
  } catch (error) {
    const message = handleErrorMessage(error)

    console.warn(`[getMovieList] Prisma query failed, returning an empty list: ${message}`)

    return []
  }
}

export const createMovie: CreateOrUpdateOne<MovieModel> = async newMovie => {
  return await prismaInstance.movie.create({ data: newMovie })
}

export const updateMovie: CreateOrUpdateOne<MovieModel> = async modifiedMovie => {
  const { id: movieId, ...dataToUpdate } = modifiedMovie

  return await prismaInstance.movie.update({
    data: dataToUpdate,
    where: { id: movieId }
  })
}

export const deleteMovie: DeleteOne = async id => {
  await prismaInstance.movie.delete({ where: { id } })

  return new Promise(resolve => resolve(true))
}

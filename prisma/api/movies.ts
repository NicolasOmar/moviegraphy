import type { MovieModel } from '@models'

import prisma from './prisma'

type GetMany<T> = () => Promise<T[]>

type CreateOrUpdateOne<T> = (_entity: T) => Promise<T>

export const getMovieList: GetMany<MovieModel> = async () => {
  return await prisma.movie.findMany()
}

export const createMovie: CreateOrUpdateOne<MovieModel> = async newMovie => {
  return await prisma.movie.create({ data: newMovie })
}

export const updateMovie: CreateOrUpdateOne<MovieModel> = async modifiedMovie => {
  const { id: movieId, ...dataToUpdate } = modifiedMovie
  
  return await prisma.movie.update({
    where: { id: movieId },
    data: dataToUpdate
  })
}

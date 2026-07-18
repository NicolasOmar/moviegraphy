import type { MovieModel } from '@models'

import prismaInstance from './prisma'

type CreateOrUpdateOne<T> = (_entity: T) => Promise<T>

type DeleteOne = (id: string) => Promise<boolean>

type GetMany<T> = () => Promise<T[]>

export const getMovieList: GetMany<MovieModel> = async () => {
  return await prismaInstance.movie.findMany()
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

import type { MovieModel } from '@prisma/models'

import prisma from 'src/api/prisma'

export const getMovies: () => Promise<MovieModel[]> = async () => {
  return await prisma.movie.findMany()
}

export const createMovie: (newMovie: MovieModel) => Promise<MovieModel> = async newMovie => {
  return await prisma.movie.create({ data: newMovie })
}

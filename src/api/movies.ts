import type { Movie } from 'prisma/generated/client'

import prisma from 'src/api/prisma'

// const generateResponse = <T,>(response: T) => {
//   const jsonResponse = JSON.stringify(response)

//   return new Response(jsonResponse, {
//     headers: { "Content-Type": "application/json" }
//   })
// }

export const getMovies: () => Promise<Movie[]> = async () => {
  return await prisma.movie.findMany()
}

export const createMovie: (newMovie: Movie) => Promise<Movie> = async newMovie => {
  console.warn('createMovie', newMovie)
  return await prisma.movie.create({ data: newMovie })
}

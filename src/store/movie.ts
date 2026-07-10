import type { MovieEntity } from '@ts/movie'

import { faker } from '@faker-js/faker'
import { atom } from 'nanostores'

const randomNumber = faker.number.int({ max: 15, min: 5 })
const randomMovies: MovieEntity[] = Array(randomNumber)
  .fill(null)
  .map(() => ({
    countryMade: faker.location.country(),
    description: faker.lorem.sentence(),
    id: faker.string.uuid(),
    name: faker.word.words(3),
    releaseYear: faker.number.int({ max: 2026, min: 1990 })
  }))

export const movieList = atom(randomMovies)

export const addMovie = (newMovie: MovieEntity) => {
  movieList.set([...movieList.get(), { ...newMovie, id: faker.string.uuid() }])
}

export const removeMovie = (movieId: string) => {
  movieList.set(movieList.get().filter(({ id }) => id !== movieId))
}

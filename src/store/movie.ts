import { atom } from 'nanostores'
import { faker } from '@faker-js/faker'
import type { MovieEntity } from '@ts/movie'

const randomNumber = faker.number.int({ min: 5, max: 15 })
const randomMovies: MovieEntity[] = Array(randomNumber)
  .fill(null)
  .map(() => ({
    name: faker.word.words(3),
    description: faker.lorem.sentence(),
    releaseYear: faker.number.int({ min: 1990, max: 2026 }),
    countryMade: faker.location.country()
  }))

export const movieList = atom(randomMovies)

export const addMovie = (newMovie: MovieEntity) => {
  movieList.set([...movieList.get(), newMovie])
}

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

export const $contextMovieList = atom<MovieEntity[]>(randomMovies)
export const $contextSelectedMovie = atom<MovieEntity | null>(null)

export const addMovie = (newMovie: MovieEntity) => {
  $contextMovieList.set([...$contextMovieList.get(), { ...newMovie, id: faker.string.uuid() }])
}

export const updateMovie = (updatedMovie: MovieEntity) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === updatedMovie.id ? updatedMovie : _movie))
  )
}

export const removeMovie = (movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id !== movieId))
}

export const updateMovieContext = (_updateData: MovieEntity | null) => {
  $contextSelectedMovie.set(_updateData)
}

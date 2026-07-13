import type { MovieEntity } from '@ts/movie'

import { faker } from '@faker-js/faker'
import { atom } from 'nanostores'

const randomNumber = faker.number.int({ max: 15, min: 5 })
const randomMovies: MovieEntity[] = Array(randomNumber)
  .fill(null)
  .map(() => ({
    countryMade: faker.location.country(),
    description: faker.lorem.sentence(),
    id: faker.number.int(),
    name: faker.word.words(3),
    releaseYear: faker.number.int({ max: 2026, min: 1990 })
  }))

export const $contextMovieList = atom<MovieEntity[]>(randomMovies)
export const $contextSelectedMovie = atom<MovieEntity | null>(null)

export const addMovieToContext = (newMovie: MovieEntity) => {
  $contextMovieList.set([...$contextMovieList.get(), { ...newMovie, id: faker.number.int() }])
}

export const updateMovieOnContext = (updatedMovie: MovieEntity) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === updatedMovie.id ? updatedMovie : _movie))
  )
}

export const deleteMovieOnContext = (movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id !== +movieId))
}

export const updateMovieOnContextContext = (_updateData: MovieEntity | null) => {
  $contextSelectedMovie.set(_updateData)
}

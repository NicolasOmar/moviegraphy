import type { MovieEntity } from '@ts/movie'

import { faker } from '@faker-js/faker'
import { atom } from 'nanostores'

export const $contextMovieList = atom<MovieEntity[]>([])
export const $contextSelectedMovie = atom<MovieEntity | null>(null)

export const setMovieContext = (movieList: MovieEntity[]) => $contextMovieList.set(movieList)

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

export const setSingleMovieOnContext = (_updateData: MovieEntity | null) => {
  $contextSelectedMovie.set(_updateData)
}

import type { MovieModel } from '@prisma/models'

import { atom } from 'nanostores'
import { v6 } from 'uuid'

export const $contextMovieList = atom<MovieModel[]>([])
export const $contextSelectedMovie = atom<MovieModel | null>(null)

export const setMovieContext = (movieList: MovieModel[]) => $contextMovieList.set(movieList)

export const addMovieToContext = (newMovie: MovieModel) => {
  $contextMovieList.set([...$contextMovieList.get(), { ...newMovie, id: v6() }])
}

export const updateMovieOnContext = (updatedMovie: MovieModel) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === updatedMovie.id ? updatedMovie : _movie))
  )
}

export const deleteMovieOnContext = (movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id === movieId))
}

export const setSingleMovieOnContext = (_updateData: MovieModel | null) => {
  $contextSelectedMovie.set(_updateData)
}

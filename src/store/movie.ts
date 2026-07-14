import type { MovieModel } from '@models'

import { atom } from 'nanostores'
import { v6 } from 'uuid'

export const $contextMovieList = atom<MovieModel[]>([])
export const $contextSelectedMovie = atom<MovieModel | null>(null)

export const setMovieListOnContext = (movieList: MovieModel[]) => $contextMovieList.set(movieList)

export const addMovieToListContext = (newMovie: MovieModel) => {
  $contextMovieList.set([...$contextMovieList.get(), { ...newMovie, id: v6() }])
}

export const updateMovieOnListContext = (updatedMovie: MovieModel) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === updatedMovie.id ? updatedMovie : _movie))
  )
}

export const deleteMovieOnListContext = (movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id === movieId))
}

export const updateSelectedMovieOnContext = (_updateData: MovieModel | null) => {
  $contextSelectedMovie.set(_updateData)
}

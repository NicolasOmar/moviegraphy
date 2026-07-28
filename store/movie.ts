import type { MoviesModel } from '@models'

import { atom } from 'nanostores'

export const $contextMovieList = atom<MoviesModel[]>([])
export const $contextSelectedMovie = atom<MoviesModel | null>(null)

export const setMovieListOnContext = (movieList: MoviesModel[]) => $contextMovieList.set(movieList)

export const addMovieToListContext = (newMovie: MoviesModel) => {
  $contextMovieList.set([...$contextMovieList.get(), newMovie])
}

export const updateMovieOnListContext = (updatedMovie: MoviesModel) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === updatedMovie.id ? updatedMovie : _movie))
  )
}

export const deleteMovieOnListContext = (movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id !== movieId))
}

export const updateSelectedMovieOnContext = (_updateData: MoviesModel | null) => {
  $contextSelectedMovie.set(_updateData)
}

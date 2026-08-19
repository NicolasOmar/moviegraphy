import type { MoviesModel } from '@models'
import type { MovieWithGenresModel } from '@ts/entities'

import { atom } from 'nanostores'

export const $contextMovieList = atom<MoviesModel[]>([])
export const $contextSelectedMovie = atom<MovieWithGenresModel | null>(null)

export const setMovieListOnContext = (_movieList: MoviesModel[]) =>
  $contextMovieList.set(_movieList)

export const addMovieToListContext = (_newMovie: MoviesModel) => {
  $contextMovieList.set([...$contextMovieList.get(), _newMovie])
}

export const updateMovieOnListContext = (_updatedMovie: MoviesModel) => {
  $contextMovieList.set(
    $contextMovieList.get().map(_movie => (_movie.id === _updatedMovie.id ? _updatedMovie : _movie))
  )
}

export const deleteMovieOnListContext = (_movieId: string) => {
  $contextMovieList.set($contextMovieList.get().filter(({ id }) => id !== _movieId))
}

export const updateSelectedMovieOnContext = (_updatedMovie: MovieWithGenresModel | null) => {
  $contextSelectedMovie.set(_updatedMovie)
}

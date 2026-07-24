import { beforeEach, describe, expect, it } from 'vitest'

import { movieMocks } from '../ts/mocks'
import {
  $contextMovieList,
  $contextSelectedMovie,
  addMovieToListContext,
  deleteMovieOnListContext,
  setMovieListOnContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from './movie'

beforeEach(() => {
  $contextMovieList.set([])
  $contextSelectedMovie.set(null)
})

describe('setMovieListOnContext', () => {
  it('replaces the movie list atom with the given list', () => {
    setMovieListOnContext(movieMocks)

    expect($contextMovieList.get()).toEqual(movieMocks)
  })
})

describe('addMovieToListContext', () => {
  it('appends the given movie to the end of the list, keeping its id unchanged', () => {
    setMovieListOnContext(movieMocks)
    const newMovie = { ...movieMocks[0], id: 'new-movie-id', name: 'New Movie' }

    addMovieToListContext(newMovie)

    expect($contextMovieList.get()).toEqual([...movieMocks, newMovie])
  })
})

describe('updateMovieOnListContext', () => {
  it('replaces only the entry matching the given id, leaving the rest untouched', () => {
    setMovieListOnContext(movieMocks)
    const [firstMovie, ...restOfMovies] = movieMocks
    const updatedMovie = { ...firstMovie, name: 'Updated Name' }

    updateMovieOnListContext(updatedMovie)

    expect($contextMovieList.get()).toEqual([updatedMovie, ...restOfMovies])
  })
})

describe('deleteMovieOnListContext', () => {
  it('removes the movie with the given id from the list', () => {
    setMovieListOnContext(movieMocks)
    const [movieToDelete, ...restOfMovies] = movieMocks

    deleteMovieOnListContext(movieToDelete.id)

    expect($contextMovieList.get()).toEqual(restOfMovies)
  })
})

describe('updateSelectedMovieOnContext', () => {
  it('sets and clears the selected movie atom', () => {
    const [movie] = movieMocks

    updateSelectedMovieOnContext(movie)
    expect($contextSelectedMovie.get()).toEqual(movie)

    updateSelectedMovieOnContext(null)
    expect($contextSelectedMovie.get()).toBeNull()
  })
})

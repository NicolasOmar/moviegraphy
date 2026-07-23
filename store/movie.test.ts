import { beforeEach, describe, expect, it, vi } from 'vitest'

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

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

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

describe('addMovieToListContext / updateMovieOnListContext', () => {
  it('appends a new movie with a generated id, then updates only the matching entry on later edits', () => {
    setMovieListOnContext(movieMocks)
    const [firstMovie, ...restOfMovies] = movieMocks

    addMovieToListContext(firstMovie)

    expect($contextMovieList.get()).toEqual([...movieMocks, { ...firstMovie, id: 'fixed-test-id' }])

    const updatedMovie = { ...firstMovie, name: 'Updated Name' }
    updateMovieOnListContext(updatedMovie)

    expect($contextMovieList.get()).toEqual([
      updatedMovie,
      ...restOfMovies,
      { ...firstMovie, id: 'fixed-test-id' }
    ])
  })
})

describe('deleteMovieOnListContext', () => {
  it.fails(
    'removes the movie with the given id from the list (KNOWN BUG: src/store/movie.ts filters `id === movieId`, so it keeps only the match instead of removing it)',
    () => {
      setMovieListOnContext(movieMocks)
      const [movieToDelete] = movieMocks

      deleteMovieOnListContext(movieToDelete.id)

      expect($contextMovieList.get().map(({ id }) => id)).not.toContain(movieToDelete.id)
    }
  )
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

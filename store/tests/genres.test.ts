import { beforeEach, describe, expect, it } from 'vitest'

import { genreMocks } from '../../ts/mocks'
import {
  $contextGenreList,
  $contextSelectedGenre,
  addGenreToListContext,
  deleteMovieOnListContext,
  setGenreListOnContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from '../genres'

beforeEach(() => {
  $contextGenreList.set([])
  $contextSelectedGenre.set(null)
})

describe('setGenreListOnContext', () => {
  it('replaces the genre list atom with the given list', () => {
    setGenreListOnContext(genreMocks)

    expect($contextGenreList.get()).toEqual(genreMocks)
  })
})

describe('addGenreToListContext', () => {
  it('appends the given genre to the end of the list, keeping its id unchanged', () => {
    setGenreListOnContext(genreMocks)
    const newGenre = { ...genreMocks[0], id: 'new-genre-id', name: 'New Genre' }

    addGenreToListContext(newGenre)

    expect($contextGenreList.get()).toEqual([...genreMocks, newGenre])
  })
})

describe('updateMovieOnListContext', () => {
  it('replaces only the entry matching the given id, leaving the rest untouched', () => {
    setGenreListOnContext(genreMocks)
    const [firstGenre, ...restOfGenres] = genreMocks
    const updatedGenre = { ...firstGenre, name: 'Updated Name' }

    updateMovieOnListContext(updatedGenre)

    expect($contextGenreList.get()).toEqual([updatedGenre, ...restOfGenres])
  })
})

describe('deleteMovieOnListContext', () => {
  it('removes the genre with the given id from the list', () => {
    setGenreListOnContext(genreMocks)
    const [genreToDelete, ...restOfGenres] = genreMocks

    deleteMovieOnListContext(genreToDelete.id)

    expect($contextGenreList.get()).toEqual(restOfGenres)
  })
})

describe('updateSelectedMovieOnContext', () => {
  it('sets and clears the selected genre atom', () => {
    const [genre] = genreMocks

    updateSelectedMovieOnContext(genre)
    expect($contextSelectedGenre.get()).toEqual(genre)

    updateSelectedMovieOnContext(null)
    expect($contextSelectedGenre.get()).toBeNull()
  })
})

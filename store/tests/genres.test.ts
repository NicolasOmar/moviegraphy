import { beforeEach, describe, expect, it } from 'vitest'

import { genreMocks } from '../../ts/mocks'
import {
  $contextGenreList,
  $contextSelectedGenre,
  addGenreToListContext,
  deleteGenreOnListContext,
  setGenreListOnContext,
  updateGenresOnListContext,
  updateSelectedGenreOnContext
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

describe('updateGenresOnListContext', () => {
  it('replaces only the entry matching the given id, leaving the rest untouched', () => {
    setGenreListOnContext(genreMocks)
    const [firstGenre, ...restOfGenres] = genreMocks
    const updatedGenre = { ...firstGenre, name: 'Updated Name' }

    updateGenresOnListContext(updatedGenre)

    expect($contextGenreList.get()).toEqual([updatedGenre, ...restOfGenres])
  })
})

describe('deleteGenreOnListContext', () => {
  it('removes the genre with the given id from the list', () => {
    setGenreListOnContext(genreMocks)
    const [genreToDelete, ...restOfGenres] = genreMocks

    deleteGenreOnListContext(genreToDelete.id)

    expect($contextGenreList.get()).toEqual(restOfGenres)
  })
})

describe('updateSelectedGenreOnContext', () => {
  it('sets and clears the selected genre atom', () => {
    const [genre] = genreMocks

    updateSelectedGenreOnContext(genre)
    expect($contextSelectedGenre.get()).toEqual(genre)

    updateSelectedGenreOnContext(null)
    expect($contextSelectedGenre.get()).toBeNull()
  })
})

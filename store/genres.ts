import { type GenresModel } from '@models'
import { atom } from 'nanostores'

export const $contextGenreList = atom<GenresModel[]>([])
export const $contextSelectedGenre = atom<GenresModel | null>(null)

export const setGenreListOnContext = (_genreList: GenresModel[]) =>
  $contextGenreList.set(_genreList)

export const addGenreToListContext = (_updatedGenre: GenresModel) => {
  $contextGenreList.set([...$contextGenreList.get(), _updatedGenre])
}

export const updateGenresOnListContext = (_updatedGenre: GenresModel) => {
  $contextGenreList.set(
    $contextGenreList.get().map(_genre => (_genre.id === _updatedGenre.id ? _updatedGenre : _genre))
  )
}

export const deleteGenreOnListContext = (_genreId: string) => {
  $contextGenreList.set($contextGenreList.get().filter(({ id }) => id !== _genreId))
}

export const updateSelectedGenreOnContext = (_updatedGenre: GenresModel | null) => {
  $contextSelectedGenre.set(_updatedGenre)
}

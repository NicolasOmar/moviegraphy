import type { ReactTableProps } from '@base-components/ReactTable'
import type { GenresModel, MoviesModel } from '@models'

import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useMovieForm } from '@hooks/useMovieForm'
import { useStore } from '@nanostores/react'
import { $contextMovieList, setMovieListOnContext } from '@store/movies'
import { COMMON_LABELS, MOVIE_LABELS } from '@ts/constants'
import { Button } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

interface ReactMoviePageProps extends ReactTableProps<MoviesModel> {
  genreList: GenresModel[]
}

export const ReactMoviePage: FC<ReactMoviePageProps> = ({ columns, dataSource, genreList }) => {
  const movieListInContext = useStore($contextMovieList)
  const { handleCreate, handleDelete, handleSearch, handleUpdate, isLoading, searchTerm } =
    useMovieForm({ genreList })

  useEffect(() => setMovieListOnContext(dataSource ?? []), [dataSource])

  const isSearching = useMemo(() => searchTerm !== null, [searchTerm])

  const memoizedMovieTableConfig = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleMovie: MoviesModel) => (
        <>
          <Button disabled={isLoading} onClick={() => handleUpdate(_singleMovie)}>
            {COMMON_LABELS.EDIT}
          </Button>
          <Button disabled={isLoading} onClick={() => handleDelete(_singleMovie)}>
            {COMMON_LABELS.DELETE}
          </Button>
        </>
      ),
      title: COMMON_LABELS.OPTIONS
    }
    const filteredDataSoruce =
      searchTerm === null
        ? movieListInContext
        : movieListInContext.filter(({ name }) =>
            name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
          )

    return {
      columns: [...columns, optionsColumn],
      dataSource: filteredDataSoruce
    }
  }, [movieListInContext, searchTerm, columns, isLoading, handleUpdate, handleDelete])

  return (
    <ReactComposedTable
      createText={MOVIE_LABELS.NEW_BTN}
      handleCreate={handleCreate}
      isSearching={isSearching}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>{COMMON_LABELS.NEW_BTN}</Button>,
        title: MOVIE_LABELS.NO_DATA
      }}
      noSearchConfig={{
        title: MOVIE_LABELS.NO_SEARCH_DATA
      }}
      searchConfig={{
        onChange: handleSearch,
        placeholder: COMMON_LABELS.SEARCH_BY_NAME
      }}
      tableConfig={memoizedMovieTableConfig}
      title={MOVIE_LABELS.TITLE}
    />
  )
}

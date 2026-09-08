import type { GenreWithMovieAmount } from '@ts-types/entities'

import { type ReactTableProps } from '@base-components/ReactTable'
import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import { $contextGenreList, setGenreListOnContext } from '@store/genres'
import { $globalLoading } from '@store/loading'
import { COMMON_LABELS, GENRE_LABELS } from '@ts/constants'
import { Button } from 'antd'
import { type FC, useEffect, useMemo, useState } from 'react'

export const ReactGenrePage: FC<ReactTableProps<GenreWithMovieAmount>> = ({
  columns,
  dataSource
}) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($globalLoading)
  const { handleCreate, handleDelete, handleUpdate } = useGenreForm()
  const [searchValue, setSearchValue] = useState<null | string>(null)

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const isSearching = useMemo(() => searchValue !== null, [searchValue])

  const memoizedGenreTableConfig = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenreWithMovieAmount) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleUpdate(_singleGenre)}>
            {COMMON_LABELS.EDIT}
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleDelete(_singleGenre)}>
            {COMMON_LABELS.DELETE}
          </Button>
        </>
      ),
      title: COMMON_LABELS.OPTIONS
    }
    const filteredDataSoruce =
      searchValue === null
        ? genreListInContext
        : genreListInContext.filter(({ name }) =>
            name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
          )

    return {
      columns: [...columns, optionsColumn],
      dataSource: filteredDataSoruce
    }
  }, [columns, genreListInContext, isSystemLoading, searchValue, handleUpdate, handleDelete])

  const handleSearch = (searchValue: string) =>
    setSearchValue(searchValue.length ? searchValue : null)

  return (
    <ReactComposedTable
      createText={GENRE_LABELS.NEW_BTN}
      handleCreate={handleCreate}
      isSearching={isSearching}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>{COMMON_LABELS.NEW_BTN}</Button>,
        title: GENRE_LABELS.NO_DATA
      }}
      noSearchConfig={{
        title: GENRE_LABELS.NO_SEARCH_DATA
      }}
      searchConfig={{
        onChange: handleSearch,
        placeholder: COMMON_LABELS.SEARCH_BY_NAME
      }}
      tableConfig={memoizedGenreTableConfig}
      title={GENRE_LABELS.TITLE}
    />
  )
}

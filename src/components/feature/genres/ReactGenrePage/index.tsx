import type { GenreWithMovieAmount } from '@ts-types/entities'

import { type ReactTableProps } from '@base-components/ReactTable'
import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import { $contextGenreList, setGenreListOnContext } from '@store/genres'
import { $globalLoading } from '@store/loading'
import { COMMON_TEXTS, GENRE_TEXTS } from '@ts/constants'
import { Button } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

export const ReactGenrePage: FC<ReactTableProps<GenreWithMovieAmount>> = ({
  columns,
  dataSource
}) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($globalLoading)
  const { handleCreate, handleDelete, handleUpdate } = useGenreForm()

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const memoizedGenreTableConfig = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenreWithMovieAmount) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleUpdate(_singleGenre)}>
            {COMMON_TEXTS.DELETE}
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleDelete(_singleGenre)}>
            {COMMON_TEXTS.DELETE}
          </Button>
        </>
      ),
      title: COMMON_TEXTS.OPTIONS
    }
    return {
      columns: [...columns, optionsColumn],
      dataSource: genreListInContext
    }
  }, [genreListInContext, columns, isSystemLoading, handleUpdate, handleDelete])

  return (
    <ReactComposedTable
      createText={GENRE_TEXTS.NEW_BTN}
      handleCreate={handleCreate}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>{COMMON_TEXTS.NEW_BTN}</Button>,
        title: GENRE_TEXTS.NO_DATA
      }}
      tableConfig={memoizedGenreTableConfig}
      title={GENRE_TEXTS.TITLE}
    />
  )
}

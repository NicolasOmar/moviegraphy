import type { GenreWithMovieAmount } from '@ts-types/entities'

import { type ReactTableProps } from '@base-components/ReactTable'
import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import { $contextGenreList, setGenreListOnContext } from '@store/genres'
import { $globalLoading } from '@store/loading'
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
            Edit
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleDelete(_singleGenre)}>
            Delete
          </Button>
        </>
      ),
      title: 'Options'
    }
    return {
      columns: [...columns, optionsColumn],
      dataSource: genreListInContext
    }
  }, [genreListInContext, columns, isSystemLoading, handleUpdate, handleDelete])

  return (
    <ReactComposedTable
      createText="+ New Genre"
      handleCreate={handleCreate}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>Create a new one</Button>,
        title: 'There are not registered Genres'
      }}
      tableConfig={memoizedGenreTableConfig}
      title="List of Genres"
    />
  )
}

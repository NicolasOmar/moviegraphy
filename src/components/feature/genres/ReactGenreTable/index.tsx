import type { GenreWithMovieAmount } from '@ts-types/entities'

import { type ReactTableProps } from '@base-components/ReactTable'
import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import {
  $contextGenreList,
  setGenreListOnContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $globalLoading } from '@store/loading'
import { callFormModal } from '@store/modals'
import { Button } from 'antd'
import { type FC, useCallback, useEffect, useMemo } from 'react'

export const ReactGenreTable: FC<ReactTableProps<GenreWithMovieAmount>> = ({
  columns,
  dataSource
}) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($globalLoading)
  const { form, handleDelete } = useGenreForm()

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const handleGenreFormModal = useCallback(() => callFormModal({ form }), [form])

  const handleGenreEdit = useCallback(
    (_genreToEdit: GenreWithMovieAmount) => {
      updateSelectedGenreOnContext(_genreToEdit)
      handleGenreFormModal()
    },
    [handleGenreFormModal]
  )

  const memoizedGenreTableConfig = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenreWithMovieAmount) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleGenreEdit(_singleGenre)}>
            Edit
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleDelete!(_singleGenre)}>
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
  }, [genreListInContext, columns, isSystemLoading, handleGenreEdit, handleDelete])

  return (
    <ReactComposedTable
      createText="+ New Genre"
      handleCreate={handleGenreFormModal}
      noDataConfig={{
        extraContent: <Button onClick={handleGenreFormModal}>Create a new one</Button>,
        title: 'There are not registered Genres'
      }}
      tableConfig={memoizedGenreTableConfig}
      title="List of Genres"
    />
  )
}

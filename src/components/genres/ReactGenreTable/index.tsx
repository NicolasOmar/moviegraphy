import type { GenreWithMovieAmount } from '@ts/entities'

import { ReactTable, type ReactTableProps } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import {
  $contextGenreList,
  deleteGenreOnListContext,
  setGenreListOnContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { callModal } from '@store/modals'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Typography } from 'antd'
import { type FC, useCallback, useEffect, useMemo } from 'react'

export const ReactGenreTable: FC<ReactTableProps<GenreWithMovieAmount>> = ({
  columns,
  dataSource
}) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($contextLoading)

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const executeDelete = async (_genreId: string) => {
    const genreIdToDelete = parseModelToFormData({ id: _genreId })

    const genreDeleteResponse = await fetchWithAuth(API_URLS.GENRES, {
      body: genreIdToDelete,
      method: API_METHODS.DELETE
    })

    if (genreDeleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(genreDeleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      deleteGenreOnListContext(_genreId)
      updateSelectedGenreOnContext(null)
      publishNotification({ content: 'Genre deleted', type: 'success' })
    }
  }

  const handleGenreDelete = useCallback(async (_genreToDelete: GenreWithMovieAmount) => {
    setLoadingSystemState(true)

    if (_genreToDelete.moviesAmount && _genreToDelete.moviesAmount > 0) {
      callModal({
        content: `The genre '${_genreToDelete.name}' has ${_genreToDelete.moviesAmount} movies registered, are you sure you want to delete the genre anyways?`,
        onOk: async () => await executeDelete(_genreToDelete.id)
      })
    } else {
      await executeDelete(_genreToDelete.id)
    }

    setLoadingSystemState(false)
  }, [])

  const memoizedGenreTable = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenreWithMovieAmount) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleGenreEdit(_singleGenre)}>
            Edit
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleGenreDelete(_singleGenre)}>
            Delete
          </Button>
        </>
      ),
      title: 'Options'
    }
    return <ReactTable columns={[...columns, optionsColumn]} dataSource={genreListInContext} />
  }, [genreListInContext, columns, isSystemLoading, handleGenreDelete])

  const handleGenreEdit = (_genreToEdit: GenreWithMovieAmount) =>
    updateSelectedGenreOnContext(_genreToEdit)

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of Genres
      </Typography.Title>
      {memoizedGenreTable}
    </section>
  )
}

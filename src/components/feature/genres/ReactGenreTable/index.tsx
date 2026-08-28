import type { GenreWithMovieAmount } from '@ts-types/entities'

import { type ReactTableProps } from '@base-components/ReactTable'
import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import {
  $contextGenreList,
  deleteGenreOnListContext,
  setGenreListOnContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { callConfirmModal, callFormModal } from '@store/modals'
import { publishNotification } from '@store/notifications'
import {
  API_METHODS,
  API_URLS,
  buildGenreDeleteConfirmationMessage,
  HTTP_STATUS
} from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button } from 'antd'
import { type FC, useCallback, useEffect, useMemo } from 'react'

export const ReactGenreTable: FC<ReactTableProps<GenreWithMovieAmount>> = ({
  columns,
  dataSource
}) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($contextLoading)
  const { form } = useGenreForm()

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const handleDeleteAction = async (_genreId: string) => {
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

  const handleGenreFormModal = useCallback(() => callFormModal({ form }), [form])

  const handleGenreEdit = useCallback(
    (_genreToEdit: GenreWithMovieAmount) => {
      updateSelectedGenreOnContext(_genreToEdit)
      handleGenreFormModal()
    },
    [handleGenreFormModal]
  )

  const handleGenreDelete = useCallback(async (_genreToDelete: GenreWithMovieAmount) => {
    setLoadingSystemState(true)

    if (_genreToDelete.moviesAmount && _genreToDelete.moviesAmount > 0) {
      callConfirmModal({
        content: buildGenreDeleteConfirmationMessage(
          _genreToDelete.name,
          _genreToDelete.moviesAmount
        ),
        onCancel: () => setLoadingSystemState(false),
        onOk: async () => {
          await handleDeleteAction(_genreToDelete.id)
          setLoadingSystemState(false)
        }
      })
    } else {
      await handleDeleteAction(_genreToDelete.id)
      setLoadingSystemState(false)
    }
  }, [])

  const memoizedGenreTableConfig = useMemo(() => {
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
    return {
      columns: [...columns, optionsColumn],
      dataSource: genreListInContext
    }
  }, [genreListInContext, columns, isSystemLoading, handleGenreEdit, handleGenreDelete])

  return (
    <ReactComposedTable
      noDataConfig={{
        extraContent: <Button onClick={handleGenreFormModal}>Create a new one</Button>,
        title: 'There are not registered Genres'
      }}
      onCreate={handleGenreFormModal}
      tableConfig={memoizedGenreTableConfig}
      title="List of Genres"
    />
  )
}

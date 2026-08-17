import type { GenresModel } from '@models'

import { ReactTable, type ReactTableProps } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import {
  $contextGenreList,
  deleteGenreOnListContext,
  setGenreListOnContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Typography } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

export const ReactGenreTable: FC<ReactTableProps<GenresModel>> = ({ columns, dataSource }) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($contextLoading)

  const memoizedGenreTable = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenresModel) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleGenreEdit(_singleGenre)}>
            E
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleGenreDelete(_singleGenre.id)}>
            D
          </Button>
        </>
      ),
      title: 'Options'
    }
    return <ReactTable columns={[...columns, optionsColumn]} dataSource={genreListInContext} />
  }, [genreListInContext, columns, isSystemLoading])

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const handleGenreEdit = (_genreToEdit: GenresModel) => updateSelectedGenreOnContext(_genreToEdit)

  const handleGenreDelete = async (_genreId: string) => {
    setLoadingSystemState(true)

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

    setLoadingSystemState(false)
  }

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of Genres
      </Typography.Title>
      {memoizedGenreTable}
    </section>
  )
}

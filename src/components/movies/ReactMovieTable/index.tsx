import type { ReactTableProps } from '@components/shared/ReactTable'
import type { MoviesModel } from '@models'
import type { InputEventHandler } from '@ts/types'

import { ReactTable } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import {
  $contextMovieList,
  deleteMovieOnListContext,
  setMovieListOnContext,
  updateSelectedMovieOnContext
} from '@store/movies'
import { API_METHODS, API_URL, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Input, Typography } from 'antd'
import { type FC, useEffect, useMemo, useState } from 'react'

export const ReactMovieTable: FC<ReactTableProps<MoviesModel>> = ({ columns, dataSource }) => {
  const movieListInContext = useStore($contextMovieList)
  const isSystemLoading = useStore($contextLoading)
  const [searchParam, setSearchParam] = useState<string>('')

  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? movieListInContext.filter(_movie => _movie.name.includes(searchParam))
        : movieListInContext
    const optionsColumn = {
      key: 'options',
      render: (_singleMovie: MoviesModel) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleEdit(_singleMovie)}>
            E
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleDelete(_singleMovie.id)}>
            D
          </Button>
        </>
      ),
      title: 'Options'
    }

    return <ReactTable columns={[...columns, optionsColumn]} dataSource={filteredDataSource} />
  }, [movieListInContext, columns, searchParam, isSystemLoading])

  useEffect(() => setMovieListOnContext(dataSource ?? []), [dataSource])

  const handleSearch: InputEventHandler = searchEvent => setSearchParam(searchEvent.target.value)
  const memoizedSeach = useMemo(
    () =>
      movieListInContext.length > 0 ? (
        <Input disabled={isSystemLoading} onChange={handleSearch} />
      ) : null,
    [movieListInContext, isSystemLoading]
  )

  const handleEdit = (_movieToEdit: MoviesModel) => updateSelectedMovieOnContext(_movieToEdit)

  const handleDelete = async (id: string) => {
    setLoadingSystemState(true)
    const movieIdToDelete = parseModelToFormData({ id })

    const movieDeleteResponse = await fetchWithAuth(API_URL.MOVIES, {
      body: movieIdToDelete,
      method: API_METHODS.DELETE
    })

    if (movieDeleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieDeleteResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      deleteMovieOnListContext(id)
      updateSelectedMovieOnContext(null)
      addMessageToContext({ content: 'Movie deleted', type: 'success' })
    }

    setLoadingSystemState(false)
  }

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of movies
      </Typography.Title>
      {memoizedSeach}
      {memoizedTable}
    </section>
  )
}

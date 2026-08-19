import type { ReactTableProps } from '@components/shared/ReactTable'
import type { MoviesModel } from '@models'
import type { MovieWithGenresModel } from '@ts/entities'
import type { InputEventHandler } from '@ts/types'

import { ReactTable } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import {
  $contextMovieList,
  deleteMovieOnListContext,
  setMovieListOnContext,
  updateSelectedMovieOnContext
} from '@store/movies'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import {
  parseModelToFormData,
  parseResponseErrorToMessage,
  parseResponseMessageToEntity
} from '@ts/parsers'
import { Button, Input, Typography } from 'antd'
import { type FC, useEffect, useMemo, useState } from 'react'

export const ReactMovieTable: FC<ReactTableProps<MoviesModel>> = ({ columns, dataSource }) => {
  const movieListInContext = useStore($contextMovieList)
  const isSystemLoading = useStore($contextLoading)
  const [searchParam, setSearchParam] = useState<string>('')

  const handleSearch: InputEventHandler = searchEvent => setSearchParam(searchEvent.target.value)

  const memoizedMovieTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? movieListInContext.filter(_movie => _movie.name.includes(searchParam))
        : movieListInContext
    const optionsColumn = {
      key: 'options',
      render: (_singleMovie: MoviesModel) => (
        <>
          <Button disabled={isSystemLoading} onClick={() => handleMovieEdit(_singleMovie.id)}>
            Edit
          </Button>
          <Button disabled={isSystemLoading} onClick={() => handleMovieDelete(_singleMovie.id)}>
            Delete
          </Button>
        </>
      ),
      title: 'Options'
    }

    return <ReactTable columns={[...columns, optionsColumn]} dataSource={filteredDataSource} />
  }, [movieListInContext, columns, searchParam, isSystemLoading])
  const memoizedMovieSearch = useMemo(
    () =>
      movieListInContext.length > 0 ? (
        <Input disabled={isSystemLoading} onChange={handleSearch} />
      ) : null,
    [movieListInContext, isSystemLoading]
  )

  useEffect(() => setMovieListOnContext(dataSource ?? []), [dataSource])

  const handleMovieEdit = async (_movieIdToEdit: string) => {
    const movieCompleteResponse = await fetchWithAuth(`${API_URLS.MOVIES}/${_movieIdToEdit}`, {
      method: API_METHODS.GET
    })

    if (movieCompleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieCompleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      const movieCompleteModel =
        await parseResponseMessageToEntity<MovieWithGenresModel>(movieCompleteResponse)

      updateSelectedMovieOnContext(movieCompleteModel)
    }
  }

  const handleMovieDelete = async (_movieId: string) => {
    setLoadingSystemState(true)
    const movieIdToDelete = parseModelToFormData({ id: _movieId })

    const movieDeleteResponse = await fetchWithAuth(API_URLS.MOVIES, {
      body: movieIdToDelete,
      method: API_METHODS.DELETE
    })

    if (movieDeleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieDeleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      deleteMovieOnListContext(_movieId)
      updateSelectedMovieOnContext(null)
      publishNotification({ content: 'Movie deleted', type: 'success' })
    }

    setLoadingSystemState(false)
  }

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of movies
      </Typography.Title>
      {memoizedMovieSearch}
      {memoizedMovieTable}
    </section>
  )
}

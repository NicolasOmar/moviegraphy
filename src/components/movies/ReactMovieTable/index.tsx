import type { ReactTableProps } from '@components/shared/ReactTable'
import type { MovieModel } from '@models'
import type { InputEventHandler } from '@ts/misc'

import { ReactTable } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import {
  $contextMovieList,
  deleteMovieOnListContext,
  setMovieListOnContext,
  updateSelectedMovieOnContext
} from '@store/movie'
import { API_METHODS, API_URL } from '@ts/constants'
import { parseModelToFormData } from '@ts/parsers'
import { Button, Input } from 'antd'
import { type FC, useEffect, useMemo, useState } from 'react'

export const ReactMovieTable: FC<ReactTableProps<MovieModel>> = ({ columns, dataSource }) => {
  const movieListInContext = useStore($contextMovieList)
  const [searchParam, setSearchParam] = useState<string>('')
  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? movieListInContext.filter(_movie => _movie.name.includes(searchParam))
        : movieListInContext
    const optionsColumn = {
      key: 'options',
      render: (_singleMovie: MovieModel) => (
        <>
          <Button onClick={() => handleEdit(_singleMovie)}>E</Button>
          <Button onClick={() => handleDelete(_singleMovie.id)}>D</Button>
        </>
      ),
      title: 'Options'
    }

    return <ReactTable columns={[...columns, optionsColumn]} dataSource={filteredDataSource} />
  }, [movieListInContext, columns, searchParam])

  useEffect(() => setMovieListOnContext(dataSource ?? []), [dataSource])

  const handleSearch: InputEventHandler = searchEvent => setSearchParam(searchEvent.target.value)

  const handleEdit = (_movieToEdit: MovieModel) => updateSelectedMovieOnContext(_movieToEdit)

  const handleDelete = async (id: string) => {
    const movieIdToDelete = parseModelToFormData({ id })

    await fetch(API_URL.MOVIES, {
      body: movieIdToDelete,
      method: API_METHODS.DELETE
    })

    deleteMovieOnListContext(id)
    updateSelectedMovieOnContext(null)
  }

  return (
    <>
      <Input onChange={handleSearch} />
      {memoizedTable}
    </>
  )
}

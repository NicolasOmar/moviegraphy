import type { ReactTableProps } from '@components/shared/ReactTable'
import type { MovieModel } from '@models'
import type { InputEventHandler } from '@ts/misc'

import { DeleteFilled, EditFilled } from '@ant-design/icons'
import { ReactTable } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import {
  $contextMovieList,
  deleteMovieOnListContext,
  setMovieListOnContext,
  updateSelectedMovieOnContext
} from '@store/movie'
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
          <Button
            icon={<EditFilled />}
            onClick={() => updateSelectedMovieOnContext(_singleMovie)}
          />

          <Button
            icon={<DeleteFilled />}
            onClick={() => deleteMovieOnListContext(_singleMovie.id.toString())}
          />
        </>
      ),
      title: 'Options'
    }

    return <ReactTable columns={[...columns, optionsColumn]} dataSource={filteredDataSource} />
  }, [movieListInContext, columns, searchParam])

  useEffect(() => setMovieListOnContext(dataSource ?? []), [dataSource])

  const handleSearch: InputEventHandler = searchEvent => setSearchParam(searchEvent.target.value)

  return (
    <>
      <Input onChange={handleSearch} />
      {memoizedTable}
    </>
  )
}

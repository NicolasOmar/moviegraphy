import type { ReactTableProps } from '@components/ReactTable'
import type { InputEventHandler } from '@ts/misc'
import type { MovieEntity } from '@ts/movie'

import { DeleteFilled, EditFilled } from '@ant-design/icons'
import { ReactTable } from '@components/ReactTable'
import { useStore } from '@nanostores/react'
import { $contextMovieList, removeMovie, updateMovieContext } from '@store/movie'
import { Button, Input } from 'antd'
import { type FC, useMemo, useState } from 'react'

export const ReactMovieTable: FC<ReactTableProps<MovieEntity>> = ({ columns }) => {
  const generalMovieList = useStore($contextMovieList)

  const [searchParam, setSearchParam] = useState<string>('')
  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? generalMovieList.filter(_movie => _movie.name.includes(searchParam))
        : generalMovieList
    const optionsColumn = {
      key: 'options',
      render: (_singleMovie: MovieEntity) => (
        <>
          <Button icon={<EditFilled />} onClick={() => updateMovieContext(_singleMovie)} />

          <Button icon={<DeleteFilled />} onClick={() => removeMovie(_singleMovie.id)} />
        </>
      ),
      title: 'Options'
    }

    return (
      <ReactTable {...{ columns: [...columns, optionsColumn], dataSource: filteredDataSource }} />
    )
  }, [generalMovieList, columns, searchParam])

  const handleSearch: InputEventHandler = event => setSearchParam(event.target.value)

  return (
    <>
      <Input onChange={handleSearch} />
      {memoizedTable}
    </>
  )
}

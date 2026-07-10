import type { ReactTableProps } from '@components/ReactTable'
import type { InputEventHandler } from '@ts/misc'
import type { MovieEntity } from '@ts/movie'

import ReactInput from '@components/ReactInput'
import { ReactTable } from '@components/ReactTable'
import { useStore } from '@nanostores/react'
import { movieList, removeMovie } from '@store/movie'
import { Button } from 'antd'
import { type FC, useMemo, useState } from 'react'

export const ReactMovieTable: FC<ReactTableProps<MovieEntity>> = ({ columns }) => {
  const generalMovieList = useStore(movieList)

  const [searchParam, setSearchParam] = useState<string>('')
  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? generalMovieList.filter(_movie => _movie.name.includes(searchParam))
        : generalMovieList
    const testing = {
      key: 'options',
      render: ({ id }: MovieEntity) => <Button onClick={() => removeMovie(id)}>X</Button>,
      title: 'Options'
    }

    return <ReactTable {...{ columns: [...columns, testing], dataSource: filteredDataSource }} />
  }, [generalMovieList, columns, searchParam])

  const handleChange: InputEventHandler = event => setSearchParam(event.target.value)

  return (
    <>
      <ReactInput onChange={handleChange} />
      {memoizedTable}
    </>
  )
}

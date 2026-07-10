import { useMemo, useState, type FC } from 'react'
import type { ReactTableProps } from '@components/ReactTable'
import { ReactTable } from '@components/ReactTable'
import ReactInput from '@components/ReactInput'
import type { Movie } from '@ts/movie'
import type { InputEventHandler } from '@ts/misc'

export const ReactMovieTable: FC<ReactTableProps<Movie>> = ({ dataSource, columns }) => {
  const [searchParam, setSearchParam] = useState<string>('')
  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? dataSource.filter(_movie => _movie.name.includes(searchParam))
        : dataSource

    return <ReactTable {...{ dataSource: filteredDataSource, columns }} />
  }, [dataSource, columns, searchParam])

  const handleChange: InputEventHandler = event => setSearchParam(event.target.value)

  return (
    <>
      <ReactInput onChange={handleChange} />
      {memoizedTable}
    </>
  )
}

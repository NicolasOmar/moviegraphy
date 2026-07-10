import { useMemo, useState, type FC } from 'react'
import type { ReactTableProps } from '@components/ReactTable'
import { ReactTable } from '@components/ReactTable'
import ReactInput from '@components/ReactInput'
import type { MovieEntity } from '@ts/movie'
import type { InputEventHandler } from '@ts/misc'
import { movieList } from '@store/movie'
import { useStore } from '@nanostores/react'

export const ReactMovieTable: FC<ReactTableProps<MovieEntity>> = ({ columns }) => {
  const generalMovieList = useStore(movieList)

  const [searchParam, setSearchParam] = useState<string>('')
  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? generalMovieList.filter(_movie => _movie.name.includes(searchParam))
        : generalMovieList

    return <ReactTable {...{ dataSource: filteredDataSource, columns }} />
  }, [generalMovieList, columns, searchParam])

  const handleChange: InputEventHandler = event => setSearchParam(event.target.value)

  return (
    <>
      <ReactInput onChange={handleChange} />
      {memoizedTable}
    </>
  )
}

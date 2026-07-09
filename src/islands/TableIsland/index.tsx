import { useMemo, useState, type ChangeEventHandler, type FC } from 'react'
import type { ReactTableProps } from '../../components/ReactTable'
import { ReactTable } from '../../components/ReactTable'
import type { Movie } from '../../ts/movie'
import ReactInput from '../../components/ReactInput'

interface TableIslandProps {
  table: ReactTableProps<Movie>
}

const TableIsland: FC<TableIslandProps> = ({ table }) => {
  const [searchParam, setSearchParam] = useState<string>('')
  const handleChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> = event =>
    setSearchParam(event.target.value)

  const memoizedTable = useMemo(() => {
    const filteredDataSource =
      searchParam.length > 0
        ? table.dataSource.filter(_data => _data.name.includes(searchParam))
        : table.dataSource

    return <ReactTable dataSource={filteredDataSource} columns={table.columns} />
  }, [table, searchParam])

  return (
    <>
      <ReactInput onChange={handleChange} />
      {memoizedTable}
    </>
  )
}

export default TableIsland

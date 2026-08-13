import type { GenresModel } from '@models'

import { ReactTable, type ReactTableProps } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import { $contextGenreList, setGenreListOnContext } from '@store/genres'
import { Typography } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

export const ReactGenreList: FC<ReactTableProps<GenresModel>> = ({ columns, dataSource }) => {
  const genreListInContext = useStore($contextGenreList)

  const memoizedGenreTable = useMemo(() => {
    return <ReactTable columns={columns} dataSource={genreListInContext} />
  }, [genreListInContext, columns])

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of Genres
      </Typography.Title>
      {memoizedGenreTable}
    </section>
  )
}

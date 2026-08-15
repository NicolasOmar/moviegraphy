import type { GenresModel } from '@models'

import { ReactTable, type ReactTableProps } from '@components/shared/ReactTable'
import { useStore } from '@nanostores/react'
import {
  $contextGenreList,
  setGenreListOnContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $contextLoading } from '@store/loading'
import { Button, Typography } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

export const ReactGenreTable: FC<ReactTableProps<GenresModel>> = ({ columns, dataSource }) => {
  const genreListInContext = useStore($contextGenreList)
  const isSystemLoading = useStore($contextLoading)

  const memoizedGenreTable = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleGenre: GenresModel) => (
        <Button disabled={isSystemLoading} onClick={() => handleGenreEdit(_singleGenre)}>
          E
        </Button>
      ),
      title: 'Options'
    }
    return <ReactTable columns={[...columns, optionsColumn]} dataSource={genreListInContext} />
  }, [genreListInContext, columns, isSystemLoading])

  useEffect(() => setGenreListOnContext(dataSource ?? []), [dataSource])

  const handleGenreEdit = (_genreToEdit: GenresModel) => updateSelectedGenreOnContext(_genreToEdit)

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        List of Genres
      </Typography.Title>
      {memoizedGenreTable}
    </section>
  )
}

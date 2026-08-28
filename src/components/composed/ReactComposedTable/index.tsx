import { Button, Table, Typography } from 'antd'

import type { ReactTableProps } from '../../base/ReactTable'

import { ReactResult, type ReactResultProps } from '../../base/ReactResult'

export interface ReactComposedTableProps<T> {
  noDataConfig: ReactResultProps
  onCreate: () => void
  tableConfig: ReactTableProps<T>
  title: string
}

export const ReactComposedTable = <T,>({
  noDataConfig,
  onCreate,
  tableConfig,
  title
}: ReactComposedTableProps<T>) => {
  return tableConfig.dataSource !== undefined && tableConfig.dataSource.length > 0 ? (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        {title}
      </Typography.Title>
      <Button onClick={onCreate} type="primary">
        Create
      </Button>
      <Table {...tableConfig} />
    </section>
  ) : (
    <ReactResult {...noDataConfig} />
  )
}

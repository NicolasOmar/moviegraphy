import { Table, Typography } from 'antd'

import type { ReactTableProps } from '../ReactTable'

import { ReactResult, type ReactResultProps } from '../ReactResult'

export interface ReactComposedTableProps<T> {
  noDataConfig: ReactResultProps
  tableConfig: ReactTableProps<T>
  title: string
}

export const ReactComposedTable = <T,>({
  noDataConfig,
  tableConfig,
  title
}: ReactComposedTableProps<T>) => {
  return tableConfig.dataSource !== undefined && tableConfig.dataSource.length > 0 ? (
    <>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        {title}
      </Typography.Title>
      <Table {...tableConfig} />
    </>
  ) : (
    <ReactResult {...noDataConfig} />
  )
}

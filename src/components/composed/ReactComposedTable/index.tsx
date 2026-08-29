import { Button, Space, Table, Typography } from 'antd'

import type { ReactTableProps } from '../../base/ReactTable'

import { ReactResult, type ReactResultProps } from '../../base/ReactResult'

export interface ReactComposedTableProps<T> {
  createText?: string
  handleCreate: () => void
  noDataConfig: ReactResultProps
  tableConfig: ReactTableProps<T>
  title: string
}

export const ReactComposedTable = <T,>({
  createText = 'Create',
  handleCreate,
  noDataConfig,
  tableConfig,
  title
}: ReactComposedTableProps<T>) => {
  return tableConfig.dataSource !== undefined && tableConfig.dataSource.length > 0 ? (
    <>
      <Space align="center" size="large" style={{ justifyContent: 'center', margin: '2.5% 0' }}>
        <Typography.Title level={2} style={{ margin: '0' }}>
          {title}
        </Typography.Title>
        <Button onClick={handleCreate} type="primary">
          {createText}
        </Button>
      </Space>
      <Table {...tableConfig} />
    </>
  ) : (
    <ReactResult {...noDataConfig} />
  )
}

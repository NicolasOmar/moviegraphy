import { Table } from 'antd'

export interface ReactTableProps<T> {
  dataSource: T[]
  columns: object[]
}

export const ReactTable = <T,>({ dataSource, columns }: ReactTableProps<T>) => (
  <Table dataSource={dataSource} columns={columns} />
)

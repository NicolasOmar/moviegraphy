import { Table } from 'antd'

export interface ReactTableProps<T> {
  dataSource?: T[]
  columns: object[]
}

export const ReactTable = <T,>({ dataSource, columns }: ReactTableProps<T>) =>
  dataSource && dataSource.length ? <Table dataSource={dataSource} columns={columns} /> : null

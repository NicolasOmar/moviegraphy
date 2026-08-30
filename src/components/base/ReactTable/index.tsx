import { Table } from 'antd'

export interface ReactTableProps<T> {
  columns: object[]
  dataSource?: T[]
}

export const ReactTable = <T,>({ columns, dataSource }: ReactTableProps<T>) => {
  return dataSource && dataSource.length ? (
    <Table columns={columns} dataSource={dataSource} />
  ) : null
}

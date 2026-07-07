import { Table } from 'antd'

interface ReactTableProps<T> {
  dataSource: T[]
  columns: object[]
}

const ReactTable = <T,>({ dataSource, columns }: ReactTableProps<T>) => (
  <Table dataSource={dataSource} columns={columns} />
)

export default ReactTable

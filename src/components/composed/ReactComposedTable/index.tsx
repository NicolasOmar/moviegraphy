import { Button, Input, Space, Table, Typography } from 'antd'

import type { ReactTableProps } from '../../base/ReactTable'

import { ReactResult, type ReactResultProps } from '../../base/ReactResult'

export interface ReactComposedTableProps<T> {
  createText?: string
  handleCreate: () => void
  isSearching?: boolean
  noDataConfig: ReactResultProps
  noSearchConfig?: ReactResultProps
  searchConfig: SearchProps
  tableConfig: ReactTableProps<T>
  title: string
}

interface SearchProps {
  onChange?: (searchValue: string) => void
  placeholder?: string
}

export const ReactComposedTable = <T,>({
  createText = 'Create',
  handleCreate,
  isSearching = false,
  noDataConfig,
  noSearchConfig,
  searchConfig,
  tableConfig,
  title
}: ReactComposedTableProps<T>) => {
  if (
    tableConfig.dataSource === undefined ||
    (tableConfig.dataSource.length === 0 && !isSearching)
  ) {
    return <ReactResult {...noDataConfig} />
  }

  return (
    <>
      <Space align="center" size="large" style={{ justifyContent: 'center', margin: '2.5% 0' }}>
        <Typography.Title level={2} style={{ margin: '0' }}>
          {title}
        </Typography.Title>
        <Button onClick={handleCreate} type="primary">
          {createText}
        </Button>
        <Input
          disabled={false}
          onChange={searchEvent => {
            if (searchConfig.onChange) {
              searchConfig.onChange(searchEvent.target.value)
            }
          }}
          placeholder={searchConfig.placeholder}
        />
      </Space>

      {tableConfig.dataSource.length > 0 ? (
        <Table {...tableConfig} />
      ) : (
        <ReactResult {...(noSearchConfig ?? noDataConfig)} />
      )}
    </>
  )
}

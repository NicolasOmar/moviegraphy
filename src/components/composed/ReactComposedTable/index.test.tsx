import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ReactComposedTable, type ReactComposedTableProps } from './index'

type RowModel = { id: string; name: string }

const columns = [{ dataIndex: 'name', title: 'Name' }]
const noDataConfig = { title: 'No rows yet' }
const noSearchConfig = { title: 'No matches for your search' }
const rows: RowModel[] = [{ id: '1', name: 'Sci-Fi' }]

const renderComposedTable = (overrides: Partial<ReactComposedTableProps<RowModel>> = {}) =>
  render(
    <ReactComposedTable
      handleCreate={vi.fn()}
      noDataConfig={noDataConfig}
      searchConfig={{}}
      tableConfig={{ columns, dataSource: rows }}
      title="Genres"
      {...overrides}
    />
  )

describe('ReactComposedTable', () => {
  it('renders the empty state when dataSource is undefined', () => {
    renderComposedTable({ tableConfig: { columns } })

    expect(screen.getByText('No rows yet')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders the empty state when dataSource is an empty array and not searching', () => {
    renderComposedTable({ tableConfig: { columns, dataSource: [] } })

    expect(screen.getByText('No rows yet')).toBeInTheDocument()
  })

  it('renders the title, create button and table rows when data is present', () => {
    renderComposedTable()

    expect(screen.getByRole('heading', { name: 'Genres' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
  })

  it('calls handleCreate when the create button is clicked, using the given createText as its label', async () => {
    const user = userEvent.setup()
    const handleCreate = vi.fn()
    renderComposedTable({ createText: 'New genre', handleCreate })

    await user.click(screen.getByRole('button', { name: 'New genre' }))

    expect(handleCreate).toHaveBeenCalledTimes(1)
  })

  it('shows the no-search-results state when isSearching is true and dataSource is empty', () => {
    renderComposedTable({
      isSearching: true,
      noSearchConfig,
      tableConfig: { columns, dataSource: [] }
    })

    expect(screen.getByText('No matches for your search')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('falls back to noDataConfig when searching with no results and noSearchConfig is omitted', () => {
    renderComposedTable({ isSearching: true, tableConfig: { columns, dataSource: [] } })

    expect(screen.getByText('No rows yet')).toBeInTheDocument()
  })

  it('forwards the typed value to searchConfig.onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderComposedTable({ searchConfig: { onChange, placeholder: 'Search by name' } })

    await user.type(screen.getByPlaceholderText('Search by name'), 'Sci')

    expect(onChange).toHaveBeenCalledWith('S')
    expect(onChange).toHaveBeenLastCalledWith('Sci')
  })

  it('does not throw when the search input changes and searchConfig.onChange is omitted', async () => {
    const user = userEvent.setup()
    renderComposedTable()

    await user.type(screen.getByRole('textbox'), 'Sci')

    expect(screen.getByRole('textbox')).toHaveValue('Sci')
  })
})

import { render, screen } from '@testing-library/react'
import { movieMocks } from '@ts/mocks'
import { describe, expect, it } from 'vitest'

import { ReactTable } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

describe('ReactTable', () => {
  it('renders nothing when dataSource is empty or undefined', () => {
    const { container: emptyContainer } = render(<ReactTable columns={columns} dataSource={[]} />)
    expect(emptyContainer).toBeEmptyDOMElement()

    const { container: undefinedContainer } = render(<ReactTable columns={columns} />)
    expect(undefinedContainer).toBeEmptyDOMElement()
  })

  it('renders an antd Table with one row per dataSource entry', () => {
    render(<ReactTable columns={columns} dataSource={movieMocks} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    movieMocks.forEach(movie => {
      expect(screen.getByText(movie.name)).toBeInTheDocument()
    })
  })
})

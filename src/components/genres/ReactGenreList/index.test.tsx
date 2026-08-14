import { $contextGenreList } from '@store/genres'
import { render, screen, waitFor } from '@testing-library/react'
import { genreMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it } from 'vitest'

import { ReactGenreList } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

beforeEach(() => {
  $contextGenreList.set([])
})

describe('ReactGenreList', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(<ReactGenreList columns={columns} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextGenreList.get()).toEqual([])
  })

  it('renders one row per genre in dataSource and stores it on context', async () => {
    render(<ReactGenreList columns={columns} dataSource={genreMocks} />)

    await waitFor(() => {
      genreMocks.forEach(genre => expect(screen.getByText(genre.name)).toBeInTheDocument())
    })
    expect($contextGenreList.get()).toEqual(genreMocks)
  })
})

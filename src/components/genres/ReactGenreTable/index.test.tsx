import { $contextGenreList, $contextSelectedGenre } from '@store/genres'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { genreMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it } from 'vitest'

import { ReactGenreTable } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

beforeEach(() => {
  $contextGenreList.set([])
  $contextSelectedGenre.set(null)
})

describe('ReactGenreTable', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(<ReactGenreTable columns={columns} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextGenreList.get()).toEqual([])
  })

  it('renders one row per genre in dataSource and stores it on context', async () => {
    render(<ReactGenreTable columns={columns} dataSource={genreMocks} />)

    await waitFor(() => {
      genreMocks.forEach(genre => expect(screen.getByText(genre.name)).toBeInTheDocument())
    })
    expect($contextGenreList.get()).toEqual(genreMocks)
  })

  it('selects a genre for editing when its edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReactGenreTable columns={columns} dataSource={genreMocks} />)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    expect($contextSelectedGenre.get()).toEqual(genreMocks[0])
  })
})

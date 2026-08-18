import { $contextGenreList, $contextSelectedGenre } from '@store/genres'
import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactGenreTable } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

beforeEach(() => {
  $contextGenreList.set([])
  $contextSelectedGenre.set(null)
  $globalNotifications.set(null)
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: 'Success!' }), { status: 200 }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
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

  it('deletes a genre via a DELETE request and clears the selection', async () => {
    const user = userEvent.setup()
    render(<ReactGenreTable columns={columns} dataSource={genreMocks} />)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'DELETE' })
      )
    )
    expect($contextSelectedGenre.get()).toBeNull()
  })

  it('shows an error message and keeps the genre in the list when deletion fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Genre is referenced elsewhere' }), { status: 409 })
    )
    render(<ReactGenreTable columns={columns} dataSource={genreMocks} />)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Genre is referenced elsewhere',
        type: 'error'
      })
    )
    expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument()
  })
})

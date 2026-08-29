import { $contextGenreList, $contextSelectedGenre } from '@store/genres'
import { $globalLoading } from '@store/loading'
import { $globalConfirmModal } from '@store/modals'
import { $globalNotifications } from '@store/notifications'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactGenreTable } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

beforeEach(() => {
  $contextGenreList.set([])
  $globalLoading.set(false)
  $contextSelectedGenre.set(null)
  $globalConfirmModal.set(null)
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

  it('opens a confirmation modal before deleting a genre with related movies, deleting it once confirmed', async () => {
    const user = userEvent.setup()
    const genreWithMovies = { ...genreMocks[0], moviesAmount: 3 }
    render(<ReactGenreTable columns={columns} dataSource={[genreWithMovies]} />)
    await waitFor(() => expect(screen.getByText(genreWithMovies.name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() => expect($globalConfirmModal.get()).not.toBeNull())
    expect($globalConfirmModal.get()?.content).toBe(
      "The genre 'Sci-Fi' has 3 movies registered, are you sure you want to delete the genre anyways?"
    )
    expect(fetch).not.toHaveBeenCalled()
    expect($globalLoading.get()).toBe(true)

    act(() => {
      $globalConfirmModal.get()?.onOk?.()
    })

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'DELETE' })
      )
    )
    expect($contextSelectedGenre.get()).toBeNull()
    await waitFor(() => expect($globalLoading.get()).toBe(false))
  })

  it('stays in a loading state while the deletion is still awaiting confirmation, clearing it if cancelled', async () => {
    const user = userEvent.setup()
    const genreWithMovies = { ...genreMocks[0], moviesAmount: 3 }
    render(<ReactGenreTable columns={columns} dataSource={[genreWithMovies]} />)
    await waitFor(() => expect(screen.getByText(genreWithMovies.name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() => expect($globalConfirmModal.get()).not.toBeNull())
    expect($globalLoading.get()).toBe(true)

    act(() => {
      $globalConfirmModal.get()?.onCancel?.()
    })

    expect(fetch).not.toHaveBeenCalled()
    await waitFor(() => expect($globalLoading.get()).toBe(false))
  })
})

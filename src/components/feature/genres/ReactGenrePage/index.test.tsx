import { ReactModalForm } from '@composed-components/ReactModalForm'
import { $contextGenreList, $contextSelectedGenre } from '@store/genres'
import { $globalLoading } from '@store/loading'
import { $globalConfirmModal, $globalFormModal } from '@store/modals'
import { $globalNotifications } from '@store/notifications'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS, COMMON_ERROR_MESSAGES } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactGenrePage } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

const renderGenrePage = (dataSource?: typeof genreMocks) =>
  render(
    <>
      <ReactGenrePage columns={columns} dataSource={dataSource} />
      <ReactModalForm />
    </>
  )

beforeEach(() => {
  $contextGenreList.set([])
  $globalLoading.set(false)
  $contextSelectedGenre.set(null)
  $globalConfirmModal.set(null)
  $globalFormModal.set(null)
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

describe('ReactGenrePage', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(<ReactGenrePage columns={columns} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextGenreList.get()).toEqual([])
  })

  it('renders one row per genre in dataSource and stores it on context', async () => {
    render(<ReactGenrePage columns={columns} dataSource={genreMocks} />)

    await waitFor(() => {
      genreMocks.forEach(genre => expect(screen.getByText(genre.name)).toBeInTheDocument())
    })
    expect($contextGenreList.get()).toEqual(genreMocks)
  })

  it('selects a genre for editing when its edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReactGenrePage columns={columns} dataSource={genreMocks} />)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    expect($contextSelectedGenre.get()).toEqual(genreMocks[0])
  })

  it('deletes a genre via a DELETE request and clears the selection', async () => {
    const user = userEvent.setup()
    render(<ReactGenrePage columns={columns} dataSource={genreMocks} />)
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
    render(<ReactGenrePage columns={columns} dataSource={genreMocks} />)
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
    render(<ReactGenrePage columns={columns} dataSource={[genreWithMovies]} />)
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
    render(<ReactGenrePage columns={columns} dataSource={[genreWithMovies]} />)
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

  it('filters the list by the search input and shows the no-search-results message when nothing matches', async () => {
    const user = userEvent.setup()
    render(<ReactGenrePage columns={columns} dataSource={genreMocks} />)
    await waitFor(() => expect(screen.getByText('Sci-Fi')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox'), 'Com')

    expect(screen.getByText('Comedy')).toBeInTheDocument()
    expect(screen.queryByText('Sci-Fi')).not.toBeInTheDocument()

    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'nonexistent genre')

    expect(
      screen.getByText('There are no registered genres based on your search')
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('creates a genre via a POST request and adds it to the list', async () => {
    const user = userEvent.setup()
    const newGenre = { id: 'new-genre-id', name: 'Horror', userId: 'user-1' }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: newGenre }), { status: 200 })
    )
    renderGenrePage(genreMocks)
    await waitFor(() => expect(screen.getByText('Sci-Fi')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Genre' }))
    await user.type(await screen.findByLabelText('Name'), 'Horror')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() => expect(screen.getByText('Horror')).toBeInTheDocument())
    expect($globalNotifications.get()).toEqual({ content: 'Genre created', type: 'success' })
  })

  it('shows an error notification and does not touch the list when genre creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'A genre with this name already exists' }), {
        status: 409
      })
    )
    renderGenrePage(genreMocks)
    await waitFor(() => expect(screen.getByText('Sci-Fi')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Genre' }))
    await user.type(await screen.findByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'A genre with this name already exists',
        type: 'error'
      })
    )
    expect($contextGenreList.get()).toEqual(genreMocks)
  })

  it('updates a genre via a PATCH request, replacing it in the list and clearing the selection', async () => {
    const user = userEvent.setup()
    renderGenrePage(genreMocks)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    const nameField = await screen.findByLabelText('Name')
    await waitFor(() => expect(nameField).toHaveValue(genreMocks[0].name))
    await user.clear(nameField)
    await user.type(nameField, 'Sci-Fi Updated')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    await waitFor(() => expect(screen.getByText('Sci-Fi Updated')).toBeInTheDocument())
    expect($contextSelectedGenre.get()).toBeNull()
    expect($globalNotifications.get()).toEqual({
      content: "Genre 'Sci-Fi Updated' updated",
      type: 'success'
    })
  })

  it('shows an error notification and keeps the original genre when updating fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'A genre with this name already exists' }), {
        status: 409
      })
    )
    renderGenrePage(genreMocks)
    await waitFor(() => expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    const nameField = await screen.findByLabelText('Name')
    await waitFor(() => expect(nameField).toHaveValue(genreMocks[0].name))
    await user.clear(nameField)
    await user.type(nameField, 'Comedy')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'A genre with this name already exists',
        type: 'error'
      })
    )
    expect(screen.getByText(genreMocks[0].name)).toBeInTheDocument()
  })

  it('shows a form-error notification when the create form is submitted with an empty name', async () => {
    const user = userEvent.setup()
    renderGenrePage(genreMocks)
    await waitFor(() => expect(screen.getByText('Sci-Fi')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Genre' }))
    await screen.findByLabelText('Name')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: COMMON_ERROR_MESSAGES.FORM_ERRORS,
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})

import { ReactModalForm } from '@composed-components/ReactModalForm'
import { ReactModalView } from '@composed-components/ReactModalView'
import { $globalFormModal, $globalViewModal } from '@store/modals'
import { $contextMovieList, $contextSelectedMovie } from '@store/movies'
import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS, COMMON_LABELS } from '@ts/constants'
import { genreMocks, movieMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactMoviePage } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

const renderMoviePage = (dataSource?: typeof movieMocks) =>
  render(
    <>
      <ReactMoviePage columns={columns} dataSource={dataSource} genreList={genreMocks} />
      <ReactModalForm />
      <ReactModalView />
    </>
  )

beforeEach(() => {
  $contextMovieList.set([])
  $contextSelectedMovie.set(null)
  $globalFormModal.set(null)
  $globalViewModal.set(null)
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

describe('ReactMoviePage', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(<ReactMoviePage columns={columns} genreList={genreMocks} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextMovieList.get()).toEqual([])
  })

  it('renders one row per movie in dataSource and stores it on context', async () => {
    renderMoviePage(movieMocks)

    await waitFor(() => {
      movieMocks.forEach(movie => expect(screen.getByText(movie.name)).toBeInTheDocument())
    })
    expect($contextMovieList.get()).toEqual(movieMocks)
  })

  it('opens the view modal with the movie details when the view button is clicked', async () => {
    const user = userEvent.setup()
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const viewButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.VIEW })
    await user.click(viewButton)

    const modal = screen.getByRole('dialog')
    expect(within(modal).getByText(movieMocks[0].name)).toBeInTheDocument()
  })

  it('filters the list by the search input and shows the no-search-results message when nothing matches', async () => {
    const user = userEvent.setup()
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    await user.type(screen.getByRole('textbox'), 'Amelie')

    expect(screen.getByText('Amelie')).toBeInTheDocument()
    expect(screen.queryByText('The Matrix')).not.toBeInTheDocument()

    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'nonexistent movie')

    expect(
      screen.getByText('There are no registered movies based on your search')
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('creates a movie via a POST request and adds it to the list', async () => {
    const user = userEvent.setup()
    const newMovie = { ...movieMocks[0], id: 'new-movie-id', name: 'John Wick' }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: newMovie }), { status: 200 })
    )
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Movie' }))
    await user.type(await screen.findByLabelText('Name'), 'John Wick')
    await user.type(screen.getByLabelText('Year of release'), '2014')
    await user.type(screen.getByLabelText('Country'), 'USA')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() => expect(screen.getByText('John Wick')).toBeInTheDocument())
    expect($globalNotifications.get()).toEqual({ content: 'Movie created', type: 'success' })
  })

  it('shows an error notification and does not touch the list when movie creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'A movie with this name already exists' }), {
        status: 409
      })
    )
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Movie' }))
    await user.type(await screen.findByLabelText('Name'), 'The Matrix')
    await user.type(screen.getByLabelText('Year of release'), '1999')
    await user.type(screen.getByLabelText('Country'), 'USA')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'A movie with this name already exists',
        type: 'error'
      })
    )
    expect($contextMovieList.get()).toEqual(movieMocks)
  })

  it('updates a movie via a GET-then-PATCH flow, replacing it in the list', async () => {
    const user = userEvent.setup()
    const movieToUpdate = { ...movieMocks[0], genres: [] }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: movieToUpdate }), { status: 200 })
    )
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const editButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.EDIT })
    await user.click(editButton)

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `${API_URLS.MOVIES}/${movieMocks[0].id}`,
        expect.objectContaining({ method: 'GET' })
      )
    )
    const nameField = await screen.findByLabelText('Name')
    await waitFor(() => expect(nameField).toHaveValue(movieMocks[0].name))
    await user.clear(nameField)
    await user.type(nameField, 'The Matrix Updated')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    await waitFor(() => expect(screen.getByText('The Matrix Updated')).toBeInTheDocument())
    expect($globalNotifications.get()).toEqual({
      content: "Movie 'The Matrix Updated' updated",
      type: 'success'
    })
  })

  it('shows an error notification when fetching the movie to edit fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Movie not found' }), { status: 404 })
    )
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const editButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.EDIT })
    await user.click(editButton)

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Movie not found', type: 'error' })
    )
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
  })

  it('deletes a movie via a DELETE request and removes it from the list', async () => {
    const user = userEvent.setup()
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const deleteButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.DELETE })
    await user.click(deleteButton)

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'DELETE' })
      )
    )
    await waitFor(() => expect(screen.queryByText(movieMocks[0].name)).not.toBeInTheDocument())
    expect($globalNotifications.get()).toEqual({ content: 'Movie deleted', type: 'success' })
  })

  it('shows an error notification and keeps the movie in the list when deletion fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Movie is referenced elsewhere' }), { status: 409 })
    )
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const deleteButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.DELETE })
    await user.click(deleteButton)

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Movie is referenced elsewhere',
        type: 'error'
      })
    )
    expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument()
  })

  it('shows a form-error notification when the create form is submitted with an empty name', async () => {
    const user = userEvent.setup()
    renderMoviePage(movieMocks)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Movie' }))
    await screen.findByLabelText('Name')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})

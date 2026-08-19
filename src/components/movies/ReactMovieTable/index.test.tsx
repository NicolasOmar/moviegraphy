import { $contextMovieList, $contextSelectedMovie } from '@store/movies'
import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { movieMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactMovieTable } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

beforeEach(() => {
  $contextMovieList.set([])
  $contextSelectedMovie.set(null)
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

describe('ReactMovieTable', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(<ReactMovieTable columns={columns} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextMovieList.get()).toEqual([])
  })

  it('renders one row per movie in dataSource', async () => {
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)

    await waitFor(() => {
      movieMocks.forEach(movie => expect(screen.getByText(movie.name)).toBeInTheDocument())
    })
  })

  it('filters rows by the search input, and renders nothing when no movie matches', async () => {
    const user = userEvent.setup()
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)
    await waitFor(() => expect(screen.getByText('Amelie')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox'), 'Matrix')

    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('The Matrix Reloaded')).toBeInTheDocument()
    expect(screen.queryByText('Amelie')).not.toBeInTheDocument()

    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'nonexistent movie title')

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('fetches the full movie with its genres and selects it for editing when its edit button is clicked', async () => {
    const user = userEvent.setup()
    const movieWithGenres = { ...movieMocks[0], genres: [] }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: movieWithGenres }), { status: 200 })
    )
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `${API_URLS.MOVIES}/${movieMocks[0].id}`,
        expect.objectContaining({ method: 'GET' })
      )
    )
    expect($contextSelectedMovie.get()).toEqual(movieWithGenres)
  })

  it('shows an error message and never selects a movie for editing when the GET request fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Movie not found' }), { status: 404 })
    )
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [editButton] = within(firstRow).getAllByRole('button')
    await user.click(editButton)

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Movie not found', type: 'error' })
    )
    expect($contextSelectedMovie.get()).toBeNull()
  })

  it('deletes a movie via a DELETE request and clears the selection', async () => {
    const user = userEvent.setup()
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'DELETE' })
      )
    )
    expect($contextSelectedMovie.get()).toBeNull()
  })

  it('shows an error message and keeps the movie in the list when deletion fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Movie is referenced elsewhere' }), { status: 409 })
    )
    render(<ReactMovieTable columns={columns} dataSource={movieMocks} />)
    await waitFor(() => expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const [, deleteButton] = within(firstRow).getAllByRole('button')
    await user.click(deleteButton)

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Movie is referenced elsewhere',
        type: 'error'
      })
    )
    expect(screen.getByText(movieMocks[0].name)).toBeInTheDocument()
  })
})

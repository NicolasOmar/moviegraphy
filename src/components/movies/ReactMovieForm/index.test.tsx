import { $contextMessageList } from '@store/messages'
import {
  $contextMovieList,
  $contextSelectedMovie,
  updateSelectedMovieOnContext
} from '@store/movies'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { movieMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactMovieForm } from './index'

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

beforeEach(() => {
  $contextMovieList.set([])
  $contextSelectedMovie.set(null)
  $contextMessageList.set(null)
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

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Name'), 'The Matrix')
  await user.type(screen.getByLabelText('Description'), 'A hacker learns the truth.')
  await user.clear(screen.getByLabelText('Year of release'))
  await user.type(screen.getByLabelText('Year of release'), '1999')
  await user.type(screen.getByLabelText('Country'), 'USA')
}

describe('ReactMovieForm', () => {
  it('creates a movie: submits a POST request, appends it to the movie list, and resets the form', async () => {
    const user = userEvent.setup()
    const createdMovie = {
      countryMade: 'USA',
      description: 'A hacker learns the truth.',
      id: 'fixed-test-id',
      name: 'The Matrix',
      releaseYear: '1999'
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: createdMovie }), { status: 200 })
    )
    render(<ReactMovieForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    expect($contextMovieList.get()).toEqual([createdMovie])
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue(''))
  })

  it('shows an error message and keeps the form filled when creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Name is required' }), { status: 400 })
    )
    render(<ReactMovieForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({ content: 'Name is required', type: 'error' })
    )
    expect($contextMovieList.get()).toEqual([])
    expect(screen.getByLabelText('Name')).toHaveValue('The Matrix')
  })

  it('updates a movie: pre-fills the form on selection, submits a PATCH request, updates the list, and clears the selection', async () => {
    const user = userEvent.setup()
    const [movieToEdit] = movieMocks
    render(<ReactMovieForm />)
    $contextMovieList.set([movieToEdit])

    act(() => {
      updateSelectedMovieOnContext(movieToEdit)
    })

    expect(await screen.findByLabelText('Name')).toHaveValue(movieToEdit.name)
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'The Matrix Resurrections')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.MOVIES,
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    expect($contextMovieList.get()).toEqual([{ ...movieToEdit, name: 'The Matrix Resurrections' }])
    expect($contextSelectedMovie.get()).toBeNull()
  })

  it('shows an error message and keeps the selection when an update fails', async () => {
    const user = userEvent.setup()
    const [movieToEdit] = movieMocks
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Update rejected' }), { status: 500 })
    )
    render(<ReactMovieForm />)
    $contextMovieList.set([movieToEdit])

    act(() => {
      updateSelectedMovieOnContext(movieToEdit)
    })

    expect(await screen.findByLabelText('Name')).toHaveValue(movieToEdit.name)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({ content: 'Update rejected', type: 'error' })
    )
    expect($contextMovieList.get()).toEqual([movieToEdit])
    expect($contextSelectedMovie.get()).toEqual(movieToEdit)
  })

  it('shows a generic invalidation message and never calls fetch when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<ReactMovieForm />)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})

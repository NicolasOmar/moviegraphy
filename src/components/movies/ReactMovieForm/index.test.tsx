import {
  $contextMovieList,
  $contextSelectedMovie,
  updateSelectedMovieOnContext
} from '@store/movie'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { movieMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactMovieForm } from './index'

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

beforeEach(() => {
  $contextMovieList.set([])
  $contextSelectedMovie.set(null)
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
    render(<ReactMovieForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/movie',
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    expect($contextMovieList.get()).toEqual([
      {
        countryMade: 'USA',
        description: 'A hacker learns the truth.',
        id: 'fixed-test-id',
        name: 'The Matrix',
        releaseYear: '1999'
      }
    ])
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue(''))
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
        '/api/movie',
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    expect($contextMovieList.get()).toEqual([{ ...movieToEdit, name: 'The Matrix Resurrections' }])
    expect($contextSelectedMovie.get()).toBeNull()
  })
})

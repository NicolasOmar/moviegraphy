import { $contextLoading } from '@store/loading'
import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { countryMocks, genderMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { actorFormTitle } from './configs'
import { ReactActorForm } from './index'

beforeEach(() => {
  $contextLoading.set(false)
  $globalNotifications.set(null)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
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

describe('ReactActorForm', () => {
  it('renders the form title', () => {
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    expect(screen.getByText(actorFormTitle)).toBeInTheDocument()
  })

  it('wires gender options from genderList onto the gender radio group', () => {
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    genderMocks.forEach(_gender => {
      expect(screen.getByRole('radio', { name: _gender.name })).toBeInTheDocument()
    })
  })

  it('wires country options from countryList onto the countries select', async () => {
    const user = userEvent.setup()
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    await user.click(screen.getByLabelText('Countries'))

    expect(await screen.findByText(countryMocks[0].name)).toBeInTheDocument()
    expect(screen.getByText(countryMocks[1].name)).toBeInTheDocument()
  })

  it('disables every field and the submit button while the global loading state is true', () => {
    $contextLoading.set(true)
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    expect(screen.getByLabelText('Name')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })

  it('creates an actor: submits a POST request and shows a success message', async () => {
    const user = userEvent.setup()
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    await user.type(screen.getByLabelText('Name'), 'Keanu')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.ACTORS,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Actor created', type: 'success' })
    )
  })

  it('shows an error message and keeps the form filled when creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Name already used' }), { status: 500 })
    )
    render(<ReactActorForm countryList={countryMocks} genderList={genderMocks} />)

    await user.type(screen.getByLabelText('Name'), 'Keanu')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Name already used', type: 'error' })
    )
    expect(screen.getByLabelText('Name')).toHaveValue('Keanu')
  })
})

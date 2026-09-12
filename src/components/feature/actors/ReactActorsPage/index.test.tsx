import { ReactModalForm } from '@composed-components/ReactModalForm'
import { ReactModalView } from '@composed-components/ReactModalView'
import { $contextActorList } from '@store/actors'
import { $globalLoading } from '@store/loading'
import { $globalFormModal, $globalViewModal } from '@store/modals'
import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS, COMMON_LABELS } from '@ts/constants'
import { actorMocks, countryMocks, genderMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactActorsPage } from './index'

const columns = [{ dataIndex: 'name', title: 'Name' }]

const renderActorsPage = (dataSource?: typeof actorMocks) =>
  render(
    <>
      <ReactActorsPage
        columns={columns}
        countryList={countryMocks}
        dataSource={dataSource}
        genderList={genderMocks}
      />
      <ReactModalForm />
      <ReactModalView />
    </>
  )

beforeEach(() => {
  $contextActorList.set([])
  $globalLoading.set(false)
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

describe('ReactActorsPage', () => {
  it('renders no rows when dataSource is omitted, defaulting the context list to an empty array', () => {
    render(
      <ReactActorsPage columns={columns} countryList={countryMocks} genderList={genderMocks} />
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect($contextActorList.get()).toEqual([])
  })

  it('renders one row per actor in dataSource and stores it on context', async () => {
    renderActorsPage(actorMocks)

    await waitFor(() => {
      actorMocks.forEach(actor => expect(screen.getByText(actor.name)).toBeInTheDocument())
    })
    expect($contextActorList.get()).toEqual(actorMocks)
  })

  it('opens the view modal with the actor details when the view button is clicked', async () => {
    const user = userEvent.setup()
    renderActorsPage(actorMocks)
    await waitFor(() => expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument())

    const [firstRow] = screen.getAllByRole('row').slice(1)
    const viewButton = within(firstRow).getByRole('button', { name: COMMON_LABELS.VIEW })
    await user.click(viewButton)

    expect($globalViewModal.get()?.content).toEqual(actorMocks[0])
  })

  it('filters the list by the search input and shows the no-search-results message when nothing matches', async () => {
    const user = userEvent.setup()
    renderActorsPage(actorMocks)
    await waitFor(() => expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument())

    await user.type(screen.getByRole('textbox'), actorMocks[0].name)

    expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument()
    expect(screen.queryByText(actorMocks[1].name)).not.toBeInTheDocument()

    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'nonexistent actor')

    expect(
      screen.getByText('There are no registered actors based on your search')
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('creates an actor via a POST request and shows a success notification', async () => {
    const user = userEvent.setup()
    renderActorsPage(actorMocks)
    await waitFor(() => expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Actor' }))
    await user.type(await screen.findByLabelText('Name'), 'Laurence')
    await user.type(screen.getByLabelText('Lastname'), 'Fishburne')
    await user.type(screen.getByLabelText('Born date'), '1961-07-30{enter}')
    await user.click(screen.getByRole('radio', { name: genderMocks[0].name }))
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByTitle(countryMocks[0].name))
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

  it('shows an error notification and does not close the form when actor creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'A actor with this name already exists' }), {
        status: 409
      })
    )
    renderActorsPage(actorMocks)
    await waitFor(() => expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Actor' }))
    await user.type(await screen.findByLabelText('Name'), 'Laurence')
    await user.type(screen.getByLabelText('Lastname'), 'Fishburne')
    await user.type(screen.getByLabelText('Born date'), '1961-07-30{enter}')
    await user.click(screen.getByRole('radio', { name: genderMocks[0].name }))
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByTitle(countryMocks[0].name))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'A actor with this name already exists',
        type: 'error'
      })
    )
    expect($contextActorList.get()).toEqual(actorMocks)
  })

  it('shows a form-error notification when the create form is submitted with an empty name', async () => {
    const user = userEvent.setup()
    renderActorsPage(actorMocks)
    await waitFor(() => expect(screen.getByText(actorMocks[0].name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Actor' }))
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

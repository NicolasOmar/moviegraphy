import { $globalViewModal, callViewModal } from '@store/modals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { ReactModalView } from './index'

beforeEach(() => {
  $globalViewModal.set(null)
})

describe('ReactModalView', () => {
  it('renders nothing when the view modal atom is null', () => {
    render(<ReactModalView />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the modal title and one row per key/value pair in content', () => {
    callViewModal({ content: { lastName: 'Reeves', name: 'Keanu' }, title: 'Actor details' })
    render(<ReactModalView />)

    expect(screen.getByText('Actor details')).toBeInTheDocument()
    expect(screen.getByText('name:')).toBeInTheDocument()
    expect(screen.getByText('Keanu')).toBeInTheDocument()
    expect(screen.getByText('lastName:')).toBeInTheDocument()
    expect(screen.getByText('Reeves')).toBeInTheDocument()
  })

  it('clears the view modal atom when the close button is clicked', async () => {
    const user = userEvent.setup()
    callViewModal({ content: { name: 'Sci-Fi' } })
    render(<ReactModalView />)

    await user.click(screen.getByRole('button', { name: 'Custom Close Button' }))

    expect($globalViewModal.get()).toBeNull()
  })
})

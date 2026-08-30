import { $globalConfirmModal } from '@store/modals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactModal } from './index'

beforeEach(() => {
  $globalConfirmModal.set(null)
})

describe('ReactModal', () => {
  it('renders nothing while there is no modal on context', () => {
    render(<ReactModal />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the modal title and content from context once it is set', () => {
    $globalConfirmModal.set({ content: 'Delete this genre?', title: 'Confirm deletion' })
    render(<ReactModal />)

    expect(screen.getByText('Confirm deletion')).toBeInTheDocument()
    expect(screen.getByText('Delete this genre?')).toBeInTheDocument()
  })

  it('calls onOk and clears the modal when the OK button is clicked', async () => {
    const user = userEvent.setup()
    const onOk = vi.fn()
    $globalConfirmModal.set({ content: 'Delete this genre?', onOk, title: 'Confirm deletion' })
    render(<ReactModal />)

    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect(onOk).toHaveBeenCalled()
    await waitFor(() => expect($globalConfirmModal.get()).toBeNull())
  })

  it('calls onCancel and clears the modal when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    $globalConfirmModal.set({ content: 'Delete this genre?', onCancel, title: 'Confirm deletion' })
    render(<ReactModal />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
    await waitFor(() => expect($globalConfirmModal.get()).toBeNull())
  })

  it('clears the modal on OK without throwing when no onOk callback was provided', async () => {
    const user = userEvent.setup()
    $globalConfirmModal.set({ content: 'Delete this genre?' })
    render(<ReactModal />)

    await user.click(screen.getByRole('button', { name: 'OK' }))

    await waitFor(() => expect($globalConfirmModal.get()).toBeNull())
  })

  it('clears the modal on Cancel without throwing when no onCancel callback was provided', async () => {
    const user = userEvent.setup()
    $globalConfirmModal.set({ content: 'Delete this genre?' })
    render(<ReactModal />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect($globalConfirmModal.get()).toBeNull())
  })
})

import { beforeEach, describe, expect, it } from 'vitest'

import { $globalConfirmModal, callConfirmModal, closeConfirmModal } from '../modals'

beforeEach(() => {
  $globalConfirmModal.set(null)
})

describe('callConfirmModal', () => {
  it('sets the modal atom with the given content', () => {
    callConfirmModal({ content: 'Are you sure?', title: 'Confirm deletion' })

    expect($globalConfirmModal.get()).toEqual({ content: 'Are you sure?', title: 'Confirm deletion' })
  })

  it('overwrites the previous modal when called again before it is closed', () => {
    callConfirmModal({ content: 'First' })
    callConfirmModal({ content: 'Second' })

    expect($globalConfirmModal.get()).toEqual({ content: 'Second' })
  })
})

describe('closeConfirmModal', () => {
  it('resets the modal atom to null', () => {
    callConfirmModal({ content: 'Are you sure?' })

    closeConfirmModal()

    expect($globalConfirmModal.get()).toBeNull()
  })
})

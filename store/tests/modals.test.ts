import { beforeEach, describe, expect, it } from 'vitest'

import { $globalModal, callModal, clearModal } from '../modals'

beforeEach(() => {
  $globalModal.set(null)
})

describe('callModal', () => {
  it('sets the modal atom with the given content', () => {
    callModal({ content: 'Are you sure?', title: 'Confirm deletion' })

    expect($globalModal.get()).toEqual({ content: 'Are you sure?', title: 'Confirm deletion' })
  })

  it('overwrites the previous modal when called again before it is closed', () => {
    callModal({ content: 'First' })
    callModal({ content: 'Second' })

    expect($globalModal.get()).toEqual({ content: 'Second' })
  })
})

describe('clearModal', () => {
  it('resets the modal atom to null', () => {
    callModal({ content: 'Are you sure?' })

    clearModal()

    expect($globalModal.get()).toBeNull()
  })
})

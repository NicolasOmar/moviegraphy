import { renderHook } from '@testing-library/react'
import { Form } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  $globalConfirmModal,
  $globalFormModal,
  $globalViewModal,
  callConfirmModal,
  callFormModal,
  callViewModal,
  clearFormModal,
  clearViewModal,
  closeConfirmModal
} from '../modals'

type TestFormValues = { name: string }

const buildFormModal = () => {
  const {
    result: {
      current: [formInstance]
    }
  } = renderHook(() => Form.useForm<TestFormValues>())

  return {
    form: { formInputs: [], formInstance, onSubmit: vi.fn() },
    title: 'Edit Name'
  }
}

beforeEach(() => {
  $globalConfirmModal.set(null)
  $globalFormModal.set(null)
  $globalViewModal.set(null)
})

describe('callConfirmModal', () => {
  it('sets the modal atom with the given content', () => {
    callConfirmModal({ content: 'Are you sure?', title: 'Confirm deletion' })

    expect($globalConfirmModal.get()).toEqual({
      content: 'Are you sure?',
      title: 'Confirm deletion'
    })
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

describe('callFormModal', () => {
  it('sets the form modal atom with the given form and title', () => {
    const formModal = buildFormModal()

    callFormModal<TestFormValues>(formModal)

    expect($globalFormModal.get()).toEqual(formModal)
  })

  it('overwrites the previous form modal when called again before it is cleared', () => {
    callFormModal<TestFormValues>(buildFormModal())
    const secondFormModal = buildFormModal()

    callFormModal<TestFormValues>(secondFormModal)

    expect($globalFormModal.get()).toEqual(secondFormModal)
  })
})

describe('clearFormModal', () => {
  it('resets the form modal atom to null', () => {
    callFormModal<TestFormValues>(buildFormModal())

    clearFormModal()

    expect($globalFormModal.get()).toBeNull()
  })
})

describe('callViewModal', () => {
  it('sets the view modal atom with the given content', () => {
    callViewModal({ content: { name: 'Sci-Fi' }, title: 'Genre details' })

    expect($globalViewModal.get()).toEqual({ content: { name: 'Sci-Fi' }, title: 'Genre details' })
  })

  it('overwrites the previous view modal when called again before it is cleared', () => {
    callViewModal({ content: { name: 'First' } })
    callViewModal({ content: { name: 'Second' } })

    expect($globalViewModal.get()).toEqual({ content: { name: 'Second' } })
  })
})

describe('clearViewModal', () => {
  it('resets the view modal atom to null', () => {
    callViewModal({ content: { name: 'Sci-Fi' } })

    clearViewModal()

    expect($globalViewModal.get()).toBeNull()
  })
})

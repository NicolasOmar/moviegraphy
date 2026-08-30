import { renderHook } from '@testing-library/react'
import { Form } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  $globalConfirmModal,
  $globalFormModal,
  callConfirmModal,
  callFormModal,
  clearFormModal,
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

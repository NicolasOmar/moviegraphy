import { $contextNotifications } from '@store/notifications'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactNotifications } from './index'

const successSpy = vi.fn()
const errorSpy = vi.fn()

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>()

  return {
    ...actual,
    notification: {
      ...actual.notification,
      useNotification: () => [
        { ...actual.notification, error: errorSpy, success: successSpy },
        <div key="holder" />
      ]
    }
  }
})

beforeEach(() => {
  $contextNotifications.set(null)
  successSpy.mockClear()
  errorSpy.mockClear()
})

describe('ReactNotifications', () => {
  it('routes each context message to the antd notification method matching its type, mapping content to description', () => {
    render(<ReactNotifications />)

    act(() => {
      $contextNotifications.set({ content: 'Movie created', type: 'success' })
    })
    expect(successSpy).toHaveBeenCalledWith({ description: 'Movie created', title: '' })

    act(() => {
      $contextNotifications.set({ content: 'Movie is referenced elsewhere', type: 'error' })
    })
    expect(errorSpy).toHaveBeenCalledWith({
      description: 'Movie is referenced elsewhere',
      title: ''
    })
  })

  it('does not open any toast while the context message is null', () => {
    render(<ReactNotifications />)

    expect(successSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})

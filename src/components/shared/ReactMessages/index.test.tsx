import { $contextMessageList } from '@store/messages'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactMessages } from './index'

const openSpy = vi.fn()

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>()

  return {
    ...actual,
    message: {
      ...actual.message,
      useMessage: () => [{ ...actual.message, open: openSpy }, <div key="holder" />]
    }
  }
})

beforeEach(() => {
  $contextMessageList.set(null)
  openSpy.mockClear()
})

describe('ReactMessages', () => {
  it('opens a toast when a message is pushed to the context', () => {
    render(<ReactMessages />)

    act(() => {
      $contextMessageList.set({ content: 'Movie created', type: 'success' })
    })

    expect(openSpy).toHaveBeenCalledWith({ content: 'Movie created', type: 'success' })
  })

  it('does not open a toast while the context message is null', () => {
    render(<ReactMessages />)

    expect(openSpy).not.toHaveBeenCalled()
  })
})

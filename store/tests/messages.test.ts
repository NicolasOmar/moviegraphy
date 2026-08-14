import { beforeEach, describe, expect, it } from 'vitest'

import { $contextMessageList, addMessageToContext } from '../messages'

beforeEach(() => {
  $contextMessageList.set(null)
})

describe('addMessageToContext', () => {
  it('sets the message atom with the given message', () => {
    addMessageToContext({ content: 'Movie created', type: 'success' })

    expect($contextMessageList.get()).toEqual({ content: 'Movie created', type: 'success' })
  })

  it('overwrites the previous message when called again before it is consumed', () => {
    addMessageToContext({ content: 'First', type: 'info' })
    addMessageToContext({ content: 'Second', type: 'error' })

    expect($contextMessageList.get()).toEqual({ content: 'Second', type: 'error' })
  })
})

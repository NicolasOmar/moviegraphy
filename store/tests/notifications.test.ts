import { beforeEach, describe, expect, it } from 'vitest'

import { $contextNotifications, publishNotification } from '../notifications'

beforeEach(() => {
  $contextNotifications.set(null)
})

describe('publishNotification', () => {
  it('sets the message atom with the given message', () => {
    publishNotification({ content: 'Movie created', type: 'success' })

    expect($contextNotifications.get()).toEqual({ content: 'Movie created', type: 'success' })
  })

  it('overwrites the previous message when called again before it is consumed', () => {
    publishNotification({ content: 'First', type: 'info' })
    publishNotification({ content: 'Second', type: 'error' })

    expect($contextNotifications.get()).toEqual({ content: 'Second', type: 'error' })
  })
})

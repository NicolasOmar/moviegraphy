import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import '@testing-library/jest-dom/vitest'

afterEach(() => cleanup())

Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    addEventListener: () => undefined,
    addListener: () => undefined,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => undefined,
    removeListener: () => undefined
  }),
  writable: true
})

class ResizeObserverStub {
  disconnect() {
    return undefined
  }

  observe() {
    return undefined
  }

  unobserve() {
    return undefined
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverStub,
  writable: true
})

Element.prototype.scrollIntoView = () => undefined

import { beforeAll } from 'vitest'
import { JSDOM } from 'jsdom'
import { vi } from 'vitest'

beforeAll(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  
  // Make DOM globals available
  global.document = dom.window.document
  global.window = dom.window as any
  global.HTMLElement = dom.window.HTMLElement
  global.Element = dom.window.Element
})

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock chrome APIs
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
} as any
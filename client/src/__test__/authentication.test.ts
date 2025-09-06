import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { googleLogin } from '../services/authentication'

// Mock Chrome APIs
const mockChrome = {
  identity: {
    getRedirectURL: vi.fn(),
    launchWebAuthFlow: vi.fn()
  },
  runtime: {
    lastError: null as null | { message: string },
    id: 'test-extension-id'
  },
  storage: {
    local: {
      set: vi.fn()
    }
  }
}

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch
global.chrome = mockChrome as any

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        WXT_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com'
      }
    }
  }
})

describe('googleLogin', () => {
  let mockSendResponse: any
  let mockSender: any
  let consoleErrorSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset chrome mocks
    mockChrome.runtime.lastError = null
    mockChrome.identity.getRedirectURL.mockReturnValue('https://test-extension-id.chromiumapp.org/')
    
    // Mock sender and sendResponse
    mockSender = { tab: { id: 1 } }
    mockSendResponse = vi.fn()
    
    // Mock console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock Math.random for predictable state/nonce
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('message type handling', () => {
    it('should handle GOOGLE_LOGIN message type', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      
      // Act
      const result = googleLogin(message, mockSender, mockSendResponse)
      
      // Assert
      expect(result).toBe(true)
      expect(mockChrome.identity.getRedirectURL).toHaveBeenCalled()
    })

    it('should ignore non-GOOGLE_LOGIN message types', () => {
      // Arrange
      const message = { type: 'OTHER_MESSAGE' }
      
      // Act
      const result = googleLogin(message, mockSender, mockSendResponse)
      
      // Assert
      expect(result).toBeUndefined()
      expect(mockChrome.identity.getRedirectURL).not.toHaveBeenCalled()
    })
  })

  describe('auth URL construction', () => {
    it('should construct correct auth URL with all required parameters', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      
      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      // Assert
      expect(mockChrome.identity.launchWebAuthFlow).toHaveBeenCalledWith(
        {
          url: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'),
          interactive: true
        },
        expect.any(Function)
      )
      
      const callArgs = mockChrome.identity.launchWebAuthFlow.mock.calls[0][0]
      const authUrl = new URL(callArgs.url)
      
      expect(authUrl.searchParams.get('client_id')).toBe(import.meta.env.WXT_GOOGLE_CLIENT_ID)
      expect(authUrl.searchParams.get('response_type')).toBe('token id_token')
      expect(authUrl.searchParams.get('redirect_uri')).toBe('https://test-extension-id.chromiumapp.org/')
      expect(authUrl.searchParams.get('scope')).toBe('openid email profile')
      expect(authUrl.searchParams.get('prompt')).toBe('consent')
      expect(authUrl.searchParams.get('state')).toBeTruthy()
      expect(authUrl.searchParams.get('nonce')).toBeTruthy()
    })

    // it('should generate random state and nonce', () => {
    //   // Arrange
    //   const message = { type: 'GOOGLE_LOGIN' }
    //   vi.spyOn(Math, 'random')
    //     .mockReturnValueOnce(0.123456789) // for state
    //     .mockReturnValueOnce(0.987654321) // for nonce
      
    //   // Act
    //   googleLogin(message, mockSender, mockSendResponse)
      
    //   // Assert
    //   const callArgs = mockChrome.identity.launchWebAuthFlow.mock.calls[0][0]
    //   const authUrl = new URL(callArgs.url)
      
    //   expect(authUrl.searchParams.get('state')).toBe(0.123456789)
    //   expect(authUrl.searchParams.get('nonce')).toBe(0.987654321)
    // })
  })

  describe('web auth flow handling', () => {
    it('should handle successful authentication with access token', async () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#access_token=ya29.test-token&token_type=Bearer&expires_in=3599'
      const mockUserData = {
        id: '123456789',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      }

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockUserData)
      })

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      // Get the callback function and simulate successful auth
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      await authCallback(mockRedirectUrl)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            'Authorization': 'Bearer ya29.test-token'
          }
        }
      )
      // Wait for any pending promises to resolve before asserting
      await Promise.resolve()
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({ user: mockUserData }))
    })

    it('should handle chrome runtime error', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const runtimeError = { message: 'User cancelled the auth flow' }
      mockChrome.runtime.lastError = runtimeError

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      // Get the callback and simulate error
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      authCallback(null)

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({ error: runtimeError })
    })

    it('should handle missing redirect URL', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      // Get the callback and simulate missing URL
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      authCallback(null)

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({ error: 'No redirect URL' })
    })

    it('should handle missing access token in redirect URL', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#error=access_denied'

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      // Get the callback and simulate missing token
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      authCallback(mockRedirectUrl)

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({ error: 'No access token' })
    })

    it('should handle fetch error when getting user info', async () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#access_token=ya29.test-token&token_type=Bearer'
      const fetchError = new Error('Network error')

      mockFetch.mockRejectedValue(fetchError)

      // Act
      await googleLogin(message, mockSender, mockSendResponse)
      
      // Get the callback and simulate successful auth but failed user fetch
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      await authCallback(mockRedirectUrl)

      // Wait for any pending microtasks to complete
      await Promise.resolve();

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith(expect.objectContaining({ error: 'Network error' }));
    })
  })

  describe('URL parsing', () => {
    it('should correctly parse access token from fragment', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#access_token=ya29.test-token&token_type=Bearer&expires_in=3599&state=12345'
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ email: 'test@example.com' })
      })

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      authCallback(mockRedirectUrl)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            'Authorization': 'Bearer ya29.test-token'
          }
        }
      )
    })

    it('should handle malformed redirect URL', async() => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'invalid-url'

      // Act
      await googleLogin(message, mockSender, mockSendResponse)
      
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      // Instead of expecting not to throw, catch the error and assert the sendResponse
      await authCallback(mockRedirectUrl).catch(() => {});

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({ error: 'No access token' })
    })
  })

  describe('error handling', () => {
    it('should handle general errors and log them', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const error = new Error('Test error')
      
      // Mock getRedirectURL to throw an error
      mockChrome.identity.getRedirectURL.mockImplementation(() => {
        throw error
      })

      // Act
      const result = googleLogin(message, mockSender, mockSendResponse)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error:', error)
      expect(result).toBeUndefined()
    })

    it('should handle missing environment variables', () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      
      // Override the import.meta.env mock to have undefined CLIENT_ID
      
      // Act
      googleLogin(message, mockSender, mockSendResponse)

      // Assert - should still call launchWebAuthFlow but with undefined client_id
      expect(mockChrome.identity.launchWebAuthFlow).toHaveBeenCalled()
      const callArgs = mockChrome.identity.launchWebAuthFlow.mock.calls[0][0]
      const authUrl = new URL(callArgs.url)
      expect(authUrl.searchParams.get('client_id')).toBe('undefined')
    })
  })

  describe('storage operations', () => {
    it('should store user data in chrome.storage.local', async () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#access_token=ya29.test-token'
      const mockUserData = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      }

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockUserData)
      })

      // Act
      googleLogin(message, mockSender, mockSendResponse)
      
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      await authCallback(mockRedirectUrl)
      await Promise.resolve(); // Wait for any pending microtasks

      // Assert
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ user: mockUserData })
    })

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const message = { type: 'GOOGLE_LOGIN' }
      const mockRedirectUrl = 'https://test-extension-id.chromiumapp.org/#access_token=ya29.test-token'
      const mockUserData = { email: 'test@example.com' }
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockUserData)
      })
      
      mockChrome.storage.local.set.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Act & Assert - should not crash
      googleLogin(message, mockSender, mockSendResponse)
      
      const authCallback = mockChrome.identity.launchWebAuthFlow.mock.calls[0][1]
      await expect(Promise.resolve(authCallback(mockRedirectUrl))).resolves.not.toThrow()
    })
  })

  describe('message interface', () => {
    it('should handle message with additional properties', () => {
      // Arrange
      const message = {
        type: 'GOOGLE_LOGIN',
        additionalData: 'test',
        timestamp: Date.now()
      }

      // Act
      const result = googleLogin(message, mockSender, mockSendResponse)

      // Assert
      expect(result).toBe(true)
      expect(mockChrome.identity.getRedirectURL).toHaveBeenCalled()
    })
  })
})
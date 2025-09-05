import { apiClient } from '@/config/apiClient'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  describe('get', () => {
    it('makes successful GET request', async () => {
      const mockData = { id: 1, title: 'Test Recipe' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response)

      const result = await apiClient.get('/recipes')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recipes'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )

      expect(result).toEqual({
        data: mockData,
        status: 200,
      })
    })

    it('handles API errors', async () => {
      const errorMessage = 'Not Found'
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: errorMessage }),
      } as Response)

      const result = await apiClient.get('/recipes/999')

      expect(result).toEqual({
        error: errorMessage,
        status: 404,
        data: { detail: errorMessage },
      })
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await apiClient.get('/recipes')

      expect(result).toEqual({
        error: 'Network error',
        status: 0,
      })
    })
  })

  describe('post', () => {
    it('makes successful POST request with data', async () => {
      const requestData = { title: 'New Recipe', description: 'Test' }
      const responseData = { id: 1, ...requestData }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => responseData,
      } as Response)

      const result = await apiClient.post('/recipes', requestData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recipes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )

      expect(result).toEqual({
        data: responseData,
        status: 201,
      })
    })
  })

  describe('authentication', () => {
    it('includes authorization header when token exists', async () => {
      const mockToken = 'mock-jwt-token'
      const mockLocalStorage = window.localStorage as jest.Mocked<typeof window.localStorage>
      mockLocalStorage.getItem.mockReturnValue(mockToken)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response)

      await apiClient.get('/protected-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })
  })
})
import { logger } from '@/utils/logger'

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
}

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('logUserAction', () => {
    it('logs user action with user ID', () => {
      logger.logUserAction('login', { userId: 123 })
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('User Action: login'),
        expect.objectContaining({ userId: 123 })
      )
    })

    it('logs user action without user ID', () => {
      logger.logUserAction('view_recipe', { recipeId: 456 })
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('User Action: view_recipe'),
        expect.objectContaining({ recipeId: 456 })
      )
    })
  })

  describe('logApiCall', () => {
    it('logs successful API calls', () => {
      logger.logApiCall('GET', '/api/recipes', 200)
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('API Call: GET /api/recipes'),
        expect.objectContaining({ status: 200 })
      )
    })

    it('logs failed API calls with error', () => {
      const error = new Error('Network error')
      logger.logApiCall('POST', '/api/recipes', 500, error)
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('API Error: POST /api/recipes'),
        expect.objectContaining({ 
          status: 500,
          error: error.message
        })
      )
    })
  })

  describe('warn', () => {
    it('logs warning messages', () => {
      logger.warn('This is a warning', { context: 'test' })
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warning: This is a warning'),
        expect.objectContaining({ context: 'test' })
      )
    })
  })

  describe('debug', () => {
    it('logs debug messages', () => {
      logger.debug('Debug information', { debugData: 'test' })
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Debug: Debug information'),
        expect.objectContaining({ debugData: 'test' })
      )
    })
  })
})
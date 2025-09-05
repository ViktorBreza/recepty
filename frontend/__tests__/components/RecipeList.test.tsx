import { render, screen, waitFor } from '@testing-library/react'
import RecipeList from '@/components/RecipeList'
import { AuthContext } from '@/contexts/AuthContext'
import * as apiClient from '@/config/apiClient'

// Mock the API client
jest.mock('@/config/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    delete: jest.fn(),
  }
}))

const mockApiClient = apiClient.apiClient as jest.Mocked<typeof apiClient.apiClient>

const mockRecipes = [
  {
    id: 1,
    title: 'Test Recipe 1',
    description: 'A test recipe description',
    servings: 4,
    category: { id: 1, name: 'Test Category' },
    tags: [{ id: 1, name: 'Test Tag' }]
  },
  {
    id: 2,
    title: 'Test Recipe 2', 
    description: 'Another test recipe',
    servings: 2,
    category: { id: 2, name: 'Another Category' },
    tags: []
  }
]

const mockAuthContext = {
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  token: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
}

const AuthProvider = ({ children, value = mockAuthContext }: any) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
)

describe('RecipeList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <AuthProvider>
        <RecipeList />
      </AuthProvider>
    )

    expect(screen.getByText('Завантаження...')).toBeInTheDocument()
  })

  it('renders recipes when loaded', async () => {
    mockApiClient.get.mockResolvedValue({
      data: mockRecipes,
      status: 200
    })

    render(
      <AuthProvider>
        <RecipeList />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument()
      expect(screen.getByText('Test Recipe 2')).toBeInTheDocument()
    })

    expect(screen.getByText('Порцій: 4')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('Test Tag')).toBeInTheDocument()
  })

  it('renders empty state when no recipes', async () => {
    mockApiClient.get.mockResolvedValue({
      data: [],
      status: 200
    })

    render(
      <AuthProvider>
        <RecipeList />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Поки що рецептів немає')).toBeInTheDocument()
    })

    expect(screen.getByText('Будьте першим, хто поділиться смачним рецептом!')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    mockApiClient.get.mockResolvedValue({
      error: 'API Error',
      status: 500
    })

    render(
      <AuthProvider>
        <RecipeList />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('shows edit/delete buttons for authenticated users', async () => {
    mockApiClient.get.mockResolvedValue({
      data: mockRecipes,
      status: 200
    })

    const authenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', email: 'test@test.com' }
    }

    render(
      <AuthProvider value={authenticatedContext}>
        <RecipeList />
      </AuthProvider>
    )

    await waitFor(() => {
      const editButtons = screen.getAllByText('Редагувати')
      const deleteButtons = screen.getAllByText('Видалити')
      
      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })
  })
})
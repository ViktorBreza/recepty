import { render, screen } from '@testing-library/react'
import Navigation from '@/components/Navigation'
import { AuthContext } from '@/contexts/AuthContext'

// Mock AuthContext
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

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders navigation links', () => {
    render(
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    )

    expect(screen.getByText('Кіт Кухар')).toBeInTheDocument()
    expect(screen.getByText('Головна')).toBeInTheDocument()
    expect(screen.getByText('Рецепти')).toBeInTheDocument()
  })

  it('shows login/register links when not authenticated', () => {
    render(
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    )

    expect(screen.getByText('Вхід')).toBeInTheDocument()
    expect(screen.getByText('Реєстрація')).toBeInTheDocument()
    expect(screen.queryByText('Додати рецепт')).not.toBeInTheDocument()
  })

  it('shows authenticated user options when logged in', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', email: 'test@test.com' }
    }

    render(
      <AuthProvider value={authenticatedContext}>
        <Navigation />
      </AuthProvider>
    )

    expect(screen.getByText('Додати рецепт')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.queryByText('Вхід')).not.toBeInTheDocument()
  })

  it('shows admin options for admin users', () => {
    const adminContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      isAdmin: true,
      user: { id: 1, username: 'admin', email: 'admin@test.com' }
    }

    render(
      <AuthProvider value={adminContext}>
        <Navigation />
      </AuthProvider>
    )

    expect(screen.getByText('Категорії')).toBeInTheDocument()
    expect(screen.getByText('Теги')).toBeInTheDocument()
    expect(screen.getByText('Адмін')).toBeInTheDocument()
  })
})
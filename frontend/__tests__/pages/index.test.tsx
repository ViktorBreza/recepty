import { render, screen } from '@testing-library/react'
import HomePage from '@/pages/index'

// Mock Layout component
jest.mock('@/components/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('HomePage', () => {
  it('renders homepage content', () => {
    render(<HomePage />)

    expect(screen.getByText('Ласкаво просимо до Кіт Кухар!')).toBeInTheDocument()
    expect(screen.getByText(/Найкращі рецепти від нашого котика-кухаря!/)).toBeInTheDocument()
    expect(screen.getByText('Переглянути рецепти')).toBeInTheDocument()
  })

  it('renders mascot image', () => {
    render(<HomePage />)

    const mascotImage = screen.getByAltText('Маскот кіт-кухар')
    expect(mascotImage).toBeInTheDocument()
    expect(mascotImage).toHaveAttribute('src', '/maskot.svg')
  })

  it('has correct link to recipes page', () => {
    render(<HomePage />)

    const recipesLink = screen.getByText('Переглянути рецепти').closest('a')
    expect(recipesLink).toHaveAttribute('href', '/recipes')
  })

  it('applies correct styling classes', () => {
    render(<HomePage />)

    const heroButton = screen.getByText('Переглянути рецепти')
    expect(heroButton).toHaveClass('hero-button')
  })
})
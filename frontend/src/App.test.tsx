import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock AuthContext to avoid API calls in tests
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAuth = {
    user: null,
    token: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false
  };

  return (
    <div data-testid="auth-provider">
      {children}
    </div>
  );
};

jest.mock('./contexts/AuthContext', () => ({
  ...jest.requireActual('./contexts/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <MockAuthProvider>{children}</MockAuthProvider>
  ),
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  test('renders without crashing', () => {
    renderApp();
    expect(document.body).toBeInTheDocument();
  });

  test('renders navigation elements', () => {
    renderApp();
    
    // Check for common navigation elements
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThan(0);
  });

  test('renders main content area', () => {
    renderApp();
    
    // Should have some main content
    expect(document.querySelector('main') || document.querySelector('.container')).toBeInTheDocument();
  });
});
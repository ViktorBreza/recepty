import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch globally
global.fetch = jest.fn();

// Test component that uses AuthContext
const TestComponent: React.FC = () => {
  const { user, token, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'No user'}</div>
      <div data-testid="token">{token ? 'Has token' : 'No token'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear fetch mock
    (fetch as jest.Mock).mockClear();
  });

  test('provides initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
    
    // Should not be loading after initial render
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  test('loads token from localStorage', () => {
    const mockToken = 'test-token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('token')).toHaveTextContent('Has token');
  });

  test('handles missing localStorage gracefully', () => {
    // Mock localStorage to throw error
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => { throw new Error('localStorage not available'); }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    }).not.toThrow();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  test('auth context provides required methods', () => {
    const TestMethodsComponent: React.FC = () => {
      const { login, register, logout } = useAuth();
      
      return (
        <div>
          <div data-testid="has-login">{typeof login === 'function' ? 'Yes' : 'No'}</div>
          <div data-testid="has-register">{typeof register === 'function' ? 'Yes' : 'No'}</div>
          <div data-testid="has-logout">{typeof logout === 'function' ? 'Yes' : 'No'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestMethodsComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('has-login')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-register')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-logout')).toHaveTextContent('Yes');
  });
});
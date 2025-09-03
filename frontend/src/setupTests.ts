// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock API calls globally
beforeEach(() => {
  // Mock fetch if needed
  global.fetch = jest.fn();
  
  // Clear localStorage
  localStorage.clear();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple context tests without complex state management
describe('Context Pattern Tests', () => {
  test('React Context can be created and used', () => {
    interface TestContextType {
      value: string;
      setValue: (value: string) => void;
    }

    const TestContext = React.createContext<TestContextType | undefined>(undefined);

    const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [value, setValue] = React.useState('initial');
      
      return (
        <TestContext.Provider value={{ value, setValue }}>
          {children}
        </TestContext.Provider>
      );
    };

    const TestConsumer = () => {
      const context = React.useContext(TestContext);
      if (!context) return <div>No context</div>;
      
      return <div data-testid="context-value">{context.value}</div>;
    };

    render(
      <TestProvider>
        <TestConsumer />
      </TestProvider>
    );

    expect(screen.getByTestId('context-value')).toHaveTextContent('initial');
  });

  test('localStorage operations work in tests', () => {
    // Test localStorage basic operations
    localStorage.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');
    
    localStorage.removeItem('test-key');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  test('JSON operations work correctly', () => {
    const testObject = { id: 1, name: 'Test User', email: 'test@example.com' };
    const jsonString = JSON.stringify(testObject);
    const parsedObject = JSON.parse(jsonString);
    
    expect(parsedObject).toEqual(testObject);
    expect(parsedObject.name).toBe('Test User');
  });

  test('async operations can be tested', async () => {
    const asyncFunction = () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => resolve('completed'), 10);
      });
    };
    
    const result = await asyncFunction();
    expect(result).toBe('completed');
  });
});
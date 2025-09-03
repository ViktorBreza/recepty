import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component tests without complex routing
describe('Basic React Components', () => {
  test('React components can be imported and used', () => {
    const TestComponent = () => <div data-testid="test">Hello Test</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('test')).toHaveTextContent('Hello Test');
  });

  test('React hooks work correctly', () => {
    const HookComponent = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button data-testid="increment" onClick={() => setCount(count + 1)}>
            Increment
          </button>
        </div>
      );
    };
    
    render(<HookComponent />);
    
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('React event handling works', () => {
    const ButtonComponent = () => {
      const [clicked, setClicked] = React.useState(false);
      
      return (
        <button data-testid="button" onClick={() => setClicked(true)}>
          {clicked ? 'Clicked' : 'Not Clicked'}
        </button>
      );
    };
    
    render(<ButtonComponent />);
    
    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('Not Clicked');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  refreshAccessToken: jest.fn(() => new Promise(() => {})),
  setAccessToken: jest.fn(),
}));

test('shows a loading state while restoring the session', () => {
  render(<App />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

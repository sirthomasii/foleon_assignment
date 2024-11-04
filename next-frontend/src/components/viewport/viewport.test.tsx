import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Viewport } from './viewport';

describe('Viewport', () => {
  test('renders search input', () => {
    render(
      <Viewport
        authToken={null}
        initialPublication={null}
        identifierFilter={null}
        categoryFilter={null}
        dateFilter={[null, null]}
        onPublicationsChange={() => {}}
      />
    );
    expect(screen.getByPlaceholderText(/Search publications.../i)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  test('renders children correctly', () => {
    render(
      <MainLayout>
        <div>Test Child</div>
      </MainLayout>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('renders sidebar button', () => {
    render(
      <MainLayout>
        <div>Test Child</div>
      </MainLayout>
    );
    expect(screen.getByRole('button')).toBeInTheDocument(); // Button for toggling sidebar
  });
});
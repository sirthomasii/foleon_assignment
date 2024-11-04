import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from './sidebar';
import { Publication } from '../types/publication';

const mockPublications: Publication[] = [
  { id: 1, name: 'Publication 1', identifier: 'pub1', status: 'published', category: 'news', title: 'Title 1', uid: 'uid1', level: 'level1', is_visible: true, is_default: false, created_on: new Date().toISOString(), modified_on: new Date().toISOString(), affected_on: new Date().toISOString(), first_published_on: new Date().toISOString(), published_on: new Date().toISOString() },
  { id: 2, name: 'Publication 2', identifier: 'pub2', status: 'draft', category: 'tech', title: 'Title 2', uid: 'uid2', level: 'level2', is_visible: false, is_default: false, created_on: new Date().toISOString(), modified_on: new Date().toISOString(), affected_on: new Date().toISOString(), first_published_on: new Date().toISOString(), published_on: new Date().toISOString() },
];

describe('Sidebar', () => {
  test('renders publication filters', () => {
    render(
      <Sidebar
        publications={mockPublications}
        identifierFilter={null}
        categoryFilter={null}
        dateFilter={[null, null]}
        onIdentifierChange={() => {}}
        onCategoryChange={() => {}}
        onDateChange={() => {}}
      />
    );
    expect(screen.getByLabelText(/Identifier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });
});
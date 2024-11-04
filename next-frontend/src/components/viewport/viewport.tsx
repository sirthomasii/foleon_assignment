import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Card, Text, Group, Pagination } from '@mantine/core';
import axios from 'axios';
import qs from 'qs';
import { Publication } from '../types/publication';

interface ViewportProps {
  authToken: string | null;
  initialPublication: Publication | null;
  identifierFilter: string | null;
  categoryFilter: string | null;
  onPublicationsChange: (publications: Publication[]) => void;
}

export function Viewport({ 
  authToken, 
  initialPublication, 
  identifierFilter,
  categoryFilter,
  onPublicationsChange 
}: ViewportProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Function to fetch publications with filters
  const fetchPublications = useCallback(async (filters?: { 
    search?: string, 
    page?: number, 
    limit?: number 
  }) => {
    if (!authToken) return;

    try {
      const response = await axios.get(
        'https://api.foleon.com/v2/magazine/edition',
        {
          params: {
            page: filters?.page || currentPage,
            limit: filters?.limit || ITEMS_PER_PAGE,
            query: [
              ...(filters?.search ? [{
                field: 'name',
                type: 'like',
                value: `%${filters.search}%`
              }] : []),
              ...(identifierFilter ? [{
                field: 'identifier',
                type: 'eq',
                value: identifierFilter
              }] : []),
              ...(categoryFilter ? [{
                field: 'category',
                type: 'eq',
                value: categoryFilter
              }] : [])
            ],
            'order-by': [{
              field: 'name',
              type: 'field',
              direction: 'ASC'
            }]
          },
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          paramsSerializer: (params) => qs.stringify(params, { encode: false })
        }
      );
      
      const newPublications = response.data._embedded.edition;
      setPublications(newPublications);
      onPublicationsChange(newPublications);
      const totalItems = response.data.total_items;
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  }, [authToken, identifierFilter, categoryFilter]);

  // Update useEffect to set initial publication
  useEffect(() => {
    if (authToken) {
      fetchPublications();
      if (initialPublication && !selectedPublication) {
        setSelectedPublication(initialPublication);
      }
    }
  }, [authToken, initialPublication, selectedPublication, fetchPublications]);

  // Add effect to refetch when filters change
  useEffect(() => {
    if (authToken) {
      fetchPublications();
    }
  }, [authToken, identifierFilter, categoryFilter, fetchPublications]);

  // Add handler for page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPublications({ page: newPage, search: searchQuery });
  };

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
    fetchPublications({ search: value, page: 1 });
  };

  return (
    <div style={{ padding: '20px' }}>
      <TextInput
        placeholder="Search publications..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        mb="md"
      />
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: selectedPublication ? '1fr 1fr' : '1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          {publications.map((pub) => (
            <Card 
              key={pub.id}
              shadow="sm" 
              padding="sm"
              radius="md" 
              withBorder
              mb="xs"
              onClick={() => setSelectedPublication(pub)}
              style={{ 
                cursor: 'pointer',
                color: "black",
                backgroundColor: selectedPublication?.id === pub.id ? 'white' : 'lightgray'
              }}
            >
              <Text fw={500} size="md" mb={4}>
                {pub.name}
              </Text>
              <Group mt={4} gap="xs">
                <Text size="xs" c="dimmed">ID: {pub.identifier}</Text>
                <Text size="xs" c="dimmed">Status: {pub.status}</Text>
                <Text size="xs" c="dimmed">Category: {pub.category}</Text>
              </Group>
            </Card>
          ))}
        </div>

        {selectedPublication && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="lg" mb="md">{selectedPublication.name}</Text>
            <Text size="sm" mb="xs"><strong>ID:</strong> {selectedPublication.id}</Text>
            <Text size="sm" mb="xs"><strong>Identifier:</strong> {selectedPublication.identifier}</Text>
            <Text size="sm" mb="xs"><strong>UID:</strong> {selectedPublication.uid}</Text>
            <Text size="sm" mb="xs"><strong>Category:</strong> {selectedPublication.category}</Text>
            <Text size="sm" mb="xs"><strong>Level:</strong> {selectedPublication.level}</Text>
            <Text size="sm" mb="xs"><strong>Status:</strong> {selectedPublication.status}</Text>
            <Text size="sm" mb="xs"><strong>Visibility:</strong> {selectedPublication.is_visible ? 'Visible' : 'Hidden'}</Text>
            <Text size="sm" mb="xs"><strong>Is Default:</strong> {selectedPublication.is_default ? 'Yes' : 'No'}</Text>
          </Card>
        )}
      </div>
      
      <Group justify="center" mb="xl">
        <Pagination 
          total={totalPages} 
          value={currentPage} 
          onChange={handlePageChange}
        />
      </Group>
    </div>
  );
}
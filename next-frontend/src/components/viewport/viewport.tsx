import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Card, Text, Group, Pagination } from '@mantine/core';
import axios from 'axios';
import qs from 'qs';
import { Publication } from '../types/publication';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, shouldUpdateSelected: boolean = false) => {
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
      
      // Only update selected publication on initial load or when explicitly requested
      if (shouldUpdateSelected && newPublications.length > 0) {
        setSelectedPublication(newPublications[0]);
      }
      
      const totalItems = response.data.total_items;
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  }, [authToken, identifierFilter, categoryFilter, currentPage]);

  // Update useEffect to set initial publication
  useEffect(() => {
    if (authToken) {
      fetchPublications({}, true); // true to update selected publication on initial load
      if (initialPublication && !selectedPublication) {
        setSelectedPublication(initialPublication);
      }
    }
  }, [authToken, initialPublication]);

  // Add effect to refetch when filters change
  useEffect(() => {
    if (authToken) {
      fetchPublications({}, true); // true to update selected publication when filters change
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [authToken, identifierFilter, categoryFilter]);

  // Add handler for page changes
  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchPublications({ page: newPage }, false); // false to preserve selected publication
    }
  };

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    fetchPublications({ search: value, page: 1 }, true); // true to update selected publication on search
  };

  // Handle publication selection
  const handlePublicationSelect = (publication: Publication) => {
    setSelectedPublication(publication);
  };

  // Animation variants for list items
  const listVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: (index: number) => ({ 
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Animation variants for the details card
  const detailsVariants = {
    hidden: { 
      opacity: 0,
      x: 50
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.2
      }
    }
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
        gridTemplateColumns: '1fr',
        gap: '20px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '400px'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: selectedPublication ? '48%' : '100%' }}
          >
            {publications.map((pub, index) => (
              <motion.div
                key={pub.id}
                variants={listVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <Card 
                  shadow="sm" 
                  padding="sm"
                  radius="md" 
                  withBorder
                  mb="xs"
                  onClick={() => handlePublicationSelect(pub)}
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
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedPublication && (
            <motion.div
              key={selectedPublication.id}
              variants={detailsVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '48%'
              }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Group justify="center" mb="xl">
          <Pagination 
            total={totalPages} 
            value={currentPage} 
            onChange={handlePageChange}
            styles={(theme) => ({
              control: {
                transition: 'all 0.2s ease',
                '&[dataActive="true"]': {
                  transform: 'scale(1.1)',
                  backgroundColor: theme.colors.blue[6],
                },
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: theme.colors.gray[2],
                },
              }
            })}
          />
        </Group>
      </motion.div>
    </div>
  );
}
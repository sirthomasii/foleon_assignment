'use client'

import React, { useState, useEffect } from 'react';
import { Container, Flex, Box, Button } from '@mantine/core';
import { IconMenu2 } from '@tabler/icons-react';
import classes from './MainLayout.module.css';
import axios from 'axios';
import qs from 'qs';
import { Viewport } from './viewport/viewport';
import { Sidebar } from './sidebar/sidebar';
import { Publication } from './types/publication';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface FoleonAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [initialPublication, setInitialPublication] = useState(null);
  const [identifierFilter, setIdentifierFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        const authResponse = await axios.post<FoleonAuthResponse>(
          'https://api.foleon.com/oauth',
          {
            grant_type: 'client_credentials',
            client_id: 'eVOfzXYAzz',
            client_secret: 'f467185f0e8ed5c8125929c1d5fbedc15bd9f60b413f7d8629fad65b3ffa7ad5',
          }
        );
        setAuthToken(authResponse.data.access_token);
        
        const publicationsResponse = await axios.get('https://api.foleon.com/v2/magazine/edition', {
          params: {
            page: 1,
            limit: 1,
            'order-by': [{
              field: 'name',
              type: 'field',
              direction: 'ASC'
            }]
          },
          headers: {
            'Authorization': `Bearer ${authResponse.data.access_token}`
          },
          paramsSerializer: (params) => qs.stringify(params, { encode: false })
        });
        
        if (publicationsResponse.data._embedded.edition.length > 0) {
          setInitialPublication(publicationsResponse.data._embedded.edition[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    authenticate();
  }, []);

  const handleFilterChange = (type: 'identifier' | 'category', value: string | null) => {
    if (type === 'identifier') {
      setIdentifierFilter(prev => (prev === value ? null : value));
    } else if (type === 'category') {
      setCategoryFilter(prev => (prev === value ? null : value));
    }
  };

  return (
    <Container 
      size="xl" 
      style={{ 
        minHeight: '100vh',
        padding: 0,
        boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.8), 0 6px 20px 0 rgba(0, 0, 0, 0.8)',
        backgroundColor: '#2424248c',
      }}
    >
      {children}
      <Button
        className={classes.mobileMenuButton}
        onClick={toggleSidebar}
        variant="subtle"
        style={{
          position: 'absolute',
          left: '-15px',
          top: '10px',
          zIndex: 1000
        }}
      >
        <IconMenu2 size={32} />
      </Button>
      <Flex style={{ minHeight: '100vh' }}>
        <Box 
          w={300} 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            flexShrink: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.25)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
          }}
          className={`${classes.sidebar} ${isSidebarVisible ? '' : classes.hidden}`}
        >
          <Sidebar
            authToken={authToken}
            publications={publications}
            identifierFilter={identifierFilter}
            categoryFilter={categoryFilter}
            onIdentifierChange={(value) => handleFilterChange('identifier', value)}
            onCategoryChange={(value) => handleFilterChange('category', value)}
          />
        </Box>
        <Box style={{ flex: 1, position: 'relative', backgroundColor: 'rgba(0, 0, 0, 0.75)', borderRight: '1px solid rgba(255, 255, 255, 0.25)' }}>
          <Viewport 
            authToken={authToken} 
            initialPublication={initialPublication}
            identifierFilter={identifierFilter}
            categoryFilter={categoryFilter}
            onPublicationsChange={setPublications}
          />
        </Box>
      </Flex>
    </Container>
  );
}
import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Accordion } from '@mantine/core';
import axios from 'axios';
import qs from 'qs';

interface SidebarProps {
  authToken: string | null;
  publications: Array<{
    identifier: string;
    category: string;
  }>;
  identifierFilter: string | null;
  categoryFilter: string | null;
  onIdentifierChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
}

export function Sidebar({ 
  authToken, 
  publications,  
  identifierFilter, 
  categoryFilter, 
  onIdentifierChange, 
  onCategoryChange 
}: SidebarProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [allIdentifiers, setAllIdentifiers] = useState<{ value: string; label: string }[]>([]);
  const [allCategories, setAllCategories] = useState<{ value: string; label: string }[]>([]);
  const [currentIdentifiers, setCurrentIdentifiers] = useState<Set<string>>(new Set());
  const [currentCategories, setCurrentCategories] = useState<Set<string>>(new Set());

  // Fetch all unique identifiers and categories
  useEffect(() => {
    const fetchAllFilters = async () => {
      if (!authToken) return;

      try {
        // First get total count
        const countResponse = await axios.get('https://api.foleon.com/v2/magazine/edition', {
          params: {
            page: 1,
            limit: 1,
          },
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          paramsSerializer: (params) => qs.stringify(params, { encode: false })
        });

        const totalItems = countResponse.data.total_items;
        
        // Then fetch all items in one request
        const response = await axios.get('https://api.foleon.com/v2/magazine/edition', {
          params: {
            page: 1,
            limit: totalItems,
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
        });

        const allPubs = response.data._embedded.edition;
        
        // Extract unique identifiers and categories
        const identifiers = Array.from(new Set(allPubs.map((pub: { identifier: string }) => pub.identifier)))
          .filter(Boolean)
          .sort()
          .map((value) => ({
            value: value as string,
            label: value as string
          }));

        const categories = Array.from(new Set(allPubs.map((pub: { category: string }) => pub.category)))
          .filter(Boolean)
          .sort()
          .map((value) => ({
            value: value as string,
            label: value as string
          }));

        setAllIdentifiers(identifiers);
        setAllCategories(categories);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchAllFilters();
  }, [authToken]);

  // Update current filters based on visible publications
  useEffect(() => {
    setCurrentIdentifiers(new Set(publications.map(pub => pub.identifier)));
    setCurrentCategories(new Set(publications.map(pub => pub.category)));
  }, [publications]);

  return (
    <Box p="md">
      <img 
        src="https://i.imgur.com/k4VUZTN.png" 
        alt="Logo" 
        style={{ 
          width: '100px', 
          marginBottom: '8px', 
          filter: 'invert(1)', 
          paddingLeft: '20px' 
        }} 
      />
      
      <Stack>
        <Accordion value={activeAccordion} onChange={setActiveAccordion}>
          <Accordion.Item value="identifiers">
            <Accordion.Control 
              style={{ 
                color: 'lightblue', 
                fontWeight: 'bold', 
                fontFamily: 'Myriad Pro, sans-serif', 
                letterSpacing: '0.05em' 
              }}
            >
              Identifiers
            </Accordion.Control>
            <Accordion.Panel>
              {allIdentifiers.map(item => (
                <Text 
                  key={item.value} 
                  onClick={() => onIdentifierChange(item.value)} 
                  className="text"
                  style={{ 
                    fontSize: '.75em',
                    paddingLeft: "1em",
                    cursor: 'pointer',
                    color: identifierFilter === item.value ? 'lightblue' : 'white', 
                    opacity: currentIdentifiers.has(item.value) ? 1 : 0.5
                  }} 
                >
                  {item.label}
                </Text>
              ))}
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="categories">
            <Accordion.Control 
              style={{ 
                color: 'lightblue', 
                fontWeight: 'bold', 
                fontFamily: 'Myriad Pro, sans-serif', 
                letterSpacing: '0.05em' 
              }}
            >
              Categories
            </Accordion.Control>
            <Accordion.Panel>
              {allCategories.map(item => (
                <Text 
                  key={item.value} 
                  onClick={() => onCategoryChange(item.value)} 
                  className="text"
                  style={{ 
                    fontSize: '.75em',
                    paddingLeft: "1em",
                    cursor: 'pointer',
                    color: categoryFilter === item.value ? 'lightblue' : 'white', 
                    opacity: currentCategories.has(item.value) ? 1 : 0.5
                  }} 
                >
                  {item.label}
                </Text>
              ))}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Box>
  );
}
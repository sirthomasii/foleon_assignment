import React, { useState, useEffect } from 'react';
import { Box, Text, Stack, Accordion } from '@mantine/core';

interface SidebarProps {
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
  publications, 
  identifierFilter, 
  categoryFilter, 
  onIdentifierChange, 
  onCategoryChange 
}: SidebarProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null); // State for active accordion
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState<{ value: string; label: string }[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<{ value: string; label: string }[]>([]);
  const [initialIdentifiers, setInitialIdentifiers] = useState<{ value: string; label: string }[]>([]);
  const [initialCategories, setInitialCategories] = useState<{ value: string; label: string }[]>([]);

  // Get unique values for filters
  useEffect(() => {
    const identifiers = Array.from(new Set(publications.map(pub => pub.identifier))).filter(Boolean).map(value => ({
      value,
      label: value
    }));
    const categories = Array.from(new Set(publications.map(pub => pub.category))).filter(Boolean).map(value => ({
      value,
      label: value
    }));
    
    // Set initial unique values
    if (uniqueIdentifiers.length === 0 && uniqueCategories.length === 0) {
      setInitialIdentifiers(identifiers);
      setInitialCategories(categories);
    }

    setUniqueIdentifiers(identifiers);
    setUniqueCategories(categories);
  }, [publications, uniqueCategories.length, uniqueIdentifiers.length]);

  const handleIdentifierClick = (value: string) => {
    if (uniqueIdentifiers.some(item => item.value === value)) {
      onIdentifierChange(value); // Update identifier filter
    }
  };

  const handleCategoryClick = (value: string) => {
    if (uniqueCategories.some(item => item.value === value)) {
      onCategoryChange(value); // Update category filter
    }
  };

  return (
    <Box p="md">
      <img src="https://i.imgur.com/k4VUZTN.png" alt="Logo" style={{ width: '100px', marginBottom: '8px', filter: 'invert(1)', paddingLeft: '20px' }} />
      
      <Stack>
        <Accordion value={activeAccordion} onChange={setActiveAccordion}>
          <Accordion.Item value="identifiers">
            <Accordion.Control style={{ color: 'lightblue', fontWeight: 'bold', fontFamily: 'Myriad Pro, sans-serif', letterSpacing: '0.05em' }}>
              Identifiers
            </Accordion.Control>
            <Accordion.Panel>
              {initialIdentifiers.map(item => (
                <Text 
                  key={item.value} 
                  onClick={() => handleIdentifierClick(item.value)} 
                  className="text"
                  style={{ 
                    fontSize: '.75em',
                    paddingLeft: "1em",
                    cursor: uniqueIdentifiers.some(i => i.value === item.value) ? 'pointer' : 'not-allowed', 
                    color: identifierFilter === item.value ? 'lightblue' : 'white', 
                    opacity: uniqueIdentifiers.some(i => i.value === item.value) ? 1 : 0.5 // Grey out if not present in current publications
                  }} 
                >
                  {item.label}
                </Text>
              ))}
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="categories">
            <Accordion.Control style={{ color: 'lightblue', fontWeight: 'bold', fontFamily: 'Myriad Pro, sans-serif', letterSpacing: '0.05em' }}>
              Categories
            </Accordion.Control>
            <Accordion.Panel>
              {initialCategories.map(item => (
                <Text 
                  key={item.value} 
                  onClick={() => handleCategoryClick(item.value)} 
                  className="text"
                  style={{ 
                    fontSize: '.75em',
                    paddingLeft: "1em",
                    cursor: uniqueCategories.some(i => i.value === item.value) ? 'pointer' : 'not-allowed', 
                    color: categoryFilter === item.value ? 'lightblue' : 'white', 
                    opacity: uniqueCategories.some(i => i.value === item.value) ? 1 : 0.5 // Grey out if not present in current publications
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
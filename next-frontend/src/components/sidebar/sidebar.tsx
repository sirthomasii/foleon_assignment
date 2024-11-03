import React from 'react';
import { Box, Text, Select } from '@mantine/core';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface SidebarProps {
  publications: Array<{
    identifier: string;
    category: string;
  }>;
  identifierFilter: string | null;
  categoryFilter: string | null;
  dateFilter: [Date | null, Date | null];
  onIdentifierChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  onDateChange: (value: [Date | null, Date | null]) => void;
}

export function Sidebar({ 
  publications, 
  identifierFilter, 
  categoryFilter, 
  dateFilter, 
  onIdentifierChange, 
  onCategoryChange, 
  onDateChange 
}: SidebarProps) {
  // Get unique values for filters
  const getUniqueValues = (field: 'identifier' | 'category') => {
    const values = publications.map(pub => pub[field]);
    return Array.from(new Set(values))
      .filter(Boolean)
      .map(value => ({
        value: value,
        label: value
      }));
  };

  return (
    <Box p="md">
      <img src="https://i.imgur.com/k4VUZTN.png" alt="Logo" style={{ width: '100px', marginBottom: '8px', filter: 'invert(1)' }} />
      
      <Select
        label="Identifier"
        placeholder="Select identifier"
        data={getUniqueValues('identifier')}
        value={identifierFilter}
        onChange={onIdentifierChange}
        clearable
        searchable
        mb="md"
      />

      <Select
        label="Category"
        placeholder="Select category"
        data={getUniqueValues('category')}
        value={categoryFilter}
        onChange={onCategoryChange}
        clearable
        searchable
        mb="md"
      />

      <Text size="xs" fw={500} mb={3}>Date Range</Text>
      <Box mb="md">
        <DatePicker
          selectsRange={true}
          startDate={dateFilter[0] || undefined}
          endDate={dateFilter[1] || undefined}
          onChange={(update: [Date | null, Date | null]) => {
            console.log('Selected date range:', update);
            onDateChange(update);
          }}
          isClearable
          placeholderText="Select date range"
          className="form-control"
          minDate={new Date('2023-01-01')}
          maxDate={new Date('2023-12-31')}
        />
      </Box>
    </Box>
  );
}
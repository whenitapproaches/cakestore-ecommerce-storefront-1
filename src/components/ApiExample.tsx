"use client";

import { useState } from 'react';
import { useProducts, useCustomApi } from 'lib/useApiClient';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

export default function ApiExample() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Using the specific products hook
  const productsHook = useProducts();
  const { getAll, search } = productsHook;
  
  // Using custom API hook
  const customApi = useCustomApi();
  const customGet = customApi.get('/api/products');

  const handleGetAllProducts = async () => {
    await getAll().execute();
  };

  const handleSearchProducts = async () => {
    if (searchTerm) {
      await search(searchTerm).execute();
    }
  };

  const handleCustomApiCall = async () => {
    await customGet.execute();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Helper Example
      </Typography>

      {/* Get All Products Example */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Get All Products
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleGetAllProducts}
          disabled={getAll.loading}
          sx={{ mr: 2 }}
        >
          {getAll.loading ? <CircularProgress size={20} /> : 'Get All Products'}
        </Button>
        
        {getAll.error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getAll.error.message}
          </Alert>
        )}
        
        {getAll.data && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Found {getAll.data.length} products
          </Typography>
        )}
      </Box>

      {/* Search Products Example */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Products
        </Typography>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term..."
          style={{ marginRight: '8px', padding: '8px' }}
        />
        <Button 
          variant="contained" 
          onClick={handleSearchProducts}
          disabled={search(searchTerm).loading}
        >
          {search(searchTerm).loading ? <CircularProgress size={20} /> : 'Search'}
        </Button>
        
        {search(searchTerm).error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {search(searchTerm).error?.message}
          </Alert>
        )}
        
        {search(searchTerm).data && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Search results: {search(searchTerm).data?.length} products
          </Typography>
        )}
      </Box>

      {/* Custom API Call Example */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Custom API Call
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleCustomApiCall}
          disabled={customGet.loading}
        >
          {customGet.loading ? <CircularProgress size={20} /> : 'Custom API Call'}
        </Button>
        
        {customGet.error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {customGet.error.message}
          </Alert>
        )}
        
        {customGet.data && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Custom call successful: {customGet.data.length} items
          </Typography>
        )}
      </Box>

      {/* Reset Example */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Reset State
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => {
            getAll.reset();
            search(searchTerm).reset();
            customGet.reset();
          }}
        >
          Reset All States
        </Button>
      </Box>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Inventory2,
  LocalShipping,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  ShoppingCart,
  RestoreFromTrash,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RequestStock = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [notes, setNotes] = useState('');
  const [requests, setRequests] = useState([]);
  const [draftId, setDraftId] = useState(1);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent - ASAP' }
  ];

  const supplierOptions = [
    'Office Depot',
    'Tech Solutions Inc.',
    'Global Supply Co.',
    'Quality Furniture Ltd.',
    'Electra Electronics',
    'Central Stationery',
    'BestValue Wholesalers',
    'Premier Equipment Suppliers'
  ];

  // Fetch products and low stock items from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, lowStockResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/products/low-stock')
        ]);

        if (productsResponse.ok && lowStockResponse.ok) {
          const productsData = await productsResponse.json();
          const lowStockData = await lowStockResponse.json();
          
          setProducts(productsData);
          setLowStockProducts(lowStockData);
        } else {
          setError('Failed to fetch products. Please try again.');
        }
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    setSelectedProduct(productId);
    
    if (productId) {
      const product = products.find(p => p.id.toString() === productId.toString());
      if (product && product.minQuantity) {
        // Suggest ordering quantity to bring stock up to acceptable level
        const suggestedQuantity = Math.max(0, product.minQuantity * 2 - product.quantity);
        setQuantity(suggestedQuantity.toString());
      }
    } else {
      setQuantity('');
    }
  };

  const handleAddRequest = () => {
    if (!validateForm()) {
      return;
    }

    const product = products.find(p => p.id.toString() === selectedProduct.toString());
    
    const newRequest = {
      id: draftId,
      productId: selectedProduct,
      productName: product.name,
      quantity: parseInt(quantity),
      supplier,
      urgency,
      notes,
      currentStock: product.quantity,
      minStock: product.minQuantity
    };
    
    setRequests([...requests, newRequest]);
    setDraftId(draftId + 1);
    
    // Reset form fields
    setSelectedProduct('');
    setQuantity('');
    setSupplier('');
    setUrgency('normal');
    setNotes('');
    
    setSuccess('Request added to draft list');
  };

  const handleRemoveRequest = (id) => {
    setRequests(requests.filter(request => request.id !== id));
  };

  const handleSubmitRequests = async () => {
    if (requests.length === 0) {
      setError('No requests to submit');
      return;
    }
    
    try {
      const response = await fetch('/api/stock-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: requests.map(request => ({
            productId: request.productId,
            quantity: request.quantity,
            supplier: request.supplier,
            urgency: request.urgency,
            notes: request.notes
          }))
        })
      });
      
      if (response.ok) {
        setSuccess('Stock requests submitted successfully!');
        setRequests([]);
        setDraftId(1);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit requests. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }
  };

  const validateForm = () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return false;
    }
    
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity (greater than 0)');
      return false;
    }
    
    if (!supplier) {
      setError('Please select a supplier');
      return false;
    }
    
    return true;
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  // Helper function to determine urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return 'info';
      case 'normal': return 'success';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography 
        variant="h4" 
        className="section-title"
        sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}
      >
        Request New Stock
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className="card-3d" sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Create Stock Request
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth className="input-3d">
                      <InputLabel id="product-select-label">Select Product</InputLabel>
                      <Select
                        labelId="product-select-label"
                        value={selectedProduct}
                        onChange={handleProductChange}
                        label="Select Product"
                        startAdornment={
                          <InputAdornment position="start">
                            <Inventory2 />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Select a product</em>
                        </MenuItem>
                        
                        {lowStockProducts.length > 0 && (
                          <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', color: '#f59e0b' }}>
                            --- Low Stock Items ---
                          </MenuItem>
                        )}
                        
                        {lowStockProducts.map((product) => (
                          <MenuItem key={`low-${product.id}`} value={product.id}>
                            {product.name} 
                            <Chip 
                              size="small" 
                              label={`${product.quantity} in stock`}
                              color="warning"
                              sx={{ ml: 1, height: '20px' }}
                            />
                          </MenuItem>
                        ))}
                        
                        <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>
                          --- All Products ---
                        </MenuItem>
                        
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} ({product.quantity} in stock)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity to Order"
                      type="number"
                      fullWidth
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      InputProps={{
                        className: "input-3d",
                        startAdornment: (
                          <InputAdornment position="start">
                            <ShoppingCart />
                          </InputAdornment>
                        ),
                      }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth className="input-3d">
                      <InputLabel id="urgency-select-label">Urgency</InputLabel>
                      <Select
                        labelId="urgency-select-label"
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        label="Urgency"
                      >
                        {urgencyOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth className="input-3d">
                      <InputLabel id="supplier-select-label">Supplier</InputLabel>
                      <Select
                        labelId="supplier-select-label"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        label="Supplier"
                        startAdornment={
                          <InputAdornment position="start">
                            <LocalShipping />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Select a supplier</em>
                        </MenuItem>
                        {supplierOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Additional Notes"
                      fullWidth
                      multiline
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-3d"
                      InputProps={{
                        className: "input-3d"
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleAddRequest}
                      className="btn-3d btn-3d-primary"
                      sx={{ 
                        py: 1.5, 
                        fontSize: '1rem', 
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #4338ca, #4f46e5)',
                        boxShadow: '0px 4px 10px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
                          boxShadow: '0px 6px 15px rgba(79, 70, 229, 0.4)',
                        }
                      }}
                      startIcon={<AddIcon />}
                    >
                      Add to Request List
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className="card-3d" sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Draft Request List ({requests.length})
                </Typography>
                
                {requests.length > 0 && (
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => setRequests([])}
                      startIcon={<RestoreFromTrash />}
                      sx={{ mr: 1 }}
                    >
                      Clear All
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={handleSubmitRequests}
                      startIcon={<SendIcon />}
                    >
                      Submit All Requests
                    </Button>
                  </Box>
                )}
              </Box>
              
              {requests.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5, flexDirection: 'column' }}>
                  <ShoppingCart sx={{ fontSize: 60, color: '#d1d5db', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No draft requests yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a product request using the form on the left
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {requests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {request.productName}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={request.urgency.toUpperCase()}
                                color={getUrgencyColor(request.urgency)}
                                sx={{ ml: 1, height: '20px' }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span" display="block">
                                Quantity: <b>{request.quantity}</b> units
                              </Typography>
                              <Typography variant="body2" component="span" display="block">
                                Current Stock: <b>{request.currentStock}</b> units (Min: {request.minStock})
                              </Typography>
                              <Typography variant="body2" component="span" display="block">
                                Supplier: {request.supplier}
                              </Typography>
                              {request.notes && (
                                <Typography 
                                  variant="body2" 
                                  component="span" 
                                  display="block"
                                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                                >
                                  "{request.notes}"
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleRemoveRequest(request.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < requests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          
          {lowStockProducts.length > 0 && (
            <Grid item xs={12}>
              <Paper className="card-3d" sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#f59e0b' }}>
                  <Warning sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  Low Stock Alerts
                </Typography>
                
                <Grid container spacing={2}>
                  {lowStockProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          border: '1px solid #f59e0b',
                          backgroundColor: 'rgba(255, 237, 213, 0.4)'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Stock: <b>{product.quantity}</b> units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Minimum Level: {product.minQuantity} units
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ mt: 1 }}
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setSelectedProduct(product.id.toString());
                            setQuantity(Math.max(product.minQuantity * 2 - product.quantity, 1).toString());
                            setUrgency(product.quantity <= 1 ? 'urgent' : 'high');
                          }}
                        >
                          Add to Request
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </motion.div>

      {/* Success/Error messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" elevation={6}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" elevation={6}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequestStock;
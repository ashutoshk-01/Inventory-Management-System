import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import managerService from '../../../services/managerService';
import { motion } from 'framer-motion';

const SupplierOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    products: [{ productId: '', quantity: '', priceAtOrder: '', costAtOrder: '' }],
    totalAmount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await managerService.getSupplierOrders('ALL');
      if (response.success) {
        setOrders(response.data || []);
      } else {
        showSnackbar(response.message || 'Failed to fetch orders', 'error');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('Error fetching orders', 'error');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId || formData.products.length === 0) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        supplierId: formData.supplierId,
        products: formData.products.map(product => ({
          productId: product.productId,
          quantity: parseInt(product.quantity),
          priceAtOrder: parseFloat(product.priceAtOrder),
          costAtOrder: parseFloat(product.costAtOrder)
        })),
        totalAmount: formData.totalAmount,
        status: 'PENDING'
      };

      const response = await managerService.addSupplierOrder(orderData);
      if (response.success) {
        showSnackbar(response.message || 'Order added successfully', 'success');
        setOpen(false);
        resetForm();
        await fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to add order');
      }
    } catch (error) {
      console.error('Error adding order:', error);
      showSnackbar(error.message || 'Error adding order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await managerService.updateSupplierOrderStatus(orderId, newStatus);
      if (response.success) {
        showSnackbar(response.message || 'Order status updated successfully', 'success');
        await fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar(error.message || 'Error updating order status', 'error');
    }
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: '', priceAtOrder: '', costAtOrder: '' }]
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };

    // Calculate total amount
    const total = newProducts.reduce((sum, product) => {
      const quantity = parseInt(product.quantity || 0);
      const cost = parseFloat(product.costAtOrder || 0);
      return sum + (quantity * cost);
    }, 0);

    setFormData(prev => ({
      ...prev,
      products: newProducts,
      totalAmount: total
    }));
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      products: [{ productId: '', quantity: '', priceAtOrder: '', costAtOrder: '' }],
      totalAmount: 0
    });
    setSelectedOrder(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box className="card-3d-soft" sx={{ p: 4, borderRadius: 3, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Supplier Orders
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Add New Order
          </Button>
        </motion.div>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          {orders.length === 0 ? (
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No Supplier Orders Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the "Add New Order" button to create your first supplier order
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Supplier ID</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.supplierId}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status || 'Pending'}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        setSelectedOrder(order);
                        setOpen(true);
                      }}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Add/Edit Order Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? 'Edit Order' : 'Add New Order'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Supplier ID"
                  value={formData.supplierId}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>

              {formData.products.map((product, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Product ID"
                          value={product.productId}
                          onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Price"
                          type="number"
                          value={product.priceAtOrder}
                          onChange={(e) => handleProductChange(index, 'priceAtOrder', e.target.value)}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Cost"
                          type="number"
                          value={product.costAtOrder}
                          onChange={(e) => handleProductChange(index, 'costAtOrder', e.target.value)}
                          fullWidth
                          required
                        />
                      </Grid>
                    </Grid>
                    {index > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeProduct(index)}
                        sx={{ mt: 2 }}
                      >
                        Remove Product
                      </Button>
                    )}
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={addProduct}
                  startIcon={<Add />}
                >
                  Add Another Product
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">
                  Total Amount: ${formData.totalAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierOrderManagement; 
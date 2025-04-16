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
    Typography,
    Select,
    MenuItem,
    IconButton,
    Alert,
    Snackbar,
    Grid,
    CircularProgress,
    Card
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import managerService from '../../../services/managerService';
import { motion } from 'framer-motion';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        customerId: '',
        products: [{ productId: '', quantity: '', priceAtOrder: '' }],
        totalAmount: 0,
        profitOnProducts: 0
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
        try {
            setIsLoading(true);
            const response = await managerService.getCustomerOrders('ALL');
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
        if (!formData.customerId || formData.products.length === 0) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const orderData = {
                customerId: formData.customerId,
                products: formData.products.map(product => ({
                    productId: product.productId,
                    quantity: parseInt(product.quantity),
                    priceAtOrder: parseFloat(product.priceAtOrder)
                })),
                totalAmount: formData.totalAmount,
                profitOnProducts: formData.profitOnProducts,
                status: 'PENDING'
            };

            const response = await managerService.addCustomerOrder(orderData);
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
            const response = await managerService.updateCustomerOrderStatus(orderId, newStatus);
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
            products: [...prev.products, { productId: '', quantity: '', priceAtOrder: '' }]
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
        
        // Calculate total amount and profit
        const total = newProducts.reduce((sum, product) => {
            const quantity = parseInt(product.quantity || 0);
            const price = parseFloat(product.priceAtOrder || 0);
            return sum + (quantity * price);
        }, 0);
        
        // Calculate profit (20% margin)
        const profit = total * 0.2;

        setFormData(prev => ({
            ...prev,
            products: newProducts,
            totalAmount: total,
            profitOnProducts: profit
        }));
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            products: [{ productId: '', quantity: '', priceAtOrder: '' }],
            totalAmount: 0,
            profitOnProducts: 0
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
                    Customer Orders
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
                                No Customer Orders Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click the "Add New Order" button to create your first order
                                </Typography>
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Profit</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell>{order.orderId}</TableCell>
                                        <TableCell>{order.customerId}</TableCell>
                                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>${order.profitOnProducts.toFixed(2)}</TableCell>
                                        <TableCell>
                                                <Select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                                                size="small"
                                                sx={{ minWidth: 120 }}
                                            >
                                                <MenuItem value="PENDING">Pending</MenuItem>
                                                <MenuItem value="PROCESSING">Processing</MenuItem>
                                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
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
                                    label="Customer ID"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                                    fullWidth
                                                required
                                            />
                                        </Grid>

                            {formData.products.map((product, index) => (
                                <Grid item xs={12} key={index}>
                                    <Card sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Product ID"
                                                    value={product.productId}
                                                    onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                            <TextField
                                                    label="Quantity"
                                                type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                    fullWidth
                                                required
                                            />
                                        </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Price"
                                                    type="number"
                                                    value={product.priceAtOrder}
                                                    onChange={(e) => handleProductChange(index, 'priceAtOrder', e.target.value)}
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
                                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Estimated Profit: ${formData.profitOnProducts.toFixed(2)}
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

export default OrderManagement;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import managerService from '../../../services/managerService';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await managerService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        showSnackbar(response.message || 'Failed to fetch categories', 'error');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar(error.message || 'Error fetching categories', 'error');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showSnackbar('Please enter a category name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const category = {
        id: selectedCategory ? selectedCategory.id : null,
        name: categoryName.trim(),
        addedby: null
      };
      
      const response = await managerService.addCategory(category);
      if (response.success) {
        showSnackbar(response.message || 'Category added successfully', 'success');
        setOpen(false);
        setCategoryName('');
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showSnackbar(error.message || 'Error adding category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="card-3d-soft" sx={{ p: 4, borderRadius: 3, backgroundColor: 'white' }}>
      <Box 
        className="section-title" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4 
        }}
      >
        <CategoryIcon 
          sx={{ 
            fontSize: 32, 
            color: 'primary.main',
            backgroundColor: 'primary.light',
            p: 1,
            borderRadius: '50%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }} 
        />
        <Typography 
          variant="h4" 
          className="section-title"
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Category Management
        </Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            '&.Mui-selected': {
              color: '#4338ca',
            },
          },
        }}
      >
        <Tab label="Add New Category" />
        <Tab label="View Categories" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="card-3d" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  Add New Category
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Category Name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        fullWidth
                        className="input-3d"
                        helperText="Category name will be converted to uppercase"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            fullWidth
                            className="btn-3d btn-3d-primary"
                            sx={{ 
                              background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
                              boxShadow: '0 6px 12px rgba(99, 102, 241, 0.3)',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 'bold',
                              py: 1.2,
                              px: 3
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Category'}
                          </Button>
                        </motion.div>
                        <Button
                          variant="outlined"
                          onClick={() => setCategoryName('')}
                          disabled={isLoading}
                          className="btn-3d"
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            color: '#6366f1',
                            '&:hover': {
                              borderColor: '#6366f1',
                              backgroundColor: 'rgba(99, 102, 241, 0.05)'
                            }
                          }}
                        >
                          Reset
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className="card-3d" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  Categories List
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {categories.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="No categories found" />
                      </ListItem>
                    ) : (
                      categories.map((category) => (
                        <ListItem 
                          key={category.id}
                          sx={{
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)'
                            }
                          }}
                        >
                          <ListItemText 
                            primary={category.name} 
                            secondary={`Added by: ${category.addedby?.name || 'System'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryName(category.name);
                                setActiveTab(0);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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

export default CategoryManagement;
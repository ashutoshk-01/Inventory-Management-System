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
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import managerService from '../../../services/managerService';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    contact: '',
    salary: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeTab, setActiveTab] = useState(0);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await managerService.getAllEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showSnackbar(error.response?.data?.message || 'Error fetching employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await managerService.getEmployeeRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showSnackbar('Error fetching employee roles', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.contact || (!selectedEmployee && !formData.password)) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedEmployee) {
        await managerService.updateEmployee(formData);
        showSnackbar('Employee updated successfully', 'success');
      } else {
        await managerService.addEmployee(formData);
        showSnackbar('Employee added successfully', 'success');
      }
      setOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error processing employee:', error);
      showSnackbar(error.response?.data?.message || 'Error processing employee', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (email) => {
    try {
      await managerService.deleteEmployee(email);
      showSnackbar('Employee deactivated successfully', 'success');
      fetchEmployees();
    } catch (error) {
      console.error('Error deactivating employee:', error);
      showSnackbar(error.response?.data?.message || 'Error deactivating employee', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      contact: '',
      salary: '',
      role: ''
    });
    setSelectedEmployee(null);
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
        <PersonIcon 
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
          Employee Management
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
        <Tab label="Add New Employee" />
        <Tab label="View Employees" />
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
                  {selectedEmployee ? 'Update Employee' : 'Add New Employee'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        fullWidth
                        disabled={selectedEmployee}
                        className="input-3d"
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
                    {!selectedEmployee && (
                      <Grid item xs={12}>
                        <TextField
                          label="Password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          fullWidth
                          className="input-3d"
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
                    )}
                    <Grid item xs={12}>
                      <TextField
                        label="Contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        required
                        fullWidth
                        className="input-3d"
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
                      <TextField
                        label="Salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                        required
                        fullWidth
                        className="input-3d"
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
                      <FormControl fullWidth className="input-3d">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          required
                          sx={{ 
                            borderRadius: 2,
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                              borderWidth: 2
                            }
                          }}
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.name.replace('EMPLOYEE_', '')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : (selectedEmployee ? 'Update' : 'Add')}
                          </Button>
                        </motion.div>
                        <Button
                          variant="outlined"
                          onClick={resetForm}
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
                  Employees List
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {employees.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="No employees found" />
                      </ListItem>
                    ) : (
                      employees.map((employee) => (
                        <ListItem 
                          key={employee.email}
                          sx={{
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {employee.email.charAt(0).toUpperCase()}
                          </Avatar>
                          <ListItemText 
                            primary={employee.email}
                            secondary={`Contact: ${employee.contact} | Salary: $${employee.salary}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setFormData({
                                  email: employee.email,
                                  contact: employee.contact,
                                  salary: employee.salary,
                                  role: employee.role?.id
                                });
                                setActiveTab(0);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDelete(employee.email)}
                            >
                              <DeleteIcon />
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

export default EmployeeManagement;
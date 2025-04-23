import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as ManagerIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as StatusIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import adminService from '../../services/adminService';

const ManagerManagement = () => {
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentManager, setCurrentManager] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    email: "",
    department: "",
    phone: "",
    active: true
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch managers
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllManagers();
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchManagers();
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await adminService.getManagerRoles();
      const roles = response.data.map(role => ({
        ...role,
        displayName: role.name.replace('MANAGER_', '')
      }));
      setDepartments(roles);

      if (!formData.department && roles.length > 0) {
        setFormData(prev => ({
          ...prev,
          department: roles[0].displayName
        }));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {

    fetchDepartments();
  }, []);

  const handleOpenDialog = (manager = null) => {
    setError(null);
    if (manager) {
      setEditMode(true);
      setCurrentManager(manager);
      setFormData({
        email: manager.email,
        department: manager.department ? manager.department.replace('MANAGER_', '') : '',
        phone: manager.phone || '',
        active: manager.active
      });
    } else {
      setEditMode(false);
      setCurrentManager(null);
      setFormData({
        email: "",
        department: departments[0]?.displayName || '',
        phone: "",
        active: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      active: e.target.checked
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.department) return 'Department is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const selectedRole = departments.find(role =>
        role.name === `MANAGER_${formData.department}`
      );

      if (!selectedRole) {
        setError('Selected department not found');
        setLoading(false);
        return;
      }

      const managerData = {
        email: formData.email,
        contact: formData.phone,
        active: formData.active,
        assigned: selectedRole
      };

      let response;
      if (editMode && currentManager) {
        response = await adminService.updateManager(managerData);
      } else {
        managerData.password = "defaultPassword123";
        response = await adminService.addManager(managerData);
      }

      if (response.success) {
        showSnackbar(response.message);
        handleClose();
        fetchManagers();
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error saving manager:', error);
      setError(error.response?.data?.message || 'Failed to save manager');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email) => {
    if (window.confirm('Are you sure you want to deactivate this manager?')) {
      try {
        await adminService.deleteManager(email);
        showSnackbar('Manager deactivated successfully');
        fetchManagers();
      } catch (error) {
        console.error('Error deactivating manager:', error);
        setError('Failed to deactivate manager');
      }
    }
  };

  if (loading && managers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

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
        <ManagerIcon
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
          Manager Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <motion.div
        className="glow-effect"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="btn-3d btn-3d-primary"
          onClick={() => handleOpenDialog()}
          sx={{
            mb: 3,
            background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
            boxShadow: '0 6px 12px rgba(99, 102, 241, 0.3)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            py: 1.2,
            px: 3
          }}
        >
          Add New Manager
        </Button>
      </motion.div>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(242, 242, 247, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Manager</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Department</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {managers.map((manager) => (
              <TableRow
                key={manager.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(242, 242, 247, 0.5)'
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: manager.active ? 'primary.light' : 'grey.300',
                        color: manager.active ? 'primary.main' : 'text.secondary',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      {manager.email.substring(0, 1)}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {manager.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {manager.assigned.name.replace("MANAGER_", "")}
                  </Typography>

                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Edit Manager" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(manager)}
                        className="btn-3d"
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.2)' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Manager" arrow>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(manager.email)}
                        className="btn-3d"
                        sx={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'card-3d',
          sx: {
            borderRadius: 3,
            backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 5px rgba(0,0,0,0.03), 0 0 0 1px rgba(255,255,255,0.4)'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}>
          {editMode ? 'Edit Manager' : 'Add New Manager'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Grid container spacing={2}>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-3d"
                  variant="outlined"
                  required
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-3d"
                  variant="outlined"
                  required
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
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                        borderWidth: 2
                      }
                    }
                  }}
                >
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    label="Department"
                    required
                    disabled={loadingDepartments}
                  >
                    {loadingDepartments ? (
                      <MenuItem value="" disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading departments...
                        </Box>
                      </MenuItem>
                    ) : departments.length === 0 ? (
                      <MenuItem value="" disabled>No departments available</MenuItem>
                    ) : (
                      departments.map((role) => (
                        <MenuItem key={role.name} value={role.displayName}>
                          {role.displayName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleSwitchChange}
                      name="active"
                    />
                  }
                  label="Active"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
              <Button
                onClick={handleClose}
                variant="outlined"
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
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                className="btn-3d btn-3d-primary"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #4338ca 30%, #6366f1 90%)',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                }}
              >
                {editMode ? 'Update Manager' : 'Add Manager'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerManagement;
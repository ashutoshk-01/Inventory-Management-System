import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonOutline,
  Email as EmailOutline,
  Phone,
  Save,
  Edit,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Failed to fetch user profile. Please try again.');
        }
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...userData });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      const data = await res.json();

      if (res.ok) {
        setUserData(editedData);
        setEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.message || 'Update failed.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedData({});
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        className="section-title"
        sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}
      >
        User Profile
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper className="card-3d" sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  src={userData?.avatarUrl} 
                  alt={userData?.name} 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {userData?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData?.role}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleEdit}
                  className="btn-3d btn-3d-primary"
                  sx={{ 
                    mb: 2,
                    py: 1,
                    fontSize: '0.9rem', 
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #4338ca, #4f46e5)',
                    boxShadow: '0px 4px 10px rgba(79, 70, 229, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
                      boxShadow: '0px 6px 15px rgba(79, 70, 229, 0.4)',
                    }
                  }}
                  startIcon={<Edit />}
                >
                  Edit Profile
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper className="card-3d" sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {editing ? 'Edit Profile Information' : 'Profile Information'}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    name="name"
                    value={editing ? editedData.name : userData?.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      className: "input-3d",
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    fullWidth
                    name="email"
                    value={editing ? editedData.email : userData?.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      className: "input-3d",
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutline />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Number"
                    fullWidth
                    name="contact"
                    value={editing ? editedData.contact : userData?.contact}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      className: "input-3d",
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Role"
                    fullWidth
                    name="role"
                    value={editing ? editedData.role : userData?.role}
                    onChange={handleInputChange}
                    disabled={true}
                    InputProps={{
                      className: "input-3d",
                      startAdornment: (
                        <InputAdornment position="start">
                          <Settings />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {editing && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    startIcon={<Save />}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={success || error}
      />
    </Box>
  );
};

export default Profile;

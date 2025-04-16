import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';
import managerService from '../../../services/managerService';

const ReportGeneration = () => {
  const [reportParams, setReportParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleGenerateReport = async () => {
    if (!reportParams.month || !reportParams.year) {
      showSnackbar('Please fill in both month and year', 'error');
      return;
    }

    if (reportParams.month < 1 || reportParams.month > 12) {
      showSnackbar('Month must be between 1 and 12', 'error');
      return;
    }

    if (reportParams.year < 2000) {
      showSnackbar('Please enter a valid year (2000 or later)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await managerService.generateReport(reportParams.month, reportParams.year);
      
      if (response.success && response.data instanceof Blob) {
        // Create a blob from the response data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Check if the blob is empty or invalid
        if (blob.size === 0) {
          throw new Error('Generated report is empty');
        }

        const url = window.URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `manager_report_${reportParams.month}_${reportParams.year}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        link.remove();
        
        showSnackbar('Report generated and downloaded successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showSnackbar(
        error.message === 'Network Error' 
          ? 'Unable to connect to server' 
          : error.message || 'Failed to generate report', 
        'error'
      );
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

  return (
    <Box>
      <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
        Report Generation
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Month"
            type="number"
            value={reportParams.month}
            onChange={(e) => setReportParams({...reportParams, month: parseInt(e.target.value)})}
            InputProps={{ 
              inputProps: { min: 1, max: 12 },
              startAdornment: null
            }}
            fullWidth
          />
          <TextField
            label="Year"
            type="number"
            value={reportParams.year}
            onChange={(e) => setReportParams({...reportParams, year: parseInt(e.target.value)})}
            InputProps={{ 
              inputProps: { min: 2000 },
              startAdornment: null
            }}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Download />}
            onClick={handleGenerateReport}
            disabled={isLoading}
            sx={{ minWidth: '200px' }}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportGeneration;
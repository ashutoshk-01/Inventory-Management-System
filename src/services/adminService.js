import axios from 'axios';

const API_URL = 'http://localhost:8080/admin';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add authorization header
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        console.log('Current token (Basic Auth string):', token);
        if (token) {
            // Use Basic Auth scheme
            config.headers.Authorization = `Basic ${token}`;
            console.log('Request headers with Basic Auth:', config.headers);
        } else {
            console.warn('No token found in localStorage for Basic Auth');
        }
        return config;
    },
    error => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => {
        console.log('Response interceptor:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('Response interceptor error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });
        if (error.response && error.response.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const adminService = {
    // Get all manager roles
    getManagerRoles: async () => {
        try {
            const response = await axiosInstance.get('/getmanagerroles');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching manager roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch manager roles'
            };
        }
    },

    // Add category
    addCategory: async (category) => {
        try {
            // Send the name as is, backend will add MANAGER_ prefix
            const response = await axiosInstance.post('/addcategories', {
                name: category.name
            });
            return {
                success: true,
                data: response.data,
                message: 'Category added successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Add manager
    addManager: async (managerData) => {
        try {
            const response = await axiosInstance.post('/addmanager', {
                email: managerData.email,
                password: managerData.password,
                contact: managerData.contact,
                active: managerData.active,
                assigned: managerData.assigned // Full Role object
            });
            return {
                success: true,
                data: response.data,
                message: 'Manager added successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Update manager
    updateManager: async (managerData) => {
        try {
            const response = await axiosInstance.put('/updatemanager', {managerData});
            return {
                success: true,
                data: response.data,
                message: 'Manager updated successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get manager by email
    getManager: async (email) => {
        try {
            const response = await axiosInstance.post('/getmanager', { email });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching manager:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to fetch manager'
            };
        }
    },

    // Get all managers
    getAllManagers: async () => {
        try {
            const response = await axiosInstance.get('/getallmanagers');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete manager
    deleteManager: async (email) => {
        try {
            const response = await axiosInstance.put(`/deletemanager`,{email});
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Handle common errors
    handleError: (error) => {
        const errorDetails = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        };
        console.error('Error details:', errorDetails);
        
        if (error.response) {
            switch (error.response.status) {
                case 409:
                    return {
                        message: 'Category already exists',
                        status: 409
                    };
                case 403:
                    return {
                        message: 'Access denied. Please check your permissions.',
                        status: 403
                    };
                case 401:
                    return {
                        message: 'Authentication required. Please log in again.',
                        status: 401
                    };
                default:
                    return {
                        message: error.response.data || 'An error occurred',
                        status: error.response.status
                    };
            }
        }
        return {
            message: 'Network error occurred',
            status: 500
        };
    },

    generateReport: async (month, year) => {
        try {
            const response = await axiosInstance.post(
                '/generatereport',
                { month: Number(month), year: Number(year) }, // ✅ Send directly in body
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf',
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data instanceof Blob) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Report generated successfully'
                };
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to generate report'
            };
        }
    },

    // Get all suppliers
    getAllSuppliers: async () => {
        try {
            const response = await axiosInstance.get('/getsuppliers');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to fetch suppliers'
            };
        }
    },

    // Get supplier by name
    getSupplierByName: async (name) => {
        try {
            const response = await axiosInstance.post('/getsupplierbyname', {name});
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching supplier:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to fetch supplier'
            };
        }
    },

    // Add new supplier
    addSupplier: async (supplierData) => {
        try {
            const response = await axiosInstance.post('/addsupplier', supplierData);
            return {
                success: true,
                data: response.data,
                message: 'Supplier added successfully'
            };
        } catch (error) {
            console.error('Error adding supplier:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to add supplier'
            };
        }
    },

    // Update supplier
    updateSupplier: async (supplierData) => {
        try {
            
            const response = await axiosInstance.put('/updatesupplier', supplierData);
            return {
                success: true,
                data: response.data,
                message: 'Supplier updated successfully'
            };
        } catch (error) {
            console.error('Error updating supplier:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to update supplier'
            };
        }
    },

    // Delete supplier (deactivate)
    deleteSupplier: async (supplierId) => {
        try {
            const response = await axiosInstance.put('/deletesupplier', { id: supplierId });
            return {
                success: true,
                data: response.data,
                message: 'Supplier deactivated successfully'
            };
        } catch (error) {
            console.error('Error deactivating supplier:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to deactivate supplier'
            };
        }
    },

    // Get all customers
    getAllCustomers: async () => {
        try {
            const response = await axiosInstance.get('/getcustomers');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return adminService.handleError(error);
        }
    },

    // Get customer by name
    getCustomerByName: async (name) => {
        try {
            const response = await axiosInstance.get('/getcustomerbyname', {
                data: { name }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return adminService.handleError(error);
        }
    },

    // Add a new customer
    addCustomer: async (customerData) => {
        try {
            const response = await axiosInstance.post('/addcustomer', customerData);
            return {
                success: true,
                data: response.data,
                message: 'Customer added successfully'
            };
        } catch (error) {
            return adminService.handleError(error);
        }
    },

    // Update an existing customer
    updateCustomer: async (customerData) => {
        try {
            const response = await axiosInstance.put('/updatecustomer', customerData);
            return {
                success: true,
                data: response.data,
                message: 'Customer updated successfully'
            };
        } catch (error) {
            return adminService.handleError(error);
        }
    },

    // Delete a customer
    deleteCustomer: async (customerId) => {
        try {
            const response = await axiosInstance.put('/deletecustomer', { id: customerId });
            return {
                success: true,
                data: response.data,
                message: 'Customer deleted successfully'
            };
        } catch (error) {
            return adminService.handleError(error);
        }
    }
};

export default adminService; 
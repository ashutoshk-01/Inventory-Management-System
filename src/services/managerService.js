import axios from 'axios';

const API_URL = 'http://localhost:8080/manager';

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



const managerService = {
    // Employee Role Management
    getEmployeeRoles: async () => {
        try {
            const response = await axiosInstance.get('/getemployeeroles');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching employee roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch employee roles'
            };
        }
    },

    // Get Categories (uses same endpoint as getEmployeeRoles)
    getCategories: async () => {
        try {
            const response = await axiosInstance.get('/getemployeeroles');
            // Transform the response to show only category names without EMPLOYEE_ prefix
            const categories = response.data.map(role => ({
                id: role.id,
                name: role.name.replace('EMPLOYEE_', ''),
                addedby: role.addedby
            }));
            return {
                success: true,
                data: categories
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch categories'
            };
        }
    },

    // Add category (employee role)
    addCategory: async (category) => {
        try {
            // Send the name as is, backend will add EMPLOYEE_ prefix
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

    // Add employee
    addEmployee: async (employeeData) => {
        try {
            const response = await axiosInstance.post('/addemployee', employeeData);
            return {
                success: response.data === "Employee has been added",
                message: response.data === "Employee has been added" ? 
                    'Employee added successfully' : 'Failed to add employee',
                data: response.data
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Update employee
    updateEmployee: async (employeeData) => {
        try {
            const response = await axiosInstance.put('/updateEmployee', employeeData);
            return {
                success: response.data === "Employee has been updated",
                message: response.data === "Employee has been updated" ? 
                    'Employee updated successfully' : 'Failed to update employee',
                data: response.data
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get employee by email
    getEmployee: async (email) => {
        try {
            const response = await axiosInstance.post('/getemployee', { email });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching employee:', error);
            return {
                success: false,
                message: error.response?.data || 'Failed to fetch employee'
            };
        }
    },

    // Get all employees
    getAllEmployees: async () => {
        try {
            const response = await axiosInstance.get('/getallemployees');
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error('Error fetching employees:', error);
            if (error.response?.status === 404) {
                return {
                    success: true,
                    data: [],
                    message: 'No employees found'
                };
            }
            return {
                success: false,
                message: error.response?.data || 'Failed to fetch employees',
                data: []
            };
        }
    },

    // Delete (deactivate) employee
    deleteEmployee: async (email) => {
        try {
            const response = await axiosInstance.put('/deleteemployee', { email });
            return {
                success: true,
                data: response.data,
                message: 'Employee deactivated successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Handle common errors
    handleError: (error) => {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        if (error.response) {
            switch (error.response.status) {
                case 409:
                    return {
                        success: false,
                        message: 'Employee/Category already exists',
                        status: 409
                    };
                case 403:
                    return {
                        success: false,
                        message: 'Access denied. Please check your permissions.',
                        status: 403
                    };
                case 401:
                    return {
                        success: false,
                        message: 'Authentication required. Please log in again.',
                        status: 401
                    };
                case 400:
                    return {
                        success: false,
                        message: 'Invalid data format. Please check all fields.',
                        status: 400
                    };
                default:
                    return {
                        success: false,
                        message: error.response.data || 'An error occurred',
                        status: error.response.status
                    };
            }
        }
        return {
            success: false,
            message: 'Network error occurred',
            status: 500
        };
    },

    // Supplier Order Management
    addSupplierOrder: async (order) => {
        try {
            const response = await axiosInstance.post('/supplierorder/addorder', order);
            return {
                success: true,
                data: response.data,
                message: 'Order added successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    getSupplierOrders: async () => {
        try {
            const response = await axiosInstance.post('/supplierorder/getorders', {status: 'Pending'});
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data || 'Failed to fetch supplier orders'
            };
        }
    },

    updateSupplierOrderStatus: async (id, status) => {
        try {
            const response = await axiosInstance.put('/supplierorder/updatestatus', {
                id,
                status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
            });
            return {
                success: true,
                data: response.data,
                message: 'Order status updated successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Customer Order Management
    addCustomerOrder: async (order) => {
        try {
            const response = await axiosInstance.post('/customerorder/add', order);
            return {
                success: true,
                data: response.data,
                message: 'Order added successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    getCustomerOrders: async () => {
        try {
            const response = await axiosInstance.post('/customerorder/getorders', { status : 'Pending' });
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data || 'Failed to fetch customer orders'
            };
        }
    },

    updateCustomerOrderStatus: async (id, status) => {
        try {
            const response = await axiosInstance.put('/customerorder/updatestatus', {
                id,
                status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
            });
            return {
                success: true,
                data: response.data,
                message: 'Order status updated successfully'
            };
        } catch (error) {
            return handleError(error);
        }
    },

    // Payment Management
    getPayment: (id) => {
        return axiosInstance.post('/payment/getpayment', { id });
    },

    addPayment: (payment) => {
        const formattedPayment = {
            orderId: payment.orderId,
            amount: parseFloat(payment.amount || 0.0),
            orderType: payment.orderType, // "Supplier" or "Customer"
            status: payment.status || 'PENDING',
            paymentDate: payment.paymentDate || new Date().toISOString()
        };
        return axiosInstance.post('/payment/addpayment', formattedPayment);
    },

    updatePayment: (payment) => {
        const formattedPayment = {
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            amount: parseFloat(payment.amount || 0.0),
            orderType: payment.orderType,
            status: payment.status,
            paymentDate: payment.paymentDate
        };
        return axiosInstance.put('/payment/updatepayment', formattedPayment);
    },

    // Refill Management
    getRefills: (status) => {
        return axiosInstance.post('/refill/getrefills', { status });
    },

    updateRefill: (refill) => {
        const formattedRefill = {
            id: refill.id,
            status: refill.status,
            updateDate: new Date().toISOString()
        };
        return axiosInstance.put('/refill/updaterefill', formattedRefill);
    },

    generateReport: async (month, year) => {
        try {
            const response = await axiosInstance.post(
                '/generatereport',
                { month: Number(month), year: Number(year) }, 
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
    }
    
};

const handleError = managerService.handleError;

export default managerService;
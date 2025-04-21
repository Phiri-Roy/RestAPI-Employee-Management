// DOM Elements
const loginModal = document.getElementById('loginModal');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const employeeTableBody = document.getElementById('employeeTableBody');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// API URL
const API_URL = '/api';

// Token handling
let token = localStorage.getItem('token');

// Check authentication status
function checkAuth() {
    if (!token) {
        loginModal.style.display = 'flex';
        mainContent.style.display = 'none';
    } else {
        loginModal.style.display = 'none';
        mainContent.style.display = 'block';
        fetchEmployees();
    }
}

// Show toast message
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.classList.add('toast-show');
    toast.classList.remove('toast-hide');
    toast.style.backgroundColor = isError ? '#ef4444' : '#10b981';

    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
    }, 3000);
}

// API Calls with error handling
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
            body: data ? JSON.stringify(data) : null
        };

        console.log(`Making ${method} request to ${endpoint}:`, data);
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const result = await response.json();
        console.log(`Response from ${endpoint}:`, result);

        if (!response.ok) {
            if (result.errors) {
                throw new Error(result.errors.join('\n'));
            }
            throw new Error(result.message || 'Something went wrong');
        }

        if (result.message) {
            showToast(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, true);
        throw error;
    }
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(loginForm);
        const result = await apiCall('/login', 'POST', {
            username: formData.get('username'),
            password: formData.get('password')
        });

        token = result.token;
        localStorage.setItem('token', token);
        checkAuth();
        showToast('Login successful');
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    checkAuth();
    showToast('Logged out successfully');
});

// Fetch and display employees
async function fetchEmployees() {
    try {
        const result = await apiCall('/employees');
        displayEmployees(result.data);
    } catch (error) {
        console.error('Fetch employees error:', error);
    }
}

// Display employees in table
function displayEmployees(employees) {
    employeeTableBody.innerHTML = employees.map(employee => `
        <tr class="employee-row">
            <td class="px-6 py-4 whitespace-nowrap">${employee.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.department}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.role}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="editEmployee('${employee._id}')" class="text-blue-600 hover:text-blue-800 mr-3 action-button">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEmployee('${employee._id}')" class="text-red-600 hover:text-red-800 action-button">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Add employee button handler
addEmployeeBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add Employee';
    employeeForm.reset();
    employeeForm.removeAttribute('data-id');
    employeeModal.style.display = 'flex';
});

// Cancel button handler
cancelBtn.addEventListener('click', () => {
    employeeModal.style.display = 'none';
});

// Employee form submit handler
employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(employeeForm);
        const employeeData = {
            name: formData.get('name'),
            department: formData.get('department'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        const id = employeeForm.getAttribute('data-id');
        if (id) {
            // Update existing employee
            await apiCall(`/employees/${id}`, 'PUT', employeeData);
            showToast('Employee updated successfully');
        } else {
            // Create new employee
            await apiCall('/employees', 'POST', employeeData);
            showToast('Employee added successfully');
        }

        employeeModal.style.display = 'none';
        fetchEmployees();
    } catch (error) {
        console.error('Save employee error:', error);
    }
});

// Edit employee handler
async function editEmployee(id) {
    try {
        const result = await apiCall(`/employees/${id}`);
        const employee = result.data;

        modalTitle.textContent = 'Edit Employee';
        employeeForm.setAttribute('data-id', id);
        
        // Clear all form fields first
        employeeForm.reset();
        
        // Then set their values
        const fields = ['name', 'department', 'email', 'role'];
        fields.forEach(field => {
            const input = employeeForm.elements[field];
            input.value = employee[field];
            
            // Add click handler to select all text
            input.addEventListener('click', function() {
                this.select();
            });
        });

        employeeModal.style.display = 'flex';
    } catch (error) {
        console.error('Edit employee error:', error);
    }
}

// Delete employee handler
async function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            await apiCall(`/employees/${id}`, 'DELETE');
            showToast('Employee deleted successfully');
            fetchEmployees();
        } catch (error) {
            console.error('Delete employee error:', error);
        }
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === employeeModal) {
        employeeModal.style.display = 'none';
    }
});

// Initialize app
checkAuth();

// Signup form and toggle logic
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

showSignupBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    modalTitle.textContent = 'Sign Up';
});

showLoginBtn.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    modalTitle.textContent = 'Login';
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(signupForm);
        const signupData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const result = await apiCall('/signup', 'POST', signupData);
        token = result.token;
        localStorage.setItem('token', token);
        checkAuth();
        showToast('Signup successful');
    } catch (error) {
        console.error('Signup error:', error);
    }
});

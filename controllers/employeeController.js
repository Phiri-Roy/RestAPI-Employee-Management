/**
 * MongoDB data access placeholder
 * TODO: Replace with actual Mongoose model import and usage
 */
const Employee = require('../models/employeeModel');
const jwt = require('jsonwebtoken');

// Helper function to generate token
const generateToken = () => {
    return jwt.sign({ id: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Login controller - Simple implementation for demo
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Demo credentials (In production, this should be properly handled with database and password hashing)
        if (username === 'admin' && password === 'admin123') {
            const token = generateToken();
            res.json({
                success: true,
                token
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create employee
exports.createEmployee = async (req, res) => {
    try {
        console.log('Creating employee:', req.body);
        
        // Validate required fields
        const { name, department, email, role } = req.body;
        if (!name || !department || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, department, email, role'
            });
        }

        // Check for duplicate email
        const employees = await Employee.find();
        const emailExists = employees.some(emp => emp.email === email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const employee = await Employee.create(req.body);
        console.log('Employee created successfully:', employee);
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check for duplicate email if email is being updated
        if (req.body.email) {
            const employees = await Employee.find();
            const emailExists = employees.some(emp => 
                emp.email === req.body.email && emp._id !== req.params.id
            );
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const updatedEmployee = await Employee.findById(req.params.id);
        res.json({
            success: true,
            data: updatedEmployee
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

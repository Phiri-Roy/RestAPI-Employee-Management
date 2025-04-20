const express = require('express');
const router = express.Router();
const {
    login,
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');

// Public route
router.post('/login', login);

// Protected routes
router.use(auth);
router.route('/employees')
    .get(getEmployees)
    .post(createEmployee);

router.route('/employees/:id')
    .get(getEmployeeById)
    .put(updateEmployee)
    .delete(deleteEmployee);

module.exports = router;

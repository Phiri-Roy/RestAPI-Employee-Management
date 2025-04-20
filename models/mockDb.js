// Mock Database Class
class MockDatabase {
    constructor() {
        // Initialize with a default employee
        this.employees = [{
            _id: '1',
            name: 'Alice Johnson',
            department: 'Human Resources',
            email: 'alice.johnson@company.com',
            role: 'HR Manager',
            createdAt: new Date()
        }];
        this.counter = 1;
    }

    async create(data) {
        const id = ++this.counter;
        const employee = { _id: id.toString(), ...data, createdAt: new Date() };
        this.employees.push(employee);
        return employee;
    }
    
    async find() {
        return this.employees;
    }
    
    async findById(id) {
        return this.employees.find(emp => emp._id === id);
    }
    
    async findByIdAndUpdate(id, data) {
        const index = this.employees.findIndex(emp => emp._id === id);
        if (index === -1) return null;
        
        // Preserve _id and createdAt, update other fields
        this.employees[index] = {
            ...this.employees[index],
            ...data,
            _id: this.employees[index]._id,
            createdAt: this.employees[index].createdAt
        };
        return this.employees[index];
    }
    
    async findByIdAndDelete(id) {
        const index = this.employees.findIndex(emp => emp._id === id);
        if (index === -1) return null;
        const [employee] = this.employees.splice(index, 1);
        return employee;
    }
}

// Create and export mock database instance
module.exports = new MockDatabase();

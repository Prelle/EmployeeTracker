import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

connectToDb();

class ApiService {
    // Get a list of all departments
    async getDepartments(): Promise<QueryResult> {
        return await pool.query('SELECT id, name FROM departments ORDER BY id');
    };

    // Get a list of all roles along with their department and salary
    async getRoles(): Promise<QueryResult> {
        return await pool.query(`
            SELECT r.id, r.title, d.name as department, r.salary
            FROM roles r
            JOIN departments d ON r.department_id = d.id
            ORDER BY r.id`);
    };

    // Get a list of all employees along with their role, department, salary and manager (if any)
    async getEmployees(): Promise<QueryResult> {
        return await pool.query(`
            SELECT e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            JOIN departments d ON r.department_id = d.id
            LEFT JOIN employees m ON e.manager_id = m.id
            ORDER BY e.id`);
    };

    // Get a list of managers with at least one report
    async getManagers(): Promise<QueryResult> {
        return await pool.query(`
            SELECT DISTINCT e.id, e.first_name, e.last_name
            FROM employees e
            JOIN employees m ON e.id = m.manager_id
            ORDER BY e.id`);
    };

    // Get a list of all employees who report to a given manager
    async getEmployeesByManager(manager: number): Promise<QueryResult> {
        return await pool.query(`
            SELECT e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            JOIN departments d ON r.department_id = d.id
            WHERE e.manager_id = $1
            ORDER BY e.id`, [manager]);
    };

    // Add a new department with the given name
    async addDepartment(name: string): Promise<void> {
        await pool.query(`INSERT INTO departments (name) VALUES ($1)`, [name]);
    };

    // Add a new role to a department with the given title and salary
    async addRole(title: string, salary: number, department: number): Promise<void> {
        await pool.query(`INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)`, [title, salary, department]);
    };

    // Add a new employee with the given first name, last name, role and manager (if any)
    async addEmployee(firstName: string, lastName: string, role: number, manager: number | null): Promise<void> {
        await pool.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`,
            [firstName, lastName, role, manager]);
    };

    // Update an employee's role; return false if the employee wasn't found
    async updateEmployeeRole(employee: number, role: number): Promise<boolean> {
        const result = await pool.query(`UPDATE employees SET role_id = $1 WHERE id = $2`, [role, employee]);

        if (result.rowCount === 0) {
            return false;
        }

        return true;
    }
}

const apiService = new ApiService();
export default apiService;
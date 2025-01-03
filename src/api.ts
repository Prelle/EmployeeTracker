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
            LEFT JOIN roles r ON e.role_id = r.id
            LEFT JOIN departments d ON r.department_id = d.id
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
            LEFT JOIN roles r ON e.role_id = r.id
            LEFT JOIN departments d ON r.department_id = d.id
            WHERE e.manager_id = $1
            ORDER BY e.id`, [manager]);
    };

    // Get a list of all employees who belong to a given department
    async getEmployeesByDepartment(department: number): Promise<QueryResult> {
        return await pool.query(`
            SELECT e.id, e.first_name, e.last_name, r.title, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            LEFT JOIN employees m ON e.manager_id = m.id
            WHERE r.department_id = $1
            ORDER BY e.id`, [department]);
    };

    // Get a list of all employees who belong to a given role
    async getEmployeesByRole(role: number): Promise<QueryResult> {
        return await pool.query(`
            SELECT e.id, e.first_name, e.last_name, CONCAT(m.first_name, ' ', m.last_name) as manager
            FROM employees e            
            LEFT JOIN employees m ON e.manager_id = m.id
            WHERE e.role_id = $1
            ORDER BY e.id`, [role]);
    };

    // Get a list of roles belonging to a given department
    async getRolesByDepartment(department: number): Promise<QueryResult> {
        return await pool.query(`
            SELECT r.id, r.title, r.salary
            FROM roles r
            WHERE r.department_id = $1
            ORDER BY r.id`, [department]);
    }

    // Get the total utilized budgets of all departments
    async getDepartmentBudgets(): Promise<QueryResult> {
        return await pool.query(`
            SELECT d.id, d.name, SUM(r.salary) as utilized_budget
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            JOIN departments d ON r.department_id = d.id
            GROUP BY d.id, d.name
            ORDER BY d.id`);
    }

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

    // Update an employee's manager; return false if the employee wasn't found
    async updateEmployeeManager(employee: number, manager: number): Promise<boolean> {
        const result = await pool.query(`UPDATE employees SET manager_id = $1 WHERE id = $2`, [manager, employee]);

        if (result.rowCount === 0) {
            return false;
        }

        return true;
    }

    // Delete a department from the database; return false if the department wasn't found
    async deleteDepartment(department: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM departments WHERE id = $1`, [department]);

        if (result.rowCount === 0) {
            return false;
        }

        return true;
    }

    // Delete a role from the database; return false if the role wasn't found
    async deleteRole(role: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM roles WHERE id = $1`, [role]);

        if (result.rowCount === 0) {
            return false;
        }

        return true;
    }

    // Delete an employee record from the database; return false if the employee wasn't found
    async deleteEmployee(employee: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM employees WHERE id = $1`, [employee]);

        if (result.rowCount === 0) {
            return false;
        }

        return true;
    }
}

const apiService = new ApiService();
export default apiService;
import { QueryResult } from 'pg';
import ApiService from "./api.js";
import inquirer from "inquirer";
import colors from "colors";

class Cli {
  async mainMenu(): Promise<void> {
    while (true) {
      const result = await inquirer.prompt([
        {
          type: "list",
          name: "option",
          message: "What would you like to do?",
          choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            // "View Employees by Manager",
            // "View Employees by Department",
            // "View Department Utilized Budgets",
            "Add a Department",
            "Add a Role",
            "Add an Employee",
            "Update an Employee Role",
            // "Update an Employee Manager",
            // "Delete a Department",
            // "Delete a Role",
            // "Delete an Employee",
            "Quit",
          ],
        }]);

      switch (result.option) {
        case "View All Departments":
          await this.listDepartments();
          break;
        case "View All Roles":
          await this.listRoles();
          break;
        case "View All Employees":
          await this.listEmployees();
          break;
        case "View Employees by Manager":
          await this.viewEmployeesByManager();
          break;
        case "View Employees by Department":
          await this.viewEmployeesByDepartment();
          break;
        case "View Department Utilized Budgets":
          await this.viewDepartmentBudgets();
          break;
        case "Add a Department":
          await this.addDepartment();
          break;
        case "Add a Role":
          await this.addRole();
          break;
        case "Add an Employee":
          await this.addEmployee();
          break;
        case "Update an Employee Role":
          await this.updateEmployeeRole();
          break;
        case "Update an Employee Manager":
          await this.updateEmployeeManager();
          break;
        case "Delete a Department":
          await this.deleteDepartment();
          break;
        case "Delete a Role":
          await this.deleteRole();
          break;
        case "Delete an Employee":
          await this.deleteEmployee();
          break;
        case "Quit":
          console.log("Goodbye!");
          process.exit(0);
      }
    }
  };

  // Show the existing departments
  async listDepartments(): Promise<void> {
    try {
      const departments = await ApiService.getDepartments();
      this.showFormattedResults(departments);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  // Show the existing roles
  async listRoles(): Promise<void> {
    try {
      const roles = await ApiService.getRoles();
      this.showFormattedResults(roles);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  // Show the existing employees
  async listEmployees(): Promise<void> {
    try {
      const employees = await ApiService.getEmployees();
      this.showFormattedResults(employees);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  async viewEmployeesByManager(): Promise<void> { }
  async viewEmployeesByDepartment(): Promise<void> { }
  async viewDepartmentBudgets(): Promise<void> { }

  // Add a new department to the database
  async addDepartment(): Promise<void> {
    try {
      const result = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the department?",
        }
      ]);

      await ApiService.addDepartment(result.name);

      console.log(`Added ${result.name} to the database`);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  // Add a new role to the database
  async addRole(): Promise<void> {
    try {
      // Get the list of departments from the DB
      const departments = await ApiService.getDepartments();
      const departmentChoices = departments.rows.map((department: any) => ({
        name: department.name,
        value: department.id,
      }));

      const result = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "What is the name of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "department",
          message: "Which department does the role belong to?",
          choices: departmentChoices,
        }
      ]);

      await ApiService.addRole(result.title, result.salary, result.department);

      console.log(`Added ${result.title} to the database`);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  // Add a new employee to the database
  async addEmployee(): Promise<void> {
    try {
      // Get a list of roles from the DB
      const roles = await ApiService.getRoles();
      const roleChoices = roles.rows.map((role: any) => ({
        name: role.title,
        value: role.id
      }));

      // Get a list of employees for the manager field
      const employees = await ApiService.getEmployees();
      const managerChoices = [
        { name: "None", value: null }].concat(
          employees.rows.map((employee: any) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          })));

      const result = await inquirer.prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the employee's first name?",
        },
        {
          type: "input",
          name: "lastName",
          message: "What is the employee's last name?",
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: roleChoices,
        },
        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: managerChoices,
        },
      ]);

      await ApiService.addEmployee(result.firstName, result.lastName, result.role, result.manager);
      console.log(`Added ${result.firstName} ${result.lastName} to the database`);
    } catch (error: any) {
      console.log(colors.red(`ERROR: ${error.message}`));
    }
  }

  // Update an existing employee's role
  async updateEmployeeRole(): Promise<void> {
    // Get a list of employees from the DB
    const employees = await ApiService.getEmployees();
    const employeeChoices = employees.rows.map((employee: any) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    // Get a list of roles from the DB
    const roles = await ApiService.getRoles();
    const roleChoices = roles.rows.map((role: any) => ({
      name: role.title,
      value: role.id
    }));

    const result = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee's role do you want to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "role",
        message: "Which role do you want to assign the selected employee?",
        choices: roleChoices,
      }
    ]);

    const success = await ApiService.updateEmployeeRole(result.employee, result.role);
    if (success) {
      console.log("Updated employee's role");
    } else {
      console.log(colors.red("Employee not found"));
    }
  }

  async updateEmployeeManager(): Promise<void> { }
  async deleteDepartment(): Promise<void> { }
  async deleteRole(): Promise<void> { }
  async deleteEmployee(): Promise<void> { }

  // Output formatted results from a SQL QueryResult to the console
  showFormattedResults(results: QueryResult): void {
    if (results.rows.length === 0) {
      console.log("No results found.");
      return;
    }

    // Calculate maximum width for each column
    const columnWidths = results.fields.map(field => {
      const headerLength = field.name.length;
      const maxDataLength = results.rows.reduce((max, row) => {
        const value = row[field.name]?.toString() || '';
        return Math.max(max, value.length);
      }, 0);
      return Math.max(headerLength, maxDataLength);
    });

    // Create and output header
    const headerRow = results.fields.map((field, i) =>
      field.name.padEnd(columnWidths[i])
    ).join(' ');

    const dividerRow = columnWidths.map(width => '-'.repeat(width)).join(' ');

    console.log(headerRow);
    console.log(dividerRow);

    // Output rows
    for (const row of results.rows) {
      const output: string = '' + results.fields.map((field, i) => {
        const value = row[field.name]?.toString() || '';
        return value.padEnd(columnWidths[i]);
      }).join(' ');

      console.log(output);
    }
  }
}

const cli = new Cli();
export default cli;
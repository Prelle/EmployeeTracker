import { QueryResult } from 'pg';
import ApiService from "./api.js";
import inquirer from "inquirer";

class Cli {
  mainMenu(): void {
    inquirer.prompt([
      {
        type: "list",
        name: "option",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
          "Quit",
        ],
      }])
      .then(result => {
        switch (result.option) {
          case "View All Departments":
            this.listDepartments();
            break;
          case "View All Roles":
            this.listRoles();
            break;
          case "View All Employees":
            this.listEmployees();
            break;
          case "Add a Department":
            this.addDepartment();
            break;
          case "Add a Role":
            this.addRole();
            break;
          case "Add an Employee":
            this.addEmployee();
            break;
          case "Update an Employee Role":
            this.updateEmployeeRole();
            break;
          case "Quit":
            console.log("Goodbye!");
            process.exit(0);
        }
      })
  };

  // Show the existing departments
  listDepartments(): void {
    ApiService.getDepartments().then((departments) => {
      this.showFormattedResults(departments);
    }).catch((error) => {
      console.log(`ERROR: ${error.message}`);
    }).finally(() => this.mainMenu());
  }

  // Show the existing roles
  listRoles(): void {
    ApiService.getRoles().then((roles) => {
      this.showFormattedResults(roles);
    }).catch((error) => {
      console.log(`ERROR: ${error.message}`);
    }).finally(() => this.mainMenu());
  }

  // Show the existing employees
  listEmployees(): void {
    ApiService.getEmployees().then((employees) => {
      this.showFormattedResults(employees);
    }).catch((error) => {
      console.log(`ERROR: ${error.message}`);
    }).finally(() => this.mainMenu());
  }

  // Add a new department to the database
  addDepartment(): void {
    inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      }
    ])
      .then((result) => {
        ApiService.addDepartment(result.name).then(() => {
          console.log(`Added ${result.name} to the database`);
        }).catch((error) => {
          console.log(`ERROR: ${error.message}`);
        }).finally(() => this.mainMenu());
      });
  }

  // Add a new role to the database
  addRole(): void {
    // Get the list of departments from the DB
    ApiService.getDepartments().then((departments) => {
      const departmentChoices = departments.rows.map((department: any) => ({
        name: department.name,
        value: department.id,
      }));

      inquirer.prompt([
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
      ])
        .then((result) => {
          ApiService.addRole(result.title, result.salary, result.department).then(() => {
            console.log(`Added ${result.title} to the database`);
          }).catch((error) => {
            console.log(`ERROR: ${error.message}`);
          }).finally(() => this.mainMenu());
        });
    });
  }

  // Add a new employee to the database
  addEmployee(): void {
    // Get a list of roles from the DB
    ApiService.getRoles().then((roles) => {
      const roleChoices = roles.rows.map((role: any) => ({
        name: role.title,
        value: role.id
      }));

      // Get a list of employees for the manager field
      ApiService.getEmployees().then((employees) => {
        const managerChoices = [
          { name: "None", value: null }].concat(
            employees.rows.map((employee: any) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id
            })));

        inquirer.prompt([
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
        ])
          .then((result) => {
            ApiService.addEmployee(result.firstName, result.lastName, result.role, result.manager).then(() => {
              console.log(`Added ${result.firstName} ${result.lastName} to the database`);
            }).catch((error) => {
              console.log(`ERROR: ${error.message}`);
            }).finally(() => this.mainMenu());
          });
      });
    });
  }

  // Update an existing employee's role
  updateEmployeeRole(): void {
    // Get a list of employees and roles from the DB
    ApiService.getEmployees().then((employees) => {
      const employeeChoices = employees.rows.map((employee: any) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }));

      ApiService.getRoles().then((roles) => {
        const roleChoices = roles.rows.map((role: any) => ({
          name: role.title,
          value: role.id
        }));

        inquirer.prompt([
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
        ])
          .then((result) => {
            ApiService.updateEmployeeRole(result.employee, result.role).then((success) => {
              if (success) {
                console.log("Updated employee's role");
              } else {
                console.log("Employee not found");
              }
            }).catch((error) => {
              console.log(`ERROR: ${error.message}`);
            }).finally(() => this.mainMenu());
          });
      });
    });
  }

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
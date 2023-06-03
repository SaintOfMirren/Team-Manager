const inquirer = require('inquirer');
const mysql = require('mysql');
const consoleTable = require('console.table');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
  start();
});

// Start the application
function start() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          console.log('Connection closed.');
          break;
      }
    });
}

// Function to view all departments
function viewAllDepartments() {
  const sql = 'SELECT * FROM departments';
  connection.query(sql, (err, res) => {
    if (err) throw err;
    console.table('Departments', res);
    start();
  });
}

// Function to view all roles
function viewAllRoles() {
  const sql = `
    SELECT roles.id, roles.title, departments.name AS department, roles.salary
    FROM roles
    LEFT JOIN departments ON roles.department_id = departments.id
  `;
  connection.query(sql, (err, res) => {
    if (err) throw err;
    console.table('Roles', res);
    start();
  });
}

// Function to view all employees
function viewAllEmployees() {
  const sql = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(managers.first_name, ' ', managers.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees managers ON employees.manager_id = managers.id
  `;
  connection.query(sql, (err, res) => {
    if (err) throw err;
    console.table('Employees', res);
    start();
  });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt({
      name: 'name',
      type: 'input',
      message: 'Enter the name of the department:'
    })
    .then((answer) => {
      connection.query('INSERT INTO departments SET ?', { name: answer.name }, (err, res) => {
        if (err) throw err;
        console.log('Department added successfully!');
        start();
      });
    });
}

// Function to add a role
function addRole() {
  inquirer
    .prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary for the role:'
      },
      {
        name: 'departmentId',
        type: 'input',
        message: 'Enter the department ID for the role:'
      }
    ])
    .then((answer) => {
      connection.query(
        'INSERT INTO roles SET ?',
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId
        },
        (err, res) => {
          if (err) throw err;
          console.log('Role added successfully!');
          start();
        }
      );
    });
}

// Function to add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: 'firstName',
        type: 'input',
        message: "Enter the employee's first name:"
      },
      {
        name: 'lastName',
        type: 'input',
        message: "Enter the employee's last name:"
      },
      {
        name: 'roleId',
        type: 'input',
        message: "Enter the employee's role ID:"
      },
      {
        name: 'managerId',
        type: 'input',
        message: "Enter the employee's manager ID:"
      }
    ])
    .then((answer) => {
      connection.query(
        'INSERT INTO employees SET ?',
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: answer.roleId,
          manager_id: answer.managerId
        },
        (err, res) => {
          if (err) throw err;
          console.log('Employee added successfully!');
          start();
        }
      );
    });
}

// Function to update an employee role
function updateEmployeeRole() {
  inquirer
    .prompt([
      {
        name: 'employeeId',
        type: 'input',
        message: 'Enter the ID of the employee to update:'
      },
      {
        name: 'roleId',
        type: 'input',
        message: 'Enter the new role ID for the employee:'
      }
    ])
    .then((answer) => {
      connection.query(
        'UPDATE employees SET role_id = ? WHERE id = ?',
        [answer.roleId, answer.employeeId],
        (err, res) => {
          if (err) throw err;
          console.log('Employee role updated successfully!');
          start();
        }
      );
    });
}
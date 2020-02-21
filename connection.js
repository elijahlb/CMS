var express = require("express");
var mysql = require("mysql");
var app = express();
var inquirer = require("inquirer");
var consoleTable = require("console.table");


var PORT = process.env.PORT || 8080;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employees_db"
});

connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);
  });



inquirer
    .prompt([
    {
    type: "list",
    name: "searchparam",
    message: "Would you like to view, add, or update employees?", 
    choices: ['View', 'Add', 'Update']
  },
]).then(resultView => {
      var selection = resultView.searchparam;
      if (selection === "View") {
          connection.query("SELECT * FROM employee", function(err, res) {
              if (err) throw err;
              console.table(res);
            });
            connection.query("SELECT * FROM result", function(err, res) {
              if (err) throw err;
              console.table(res);
            });
      } else if (selection === "Add") {
          inquirer.prompt([
              {
                  type: "input",
                  name: "firstName",
                  message: "Enter employee's first name."
              },
              {
                type: "input",
                name: "lastName",
                message: "Enter employee's last name."
            },
            {
                type: "input",
                name: "roleId",
                message: "Enter employee's ID."
            },
            {
                type: "input",
                name: "managerId",
                message: "Enter employee's manager ID."
            },
            {
                type: "input",
                name: "departmentName",
                message: "Enter employee's department."
            },
            {
                type: "input",
                name: "salary",
                message: "Enter employee's salary."
            },
            {
                type: "input",
                name: "title",
                message: "Enter employee's title."
            },
          ]).then(resultAdd => {
            var firstName = resultAdd.firstName;
            var lastName = resultAdd.lastName;
            var role = resultAdd.roleId;
            var manager = resultAdd.managerId;
            var department = resultAdd.departmentName;
            var salary = resultAdd.salary;
            var title = resultAdd.title;

                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [firstName, lastName, role, manager], function(err, res) {
                    if (err) throw err;
                  });
                connection.query("INSERT INTO department (name) VALUES (?)", [department], function(err, res) {
                    if (err) throw err;
                  });
                connection.query("INSERT INTO role (salary, title) VALUES (?, ?)", [salary, title], function(err, res) {
                    if (err) throw err;
                  });
                connection.query ("DROP TABLE IF EXISTS result", function(err, res) {
                    if (err) throw err;
                  });
                connection.query ("CREATE TABLE result AS (SELECT role.title, role.salary, employee.first_name, employee.last_name FROM role INNER JOIN employee on role.id=employee.role_id)", function(err, res) {
                     if (err) throw err;
                   });
                   console.log("Employee added");
                
        }); 
      } else if (selection === "Update") {
        inquirer.prompt([
            {
              type: "list",
              name: "titleSalary",
              message: "Would you like to change the salary or title of an employee?", 
              choices: ['Title', 'Salary']
            },
        ]).then(resultUpdate => {
            var newUpdate = resultUpdate.titleSalary;

            if (newUpdate === 'Title') {
              inquirer.prompt([
                {
                    type: "input",
                    name: "titleChange",
                    message: "Enter the ID of the employee you'd like to change."
                },
                {
                  type: "input",
                  name: "titleChange2",
                  message: "Enter the employee's new title."
              },
              ]).then(lastMatch => {
                var ID = lastMatch.titleChange;
                var newTitle = lastMatch.titleChange2;
      
                connection.query("UPDATE role SET title = (?) WHERE id = (?)", [newTitle, ID], function(err, res) {
                  if (err) throw err;
                  connection.query("SELECT * FROM role", function(err, res) {
                    if (err) throw err;
                    console.table(res);
                  });
                });
              });
            } else if (newUpdate === 'Salary') {
              inquirer.prompt([
                {
                    type: "input",
                    name: "salaryChange",
                    message: "Enter the ID of the employee you'd like to change."
                },
                {
                  type: "input",
                  name: "salaryChange2",
                  message: "Enter the employee's new salary in decimal format."
              },
              ]).then(lastMatch2 => {
                var ID2 = lastMatch2.salaryChange;
                var newSalary = lastMatch2.salaryChange2;
      
                connection.query("UPDATE role SET salary = (?) WHERE id = (?)", [newSalary, ID2], function(err, res) {
                  if (err) throw err;
                  connection.query("SELECT * FROM role", function(err, res) {
                    if (err) throw err;
                    console.table(res);
                  });
                });
              });
            } 
            
        });
          
      }
});



app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
  });





  


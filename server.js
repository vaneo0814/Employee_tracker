const mysql = require("mysql");
const inquirer = require("inquirer");


// create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employee_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

//we will ask the user whether they want to add to the department section, the roles section or the employees section, view, or exit.
function start() {
    inquirer
        .prompt({
            name: "select",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Add department",
                "Add role",
                "Add employees",
                "Update employee role",
                "View all departments",
                "View all roles",
                "View all employees",
                "Exit"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.select === "Add department") {
                //create a function addDepartment
                addDepartment();
            }
            else if (answer.select === "Add role") {
                //create a function addRole
                addRole();
            } else if (answer.select === "Add employees") {
                //create a function called addEmployee
                addEmployee();
            } else if (answer.select === "Update employee role") {
                //create a function called viewEmployees
                updateEmployee();
            } else if (answer.select === "View all departments") {
                //create a function called viewDepartments
                viewDepartments();
            } else if (answer.select === "View all roles") {
                //create a function called viewRoles
                viewRoles();
            } else if (answer.select === "View all employees") {
                //create a function called viewEmployees
                viewEmployees();
            } else {
                connection.end();
            }
        });
}

//now we are going to make the functions that we are calling once the user selects their choice of adding to dept, role , or employee. 
function addDepartment() {
    // prompt user for info about the dept details:
    inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "What is the name of the department you would like to add?"
            },
        ]).then(function (answer) {
            // when finished prompting, insert a new dept into the db with that info
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.title,
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your department was created successfully.");
                    // re-prompt the user for if they want to add roles or employees as well
                    start();
                }
            );
        });
}

//function to add roles
function addRole() {
    // query the database for all departments
    //the question here is: which department does this role belong to?
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        //ask user role info
        inquirer
            .prompt([
                {
                    name: "title",
                    type: "input",
                    message: "What is the title of the role?"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "How much is the annual salary?"
                },
                {
                    name: "department",
                    type: "rawList",
                    message: "Which department does this role belong to?",
                    choices: function () {
                        let choicesArray = [];
                        res.forEach(res => {
                            //pushing in the department the user gave into the department name array.
                            choicesArray.push(
                                res.name
                            );
                        })
                        return choicesArray;
                    },
                }
            ]).then(function (answer) {
                const dept = answer.department;
                connection.query('SELECT * FROM department', function (err, res) {

                    if (err) throw (err);
                    let filteredDept = res.filter(function (res) {
                        return res.name == dept;
                    }
                    )
                    let id = filteredDept[0].id;
                    connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                        //remember that ? are like placeholders
                        [
                            answer.title,
                            parseInt(answer.salary),
                            id
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log(`You have added this role: ${(answer.title).toUpperCase()} successfully.`)
                        })
                    viewRoles()
                })
            })
    })
}

//function to add employees
function addEmployee() {
    // query the database for all roles
    //the question here is: which role does this employee belong to?
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        // once you have the role db, prompt the user for the employee db
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "first",
                    message: "What is the employee's first name?"
                },
                {
                    type: "input",
                    name: "last",
                    message: "What is the employee's last name?"
                },
                {
                    name: "role",
                    type: "rawList",
                    message: "Which role does the employee fall into?",
                    choices: function () {
                        let choicesArray = [];
                        res.forEach(res => {
                            //pushing in the department the user gave into the role title array.
                            choicesArray.push(
                                res.title
                            );
                        })
                        return choicesArray;
                    },
                }
            ]).then(function (answer) {
                const role = answer.role;
                connection.query('SELECT * FROM role', function (err, res) {

                    if (err) throw (err);
                    let filteredRole = res.filter(function (res) {
                        return res.title == role;
                    }
                    )
                    let id = filteredRole[0].id;
                    connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)",
                        //remember that ? are like placeholders
                        [
                            answer.first,
                            answer.last,
                            id
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log(`You have added this employee: ${(answer.first)} ${(answer.last)} successfully.`)
                        })
                    viewEmployees()
                })
            })
    })
}

function updateEmployee() {
    //grab the employee that the user wants to update
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "rawList",
                    message: "Which employee would you like to update? Please enter their last name.",
                    choices: function () {
                        chosenEmployee = [];
                        res.forEach(res => {
                            chosenEmployee.push(res.last_name);
                        })
                        return chosenEmployee;
                        ;
                    }
                }
            ])
            //now to get the id that the chosen employee from department...since role and department are interconnected.
            .then(function (answer) {
                //lets set a const with the chosen employee
                const changeEmployee = answer.employee;
                console.log("Changed Employee: " + changeEmployee);
                //get role db
                connection.query("SELECT * FROM role", function (err, res) { if(err) throw err;
                    inquirer
                        .prompt([
                            {
                                name: "newRole",
                                type: "rawList",
                                message: "What is this employees new role?",
                                choices: function () {
                                    newRole = [];
                                    res.forEach(res => {
                                        newRole.push(res.title);
                                        //push new role into the role title db
                                    })
                                    return newRole;

                                }
                            }
                        ])//push into query of Role
                        .then(function(update) {
                            //create another const
                            const updatedRole = update.newRole;
                            console.log("Updated Role: " + updatedRole);

                            connection.query('SELECT * FROM role WHERE title = ?', [updatedRole], function (err, res) {
                                if (err) throw (err);

                                //grab role id
                                let roleID = res[0].id;
                                console.log("ROLE id : " + roleID);

                                let params = [roleID, changeEmployee]
                                console.log(params);
                                 connection.query("UPDATE employee SET role_id = ? WHERE last_name = ?", params,
                                     function(err, res) {
                                         if (err) throw (err);
                                     console.log(`You have updated ${changeEmployee}'s role to ${updatedRole}.`)
                                    })
                                viewEmployees();

                            })
                        })
                })

            })
    })

}


//function to view all departments
function viewDepartments() {
    let query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(`DEPARTMENTS : `)
        console.table(res);
    });
    start();
}

//function to view all roles
function viewRoles() {
    let query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(`ROLES : `)
            console.table(res);
    });
    start();
}

//function to view all employees
function viewEmployees() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(`Employees : `);
       console.table(res);
        })

    start();
}


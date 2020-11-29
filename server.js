const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const RawListPrompt = require("inquirer/lib/prompts/rawlist");


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

async function updateEmployee() {
    //first we have to grab which employee they want to update
    //then we have to update the role 
    const employees = await viewEmployees();
    console.log(employees);
    const employeeChoices = employees.map(({id, first_name, last_name}) => ({
        name: `${first_name} ${last_name}`,
        value: id
    })
    )
    const { employeeID } = await inquirer.prompt([
                {
                    name: "employeeID",
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: employeeChoices
                }
            ])
    let roles = await viewRoles();
    let roleChoices = roles.map(({
        id,
        title
    }) => ({
        name: title,
        value: id
    }
        ));
    const { roleID } = await
        inquirer
            .prompt([
                {
                    name: "roleID",
                    type: "list",
                    message: "Which role do you want to assign to this employee",
                    choices: roleChoices
                }

            ])


            // connection.query("SELECT * FROM employee", function (err, res) {
            //     if (err) throw err;

            //now we have to get the role that the employee had and update the role db
            // .then(function (answer) {
            //     //grabbing the role now..
            //     connection.query("SELECT * FROM role", function (err, res) {
            //         inquirer
            //             .prompt([
            //                 {
            //                     type: "rawList",
            //                     name: "updateRole",
            //                     message: "What is this employees new role?",
            //                     choices: function () {
            //                         newRole = [];
            //                         res.forEach(res => {
            //                             newRole.push(res.title);
            //                         })
            //                         return newRole;
            //                     }
            //                 }
            //             ]).then(function (answer) {
            //                 console.log(answer);
            //             })
            //     })

            // })
}





//function to view all departments
function viewDepartments() {
    let query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(`DEPARTMENTS : `)
        res.forEach(department => {
            console.table(`ID: ${department.id} | Name: ${department.name}`)
        })
    });
    start();
}

//function to view all roles
function viewRoles() {
    let query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(`Roles : `)
        res.forEach(role => {
            console.table(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary} | Department ID: ${role.department_id}`);
        })
    });
    start();
}

//function to view all employees
function viewEmployees() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        if (err) throw err;
        //console.table(`Employees : `)
        res.forEach(employee => {
            console.table(`ID: ${employee.id} | Name: ${employee.first_name} ${employee.last_name} | Role_ID: ${employee.role_id}`);
        })
    });
    start();
}


USE employee_db;
-- inserting department data into the department table -- 
INSERT into department (name) 
VALUES ("Communications");

INSERT into department (name) 
VALUES ("Exhibitions");

INSERT into department (name) 
VALUES ("Finance");

SELECT * FROM department;

-- inserting role data into the role table -- 

INSERT into role (title, salary, department_id) 
VALUES ("Digital Media", 65000, 1);

INSERT into role (title, salary, department_id) 
VALUES ("Art Handling", 70000, 2);

INSERT into role (title, salary, department_id) 
VALUES ("Accounting", 85000, 3);

SELECT * FROM role;

-- inserting employee data into the employee table -- 

INSERT into employee (first_name, last_name, role_id)
VALUES ("Martin", "Scott", 1);
 
INSERT into employee (first_name, last_name, role_id) 
VALUES ("Jeanna", "Gonzalez", 2);

INSERT into employee (first_name, last_name, role_id)
VALUES ("Gabrielle", "Castillo", 2);

SELECT * FROM employee;
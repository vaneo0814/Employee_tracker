CREATE DATABASE employee_db;
DROP DATABASE IF EXISTS employee_db;
USE employee_db;

-- create columns --
CREATE TABLE department (
name varchar(30) not null,
id int auto_increment not null,
PRIMARY KEY (id)
);

CREATE TABLE role (
title varchar(30) not null,
salary decimal (50,2) not null,
id int auto_increment not null,
department_id int,
-- references department(id) is the parent that are going to be referencing for the department_id
FOREIGN KEY (department_id) REFERENCES department(id),
PRIMARY KEY (id)
);

CREATE TABLE employee (
first_name varchar(30) not null,
last_name varchar(30) not null,
id int auto_increment not null,
PRIMARY KEY (id),
role_id int,
-- reference role position for employee
FOREIGN KEY (role_id) REFERENCES role(id)
);

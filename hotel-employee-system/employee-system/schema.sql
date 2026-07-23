-- employee-system/schema.sql
-- Run this on the Employee System's MySQL instance (pc2 / webserver 2).

CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    position    VARCHAR(100) DEFAULT NULL
);

-- Seed a few employees so the Hotel System's dropdown has something to show.
INSERT INTO employees (name, position) VALUES
('Delmart Benjamin Asensi', 'Front Desk Officer'),
('Pama James',              'Front Desk Officer'),
('Jed Cyrus Sero',          'Duty Manager'),
('Anne Gwapa',              'Front Desk Officer');

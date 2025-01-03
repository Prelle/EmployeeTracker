INSERT INTO departments (name)
VALUES  ('Customer Service'),
        ('Information Technology'),
        ('Human Resources'),        
        ('Legal');

INSERT INTO roles (title, salary, department_id)
VALUES  ('CS Manager', 60000, 1),
        ('CS Representative', 45000, 1),
        ('Development Manager', 125000, 2),
        ('Software Engineer', 92000, 2),
        ('QA Manager', 80000, 2),
        ('QA Specialist', 50000, 2),
        ('HR Manager', 55000, 3),
        ('HR Specialist', 38000, 3),
        ('Legal Counsel', 95000, 4),
        ('Paralegal', 35000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Kevin', 'Harding', 1, NULL),
        ('Janet', 'Baker', 2, 1),
        ('Bobby', 'Eastwood', 2, 1),
        ('Evelyn', 'Black', 3, NULL),
        ('Stephen', 'Greenwood', 4, 4),
        ('Francis', 'Schumacher', 4, 4),
        ('Victor', 'Simmons', 5, NULL),
        ('Kevin', 'Davidson', 6, 7),
        ('Gertrude', 'Wood', 7, NULL),
        ('Sean', 'Martin', 8, 9),
        ('Max', 'Petersen', 9, NULL);
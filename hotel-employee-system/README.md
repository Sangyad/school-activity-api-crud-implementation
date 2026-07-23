# Hotel System ↔ Employee System

A recreation of the whiteboard diagram: two independent systems talking to
each other over HTTP.

```
 hotel sys (pc1 / webserver 1)          employee sys (pc2 / webserver 2)
 ┌───────────────────────┐              ┌───────────────────────┐
 │ index.html (form)     │   fetch      │ get_employees.php     │
 │ create_reservation.php│ <──────────  │  → JSON employee list │
 │ hotel_db              │  employees   │ employee_db           │
 └───────────────────────┘              └───────────────────────┘
        │   Create → Store
        ▼
   reservations table
```

- The Hotel System never has its own copy of employee data. Its frontend
  asks the Employee System's API for the current list every time the
  "New reservation" form loads (the green arrow in the sketch).
- Picking an employee auto-fills **employee name** and **employee id** —
  the two fields from the reservation list that were called out separately
  because they don't originate in the Hotel System.
- Submitting the form is the **Create** step; `create_reservation.php`
  **Store**s the row in `hotel_db` (the red arrows).

## Folder structure

```
hotel-employee-system/
├── employee-system/           pc2 / webserver 2
│   ├── db_config.php
│   ├── get_employees.php      → returns all employees as JSON
│   └── schema.sql
└── hotel-system/               pc1 / webserver 1
    ├── db_config.php
    ├── create_reservation.php  → the "Create" / "Store" function
    ├── list_reservations.php   → lets the frontend show what's stored
    ├── schema.sql
    ├── index.html
    ├── css/style.css
    └── js/script.js
```

## 1. Set up the two databases

You can use one local MySQL server for both — they're still logically
separate databases, which is enough to demonstrate the two systems.
(If you want two truly separate MySQL instances, e.g. two Docker
containers or two VMs, just point each `db_config.php` at the right
host/port.)

```bash
mysql -u root -p < employee-system/schema.sql
mysql -u root -p < hotel-system/schema.sql
```

Then open both `db_config.php` files and fill in your real MySQL
username/password (both default to `root` / empty password, which is
the common XAMPP/WAMP default).

## 2. Run the two "web servers"

Simulate pc1 and pc2 as two servers on two different ports using PHP's
built-in server:

```bash
# Terminal 1 — Employee System (pc2 / webserver 2)
cd employee-system
php -S localhost:8001

# Terminal 2 — Hotel System (pc1 / webserver 1)
cd hotel-system
php -S localhost:8000
```

(Prefer XAMPP/WAMP/MAMP instead? Drop each folder into `htdocs` as its
own virtual host or subfolder, and update `EMPLOYEE_API_URL` in
`hotel-system/js/script.js` to match wherever `get_employees.php` ends up.)

## 3. Try it

1. Open `http://localhost:8000` — this is the Hotel System frontend.
2. The **Employee name** dropdown should populate itself from
   `http://localhost:8001/get_employees.php`.
3. Pick an employee — **Employee ID** auto-fills.
4. Fill in customer name, check-in, check-out, and click **Create reservation**.
5. The right-hand panel re-fetches `list_reservations.php` and shows the
   new row — proof the record actually landed in `hotel_db`.

## Checklist mapped to the guide

- [x] Hotel System created (`hotel-system/`)
- [x] Hotel System frontend (`index.html`, `css/`, `js/`)
- [x] Hotel System connected to a database via `db_config.php`
- [x] Hotel database with a `reservations` table (customer name, check
      in, check out, employee name, employee id)
- [x] Create function (`create_reservation.php`) working end to end
- [x] Employee System database (`employee_db.employees`)
- [x] PHP script returning all employees as JSON (`get_employees.php`)
- [x] Frontend script populating the employee dropdown from that API
- [x] Create function running with the dropdown fed live by the
      Employee System's API

## Troubleshooting

### Common issues (Windows and Linux)

#### Operating System: Windows / Linux
- Problem: `php -S localhost:8000` or `php -S localhost:8001` returns an error or the browser cannot connect.
- Cause: The wrong PHP executable is used, or the port is already occupied.
- Solution:
  1. Confirm the PHP binary in use:
     ```bash
     which php
     php -v
     ```
  2. If using XAMPP/WAMP on Windows, use the bundled PHP binary instead of the system PHP.
  3. If using XAMPP on Linux, use:
     ```bash
     /opt/lampp/bin/php -S localhost:8000
     /opt/lampp/bin/php -S localhost:8001
     ```
  4. If the port is already in use, free it before restarting:
     - Linux:
       ```bash
       ss -ltnp | grep -E ':(8000|8001)'
       kill <PID>
       ```
     - Windows (PowerShell):
       ```powershell
       netstat -ano | findstr ":8000"
       Stop-Process -Id <PID>
       ```
- Verification:
  - Visit `http://localhost:8000` and `http://localhost:8001/get_employees.php`.
  - The first should return the hotel frontend, the second should return JSON.

#### Operating System: Windows / Linux
- Problem: The browser shows `ERR_CONNECTION_REFUSED` for `http://localhost:8001/get_employees.php`.
- Cause: The Employee System server is not running, or CORS is blocked in the browser.
- Solution:
  1. Start the Employee System server from the `employee-system` folder.
  2. Ensure the server is running on port `8001`.
  3. If using Apache or a different port, update `hotel-system/js/script.js`:
     ```js
     const EMPLOYEE_API_URL = "http://localhost:8001/get_employees.php";
     ```
- Verification:
  - Open `http://localhost:8001/get_employees.php` directly and verify JSON appears.

### Windows-specific issues

#### Operating System: Windows
- Problem: `php` command is not found.
- Cause: PHP is not in the system PATH, or the bundled XAMPP/WAMP PHP is not used.
- Solution:
  1. Open the XAMPP/WAMP shell or add PHP to PATH.
  2. Use the full path to `php.exe` when starting servers.
  3. Example (XAMPP):
     ```powershell
     cd C:\xampp\htdocs\hotel-employee-system\employee-system
     C:\xampp\php\php.exe -S localhost:8001

     cd C:\xampp\htdocs\hotel-employee-system\hotel-system
     C:\xampp\php\php.exe -S localhost:8000
     ```
- Verification:
  - `php -v` should print the bundled PHP version, and the app ports should respond.

#### Operating System: Windows
- Problem: phpMyAdmin cannot be reached at `http://localhost/phpmyadmin/`.
- Cause: Apache is not running or the virtual host path is wrong.
- Solution:
  1. Start Apache from the XAMPP/WAMP control panel.
  2. Ensure the project is in the correct `htdocs` folder. For XAMPP, the path should be `C:\xampp\htdocs\hotel-employee-system`.
  3. If the folder is not in `htdocs`, move it there or configure the web server alias.
- Verification:
  - Open `http://localhost/phpmyadmin/` and verify the login page loads.

### Linux-specific issues

#### Operating System: Linux
- Problem: `mysqli` class not found when running the PHP development server.
- Cause: The built-in `php` command is using a system PHP install without MySQL support.
- Solution:
  1. Use the bundled XAMPP PHP binary:
     ```bash
     /opt/lampp/bin/php -S localhost:8001
     /opt/lampp/bin/php -S localhost:8000
     ```
  2. If you want the system PHP to work, install the mysqli extension:
     ```bash
     sudo apt install php-mysqli
     ```
     or the appropriate package for your distribution.
- Verification:
  - Run:
    ```bash
    /opt/lampp/bin/php -r 'var_dump(class_exists("mysqli"));'
    ```
  - It should return `bool(true)`.

#### Operating System: Linux
- Problem: Database schema commands fail because `mysql` is not found.
- Cause: The system does not have the MySQL client in PATH, or XAMPP uses a separate binary.
- Solution:
  1. Use the XAMPP MySQL client:
     ```bash
     /opt/lampp/bin/mysql -u root -p < employee-system/schema.sql
     /opt/lampp/bin/mysql -u root -p < hotel-system/schema.sql
     ```
  2. If you want `mysql` in PATH, add it to your shell profile.
- Verification:
  - Run:
    ```bash
    /opt/lampp/bin/mysql -u root -e "SHOW DATABASES LIKE 'employee_db';"
    ```
  - It should show the imported database.

### Verification summary

- `http://localhost:8000` loads the Hotel System frontend.
- `http://localhost:8001/get_employees.php` returns employee JSON.
- `http://localhost/phpmyadmin/` loads phpMyAdmin when using Apache.
- The appropriate PHP binary returns `bool(true)` for `mysqli`.


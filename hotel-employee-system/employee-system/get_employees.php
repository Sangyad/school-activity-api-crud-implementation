<?php
/**
 * employee-system/get_employees.php
 *
 * pc2 / webserver 2 — the API the Hotel System calls to populate its
 * "employee name" dropdown. This is the green "fetch" arrow in the
 * diagram: the Hotel System pulls employee data from here, it never
 * stores its own copy of the employee list.
 */

require "db_config.php";

// The Hotel System's frontend runs on a different origin/port, so it
// needs CORS enabled to be allowed to fetch this endpoint from JS.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$result = $conn->query("SELECT employee_id, name, position FROM employees ORDER BY name");

$employees = [];
while ($row = $result->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode($employees);

$conn->close();

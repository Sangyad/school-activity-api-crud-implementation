<?php
/**
 * employee-system/db_config.php
 *
 * pc2 / webserver 2 — connection settings for the Employee System's own
 * database. This is a completely separate system from the Hotel System;
 * it never talks to hotel_db directly. The Hotel System only ever reaches
 * this system through get_employees.php over HTTP.
 */

$db_host = "127.0.0.1";
$db_port = 3306;   // change if this system's MySQL runs on a different port than the hotel one
$db_user = "root";
$db_pass = "";
$db_name = "employee_db";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);

if ($conn->connect_error) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode(["error" => "Employee DB connection failed: " . $conn->connect_error]);
    exit();
}

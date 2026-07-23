<?php
/**
 * hotel-system/db_config.php
 *
 * pc1 / webserver 1 — connection settings for the Hotel System's own
 * database (hotel_db). Only the Hotel System reads/writes this database.
 */

$db_host = "127.0.0.1";
$db_port = 3306;
$db_user = "root";
$db_pass = "";
$db_name = "hotel_db";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);

if ($conn->connect_error) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode(["error" => "Hotel DB connection failed: " . $conn->connect_error]);
    exit();
}

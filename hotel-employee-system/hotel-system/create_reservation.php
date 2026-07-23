<?php
/**
 * hotel-system/create_reservation.php
 *
 * pc1 / webserver 1 — the "Create" function from the diagram. Takes the
 * reservation submitted by the frontend (including the employee name/id
 * that were fetched from the Employee System) and "Store"s it in hotel_db.
 */

require "db_config.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$customer_name = trim($data["customer_name"] ?? "");
$check_in      = trim($data["check_in"] ?? "");
$check_out     = trim($data["check_out"] ?? "");
$employee_name = trim($data["employee_name"] ?? "");
$employee_id   = intval($data["employee_id"] ?? 0);

if (!$customer_name || !$check_in || !$check_out || !$employee_name || !$employee_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "All fields are required."]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO reservations (customer_name, check_in, check_out, employee_name, employee_id)
     VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("ssssi", $customer_name, $check_in, $check_out, $employee_name, $employee_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "reservation_id" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();

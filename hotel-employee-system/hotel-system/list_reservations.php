<?php
/**
 * hotel-system/list_reservations.php
 *
 * pc1 / webserver 1 — returns everything currently stored in hotel_db so
 * the frontend can show that "Create" really did "Store" the record.
 */

require "db_config.php";

header("Content-Type: application/json");

$result = $conn->query("SELECT * FROM reservations ORDER BY created_at DESC");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode($rows);

$conn->close();

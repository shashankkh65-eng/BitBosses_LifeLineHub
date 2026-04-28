<?php
$conn = new mysqli("localhost", "root", "", "lifeline_hub", 3307);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
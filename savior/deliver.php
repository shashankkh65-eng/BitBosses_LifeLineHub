<?php
include("../config/db.php");

$id=$_GET['id'];

$conn->query("UPDATE donation SET status='Delivered' WHERE donation_id='$id'");

header("Location: dashboard.php");
?>
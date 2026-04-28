<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['savior_id'])) {
    header("Location: ../auth/savior_login.php");
    exit();
}

echo "<h2>Welcome Savior: ".$_SESSION['savior_name']."</h2>";

// Show donations
$result = $conn->query("SELECT * FROM donation");

echo "<h3>Pending Deliveries</h3>";

while($row = $result->fetch_assoc()) {
    echo "<div style='border:1px solid #ccc; padding:10px; margin:10px;'>
            <p>Donor: ".$row['donor_id']."</p>
            <p>Organisation ID: ".$row['org_id']."</p>
            <p>Category: ".$row['category']."</p>
            <p>Amount: ₹".$row['amount']."</p>

            <a href='deliver.php?id=".$row['donation_id']."'>
                <button>Mark as Delivered</button>
            </a>
          </div>";
}
?>
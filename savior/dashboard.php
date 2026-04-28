<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['savior_id'])){
    header("Location: ../auth/index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Savior Dashboard</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>

<body>

<div class="navbar">
    <h2>Life-Line Hub - Savior</h2>
</div>

<div style="margin:10px;">
    <a href="../auth/index.php"><button>Home</button></a>
    <a href="../logout.php"><button>Logout</button></a>
</div>

<div class="container">

<h3>Pending Deliveries</h3>

<?php
$res = $conn->query("SELECT * FROM donation WHERE status='Pending'");

while($r = $res->fetch_assoc()){
    echo "
    <div class='card'>
        <p><b>Donor:</b> {$r['donor_id']}</p>
        <p><b>Amount:</b> ₹{$r['amount']}</p>

        <a href='deliver.php?id={$r['donation_id']}'>
            <button>Mark Delivered</button>
        </a>
    </div>
    ";
}
?>

</div>

</body>
</html>
<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['donor_id'])){
header("Location: ../auth/index.php");
exit();
}

$donor_id=$_SESSION['donor_id'];
?>

<h2>Welcome <?php echo $donor_id;?></h2>

<a href="../logout.php">Logout</a>

<h3>Organisations</h3>

<?php
<link rel="stylesheet" href="../assets/css/style.css">
$res=$conn->query("SELECT * FROM organisation");

while($row=$res->fetch_assoc()){

$org_id=$row['org_id'];

$check=$conn->query("SELECT * FROM donation 
WHERE donor_id='$donor_id' AND org_id='$org_id'
ORDER BY date DESC LIMIT 1");

$status="No Donation";
if($check->num_rows>0){
$d=$check->fetch_assoc();
$status=$d['status'];
}

echo "
<div>
<h3>{$row['name']}</h3>
<p>Status: $status</p>
<a href='donate.php?org_id=$org_id'>Donate</a>
</div>
";
}
?>
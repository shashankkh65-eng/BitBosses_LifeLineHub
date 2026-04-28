<?php
session_start();

if(!isset($_SESSION['org_id'])){
header("Location: ../auth/index.php");
exit();
}
<link rel="stylesheet" href="../assets/css/style.css">
echo "Welcome ".$_SESSION['org_name'];
?>
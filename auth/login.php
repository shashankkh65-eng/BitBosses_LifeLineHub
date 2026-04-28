<?php
session_start();
include("../config/db.php");

if(isset($_POST['login'])) {

    $donor_id = $_POST['donor_id'];
    $password = $_POST['password'];

    $result = $conn->query("SELECT * FROM donor WHERE donor_id='$donor_id'");
    $user = $result->fetch_assoc();

    if($user && password_verify($password, $user['password'])) {
        $_SESSION['donor_id'] = $donor_id;
        header("Location: ../donor/dashboard.php");
    } else {
        echo "<script>alert('Invalid ID or Password');</script>";
    }
}
?>

<h2>Login</h2>
<form method="POST">
    <input type="text" name="donor_id" placeholder="Donor ID" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="login">Login</button>
</form>
<?php
session_start();
include("../config/db.php");

if(isset($_POST['login'])) {

    $name = $_POST['name'];
    $password = $_POST['password'];

    $result = $conn->query("SELECT * FROM organisation WHERE name='$name'");
    $org = $result->fetch_assoc();

    if($org && password_verify($password, $org['password'])) {
        $_SESSION['org_id'] = $org['org_id'];
        $_SESSION['org_name'] = $org['name'];

        header("Location: ../organisation/dashboard.php");
    } else {
        echo "<script>alert('Invalid Login');</script>";
    }
}
?>

<h2>Organisation Login</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Organisation Name" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="login">Login</button>
</form>
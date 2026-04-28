<?php
session_start();
include("../config/db.php");

if(isset($_POST['login'])) {

    $name = $_POST['name'];
    $password = $_POST['password'];

    $result = $conn->query("SELECT * FROM savior WHERE name='$name'");
    $user = $result->fetch_assoc();

    if($user && password_verify($password, $user['password'])) {
        $_SESSION['savior_id'] = $user['savior_id'];
        $_SESSION['savior_name'] = $user['name'];

        header("Location: ../savior/dashboard.php");
    } else {
        echo "<script>alert('Invalid Login');</script>";
    }
}
?>

<h2>Savior Login</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Name" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="login">Login</button>
</form>
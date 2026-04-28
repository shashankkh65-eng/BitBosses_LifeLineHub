<?php
include("../config/db.php");

if(isset($_POST['register'])) {

    $name = $_POST['name'];
    $phone = $_POST['phone'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $conn->query("INSERT INTO savior (name, phone, password)
                  VALUES ('$name','$phone','$password')");

    echo "<script>alert('Savior Registered'); window.location='savior_login.php';</script>";
}
?>

<h2>Savior Signup</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Name" required><br><br>
    <input type="text" name="phone" placeholder="Phone" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="register">Register</button>
</form>
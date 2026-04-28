<?php
include("../config/db.php");

if(isset($_POST['register'])) {

    $name = $_POST['name'];
    $location = $_POST['location'];
    $needs = $_POST['needs'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $conn->query("INSERT INTO organisation (name, location, needs, password)
                  VALUES ('$name','$location','$needs','$password')");

    echo "<script>alert('Organisation Registered'); window.location='org_login.php';</script>";
}
?>

<h2>Organisation Signup</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Organisation Name" required><br><br>
    <input type="text" name="location" placeholder="Location" required><br><br>
    <input type="text" name="needs" placeholder="Needs (Food, Clothes...)" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="register">Register</button>
</form>
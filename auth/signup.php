<?php
include("../config/db.php");

if(isset($_POST['register'])) {

    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Generate unique donor ID
    $donor_id = "DONOR" . rand(100000,999999);

    $sql = "INSERT INTO donor (donor_id, name, email, phone, password)
            VALUES ('$donor_id', '$name', '$email', '$phone', '$password')";

    if($conn->query($sql)) {
        echo "<script>alert('Registered! Your ID: $donor_id'); window.location='login.php';</script>";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>

<h2>Signup</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Full Name" required><br><br>
    <input type="email" name="email" placeholder="Email" required><br><br>
    <input type="text" name="phone" placeholder="Phone" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button name="register">Register</button>
</form>
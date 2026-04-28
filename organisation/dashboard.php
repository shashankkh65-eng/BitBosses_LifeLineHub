<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['org_id'])) {
    header("Location: ../auth/org_login.php");
    exit();
}

$org_name = $_SESSION['org_name'];
?>

<h2>Welcome Organisation: <?php echo $org_name; ?></h2>

<h3>Raise Emergency Request</h3>

<form method="POST">
    <input type="text" name="message" placeholder="Enter emergency need" required><br><br>
    <button name="submit">Submit</button>
</form>

<?php
if(isset($_POST['submit'])) {

    $message = $_POST['message'];

    $conn->query("INSERT INTO emergency (org_name, location, message)
                  VALUES ('$org_name', 'Bangalore', '$message')");

    echo "<p style='color:green;'>Emergency Added!</p>";
}
?>
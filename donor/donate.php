<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['donor_id'])) {
    header("Location: ../auth/login.php");
    exit();
}

$donor_id = $_SESSION['donor_id'];
$org_id = $_GET['org_id'];

// Fetch organisation
$org = $conn->query("SELECT * FROM organisation WHERE org_id='$org_id'")->fetch_assoc();

// Handle form submission
if(isset($_POST['donate'])) {

    $category = $_POST['category'];
    $amount = $_POST['amount'];

    // File upload
    $proof = $_FILES['proof']['name'];
    $temp = $_FILES['proof']['tmp_name'];

    move_uploaded_file($temp, "../uploads/".$proof);

    $conn->query("INSERT INTO donation (donor_id, org_id, category, amount, proof_image)
                  VALUES ('$donor_id','$org_id','$category','$amount','$proof')");

    echo "<script>alert('Donation recorded successfully'); window.location='dashboard.php';</script>";
}
?>

<h2>Donate to <?php echo $org['name']; ?></h2>

<form method="POST" enctype="multipart/form-data">

    <label>Donation Type:</label><br>
    <select name="category" required>
        <option value="Food">Food</option>
        <option value="Groceries">Groceries</option>
        <option value="Clothes">Clothes</option>
    </select><br><br>

    <label>Donation Amount:</label><br>
    <select name="amount" required>
        <option value="450">Feed 3 people (₹150 each)</option>
        <option value="1000">Groceries for 5 people (₹1000)</option>
        <option value="2000">Healthcare Support</option>
    </select><br><br>

    <label>Upload Payment Proof:</label><br>
    <input type="file" name="proof" required><br><br>

    <button name="donate">Submit Donation</button>
</form>

<hr>

<h3>Payment Details</h3>
<p><b>UPI:</b> example@upi</p>
<p><b>Account No:</b> 1234567890</p>
<p><b>IFSC:</b> ABCD0123456</p>
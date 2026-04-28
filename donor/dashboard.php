<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['donor_id'])) {
    header("Location: ../auth/login.php");
    exit();
}

$donor_id = $_SESSION['donor_id'];
?>

<link rel="stylesheet" href="../assets/css/style.css">

<div class="header">
    <h2>Life-Line Hub</h2>
    <p>Welcome, <?php echo $donor_id; ?></p>
</div>

<div class="container">

    <!-- 🔴 Emergency Section -->
    <div class="emergency">
    <h3>🚨 Emergency Requests</h3>

    <?php
    $emergency = $conn->query("SELECT * FROM emergency ORDER BY created_at DESC");

    while($row = $emergency->fetch_assoc()) {
        echo "<p><b>".$row['org_name']."</b> - ".$row['message']." (".$row['location'].")</p>";
    }
    ?>
</div>
    <!-- 🔍 Search -->
    <form method="GET">
        <input type="text" name="search" placeholder="Search organisation...">
        <button type="submit">Search</button>
    </form>

    <h3>Available Organisations</h3>

<?php
$search = isset($_GET['search']) ? $_GET['search'] : "";

$query = "SELECT * FROM organisation WHERE name LIKE '%$search%'";
$result = $conn->query($query);

while($row = $result->fetch_assoc()) {
    echo "<div class='card'>
            <h3>".$row['name']."</h3>
            <p><b>Location:</b> ".$row['location']."</p>
            <p><b>Needs:</b> ".$row['needs']."</p>
            <a href='donate.php?org_id=".$row['org_id']."'>
                <button>Donate</button>
            </a>
          </div>";
}
?>

</div>
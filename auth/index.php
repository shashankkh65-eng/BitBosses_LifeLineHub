<?php
session_start();
include("../config/db.php");

if(isset($_POST['login'])){
$role=$_POST['role']; $id=$_POST['id']; $pass=$_POST['password'];

if($role=="donor"){
$res=$conn->query("SELECT * FROM donor WHERE donor_id='$id'");
$u=$res->fetch_assoc();
if($u && password_verify($pass,$u['password'])){
$_SESSION['donor_id']=$u['donor_id'];
header("Location: ../donor/dashboard.php");
}
}

if($role=="organisation"){
$res=$conn->query("SELECT * FROM organisation WHERE name='$id'");
$o=$res->fetch_assoc();
if($o && password_verify($pass,$o['password'])){
$_SESSION['org_id']=$o['org_id'];
$_SESSION['org_name']=$o['name'];
header("Location: ../organisation/dashboard.php");
}
}

if($role=="savior"){
$res=$conn->query("SELECT * FROM savior WHERE name='$id'");
$s=$res->fetch_assoc();
if($s && password_verify($pass,$s['password'])){
$_SESSION['savior_id']=$s['savior_id'];
$_SESSION['savior_name']=$s['name'];
header("Location: ../savior/dashboard.php");
}
}
}
?>

<h2>Life-Line Hub</h2>

<form method="POST">
<select name="role">
<option value="donor">Donor</option>
<option value="organisation">Organisation</option>
<option value="savior">Savior</option>
</select>

<input name="id" placeholder="ID / Name">
<input type="password" name="password">

<button name="login">Login</button>
</form>
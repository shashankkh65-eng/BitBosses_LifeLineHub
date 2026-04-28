<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['donor_id'])){
header("Location: ../auth/index.php");
exit();
}

$donor_id=$_SESSION['donor_id'];
$org_id=$_GET['org_id'];

if(isset($_POST['donate'])){
$cat=$_POST['category'];
$qty=$_POST['qty'];
$price=$_POST['price'];

$total=$qty*$price;

$conn->query("INSERT INTO donation 
(donor_id,org_id,category,amount,status)
VALUES('$donor_id','$org_id','$cat','$total','Pending')");

header("Location: dashboard.php");
}
?>
<link rel="stylesheet" href="../assets/css/style.css">
<h2>Donate</h2>

<form method="POST">

<select id="cat" name="category" onchange="update()">
<option value="Food">Food</option>
<option value="Groceries">Groceries</option>
</select>

<input id="qty" name="qty" type="number" oninput="calc()">
<input id="price" readonly>
<input id="total" readonly>

<input type="hidden" name="price" id="hidden_price">

<button name="donate">Donate</button>

</form>

<script>
function update(){
let c=document.getElementById("cat").value;

let price=150,min=3;

if(c=="Groceries"){price=200;min=5;}

document.getElementById("price").value=price;
document.getElementById("hidden_price").value=price;

let q=document.getElementById("qty");
q.value=min; q.min=min;

calc();
}

function calc(){
let q=document.getElementById("qty").value;
let p=document.getElementById("price").value;

document.getElementById("total").value=q*p;
}

update();
</script>
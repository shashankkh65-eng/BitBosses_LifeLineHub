<!DOCTYPE html>
<html>
<head>
    <title>Life-Line Hub</title>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            margin-top: 100px;
        }
        button {
            padding: 15px 25px;
            margin: 10px;
            font-size: 16px;
            background: #2c7be5;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
        button:hover {
            background: #1a5fd1;
        }
    </style>
</head>
<body>

<h1>Life-Line Hub</h1>
<p>Select Your Role</p>

<a href="auth/signup.php"><button>Donor</button></a>
<a href="auth/org_signup.php"><button>Organisation</button></a>
<a href="auth/savior_signup.php"><button>Savior</button></a>

<br><br>

<h3>Already have an account?</h3>

<a href="auth/login.php"><button>Donor Login</button></a>
<a href="auth/org_login.php"><button>Organisation Login</button></a>
<a href="auth/savior_login.php"><button>Savior Login</button></a>

</body>
</html>
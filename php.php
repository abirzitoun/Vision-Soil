<?php
header("Content-Type: text/plain");

// Database configuration
$host = "localhost";
$dbname = "visionsoil";
$username = "root";
$password = "";

// Create DB connection
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if farm exists first
$farm_id = isset($_POST['farm_id']) ? (int)$_POST['farm_id'] : 1;
$check_farm = $conn->prepare("SELECT id FROM farms WHERE id = ?");
$check_farm->bind_param("i", $farm_id);
$check_farm->execute();
$check_farm->store_result();

if ($check_farm->num_rows == 0) {
    die("Error: Farm ID $farm_id does not exist in farms table");
}
$check_farm->close();

// Proceed with insert
$stmt = $conn->prepare("INSERT INTO sensor_data (
    date_time, bh1750, mq2, temperature, humidity, soilPH, moisture, rain,
    windspeed, light, farm_id, created_at, updated_at
) VALUES (
    NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
)");

// Get all parameters with defaults
$bh1750 = isset($_POST['bh1750']) ? (int)$_POST['bh1750'] : 0;
$mq2 = isset($_POST['mq2']) ? (int)$_POST['mq2'] : 0;
$temperature = isset($_POST['temperature']) ? (float)$_POST['temperature'] : 0;
$humidity = isset($_POST['humidity']) ? (float)$_POST['humidity'] : 0;
$soilPH = isset($_POST['soilPH']) ? (float)$_POST['soilPH'] : 0;
$moisture = isset($_POST['moisture']) ? (int)$_POST['moisture'] : 0;
$rain = isset($_POST['rain']) ? (int)$_POST['rain'] : 0;
$windspeed = isset($_POST['windspeed']) ? (int)$_POST['windspeed'] : 0;

$stmt->bind_param("iidddiiiii", 
    $bh1750, $mq2, $temperature, $humidity, $soilPH, 
    $moisture, $rain, $windspeed, $bh1750, $farm_id
);

if ($stmt->execute()) {
    echo "Data inserted successfully!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
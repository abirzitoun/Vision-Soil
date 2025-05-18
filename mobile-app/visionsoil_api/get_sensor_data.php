<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

try { 
    $query = "SELECT 
                id,
                time,
                temperature, 
                humidity, 
                light, 
                soilPH,
                farm_id,
                created_at,
                updated_at
              FROM sensor_data 
              ORDER BY time DESC 
              LIMIT 1";

    $stmt = $conn->prepare($query);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query");
    }
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        // Format the response to match your Android app's expectations
        $response = [
            'temperature' => $result['temperature'],
            'humidity' => $result['humidity'],
            'luminosity' => $result['light'], // Mapping 'light' to 'luminosity'
            'soil_moisture' => $result['soilPH'], // Mapping 'soilPH' to 'soil_moisture'
            'co2' => 0, // Default value since column doesn't exist
            'cov' => 0, // Default value since column doesn't exist
            'time' => $result['time']
        ];
        
        http_response_code(200);
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No sensor data found",
            "solution" => "Please ensure your sensors are sending data to the database"
        ]);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error occurred",
        "error_details" => $e->getMessage(),
        "solution" => "Check database connection and table structure"
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "solution" => "Check server error logs for more details"
    ]);
}
?>
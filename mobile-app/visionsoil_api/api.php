<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'visionsoil';

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            $action = $_GET['action'];
            
            if ($action == 'checkUser' && isset($_GET['email'])) {
                // Check if user exists by email
                $email = $_GET['email'];
                $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                echo json_encode(['exists' => $stmt->rowCount() > 0]);
            } 
            elseif ($action == 'getUserByEmail' && isset($_GET['email'])) {
                // Get user by email
                $email = $_GET['email'];
                $stmt = $conn->prepare("SELECT id, first_name, last_name, email, phone_number, role, image_url, status FROM users WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    echo json_encode($user);
                } else {
                    echo json_encode(['error' => 'User not found']);
                }
            }
            elseif ($action == 'login' && isset($_GET['email']) && isset($_GET['password'])) {
                // User login
                $email = $_GET['email'];
                $password = $_GET['password'];
                
                $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email AND status = 'approved'");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && password_verify($password, $user['password'])) {
                    unset($user['password']); // Remove password before sending
                    echo json_encode($user);
                } else {
                    echo json_encode(['error' => 'Invalid credentials or account not approved']);
                }
            }
            elseif ($action == 'getAllUsers') {
                // Get all users (for admin purposes)
                $stmt = $conn->query("SELECT id, first_name, last_name, email, phone_number, role, status FROM users");
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($users);
            }
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'register':
                    // User registration
                    $required = ['firstName', 'lastName', 'email', 'password', 'role'];
                    foreach ($required as $field) {
                        if (empty($data[$field])) {
                            echo json_encode(['success' => false, 'message' => "$field is required"]);
                            exit();
                        }
                    }
                    
                    // Check if user exists
                    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
                    $stmt->bindParam(':email', $data['email']);
                    $stmt->execute();
                    
                    if ($stmt->rowCount() > 0) {
                        echo json_encode(['success' => false, 'message' => 'Email already registered']);
                        exit();
                    }
                    
                    // Hash password
                    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                    
                    // Insert new user
                    $stmt = $conn->prepare("INSERT INTO users 
                        (first_name, last_name, email, phone_number, password, role, status) 
                        VALUES (:firstName, :lastName, :email, :phoneNumber, :password, :role, 'pending')");
                    
                    $stmt->bindParam(':firstName', $data['firstName']);
                    $stmt->bindParam(':lastName', $data['lastName']);
                    $stmt->bindParam(':email', $data['email']);
                    $stmt->bindParam(':phoneNumber', $data['phoneNumber'] ?? null);
                    $stmt->bindParam(':password', $hashedPassword);
                    $stmt->bindParam(':role', $data['role']);
                    
                    if ($stmt->execute()) {
                        echo json_encode(['success' => true, 'message' => 'Registration successful. Waiting for approval.']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Registration failed']);
                    }
                    break;
                    
                case 'updatePassword':
                    // Password update
                    if (empty($data['email']) || empty($data['newPassword'])) {
                        echo json_encode(['success' => false, 'message' => 'Email and new password are required']);
                        exit();
                    }
                    
                    $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);
                    
                    $stmt = $conn->prepare("UPDATE users SET password = :password WHERE email = :email");
                    $stmt->bindParam(':password', $hashedPassword);
                    $stmt->bindParam(':email', $data['email']);
                    
                    if ($stmt->execute()) {
                        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Password update failed']);
                    }
                    break;
                    
                case 'updateUser':
                    // User profile update
                    if (empty($data['id'])) {
                        echo json_encode(['success' => false, 'message' => 'User ID is required']);
                        exit();
                    }
                    
                    $stmt = $conn->prepare("UPDATE users SET 
                        first_name = :firstName, 
                        last_name = :lastName, 
                        email = :email,
                        phone_number = :phoneNumber,
                        role = :role,
                        status = :status
                        WHERE id = :id");
                    
                    $stmt->bindParam(':id', $data['id']);
                    $stmt->bindParam(':firstName', $data['firstName']);
                    $stmt->bindParam(':lastName', $data['lastName']);
                    $stmt->bindParam(':email', $data['email']);
                    $stmt->bindParam(':phoneNumber', $data['phoneNumber'] ?? null);
                    $stmt->bindParam(':role', $data['role']);
                    $stmt->bindParam(':status', $data['status']);
                    
                    if ($stmt->execute()) {
                        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'User update failed']);
                    }
                    break;
                    
                case 'uploadImage':
                    // Image upload (would need additional handling for file upload)
                    if (empty($data['userId']) || empty($data['imageUrl'])) {
                        echo json_encode(['success' => false, 'message' => 'User ID and image URL are required']);
                        exit();
                    }
                    
                    $stmt = $conn->prepare("UPDATE users SET image_url = :imageUrl WHERE id = :userId");
                    $stmt->bindParam(':imageUrl', $data['imageUrl']);
                    $stmt->bindParam(':userId', $data['userId']);
                    
                    if ($stmt->execute()) {
                        echo json_encode(['success' => true, 'message' => 'Image uploaded successfully']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Image upload failed']);
                    }
                    break;
                    
                default:
                    echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No action specified']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
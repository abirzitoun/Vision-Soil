<?php
require_once 'config.php';

function checkUserExists($email) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    return $stmt->rowCount() > 0;
}

function getUserByEmail($email) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, first_name, last_name, email, phone_number, role, image_url, status FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getAllUsers() {
    global $conn;
    
    $stmt = $conn->query("SELECT id, first_name, last_name, email, phone_number, role, status FROM users");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function registerUser($userData) {
    global $conn;
    
    // Validate required fields
    $required = ['first_name', 'last_name', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (empty($userData[$field])) {
            return ['success' => false, 'message' => "$field is required"];
        }
    }
    
    // Check if user exists
    if (checkUserExists($userData['email'])) {
        return ['success' => false, 'message' => 'Email already registered'];
    }
    
    // Hash password
    $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users 
        (first_name, last_name, email, phone_number, password, role, status) 
        VALUES (:first_name, :last_name, :email, :phone_number, :password, :role, 'pending')");
    
    $stmt->bindParam(':first_name', $userData['first_name']);
    $stmt->bindParam(':last_name', $userData['last_name']);
    $stmt->bindParam(':email', $userData['email']);
    $stmt->bindParam(':phone_number', $userData['phone_number'] ?? null);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':role', $userData['role']);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Registration successful. Waiting for approval.'];
    } else {
        return ['success' => false, 'message' => 'Registration failed'];
    }
}

function authenticateUser($email, $password) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email AND status = 'approved'");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // Remove password before returning
        return ['success' => true, 'user' => $user];
    } else {
        return ['success' => false, 'message' => 'Invalid credentials or account not approved'];
    }
}

function updatePassword($email, $newPassword) {
    global $conn;
    
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("UPDATE users SET password = :password WHERE email = :email");
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':email', $email);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Password updated successfully'];
    } else {
        return ['success' => false, 'message' => 'Password update failed'];
    }
}

function updateUserProfile($userId, $userData) {
    global $conn;
    
    $stmt = $conn->prepare("UPDATE users SET 
        first_name = :first_name, 
        last_name = :last_name, 
        email = :email,
        phone_number = :phone_number,
        role = :role,
        status = :status
        WHERE id = :id");
    
    $stmt->bindParam(':id', $userId);
    $stmt->bindParam(':first_name', $userData['first_name']);
    $stmt->bindParam(':last_name', $userData['last_name']);
    $stmt->bindParam(':email', $userData['email']);
    $stmt->bindParam(':phone_number', $userData['phone_number'] ?? null);
    $stmt->bindParam(':role', $userData['role']);
    $stmt->bindParam(':status', $userData['status']);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Profile updated successfully'];
    } else {
        return ['success' => false, 'message' => 'Profile update failed'];
    }
}

function updateUserImage($userId, $imageUrl) {
    global $conn;
    
    $stmt = $conn->prepare("UPDATE users SET image_url = :image_url WHERE id = :id");
    $stmt->bindParam(':image_url', $imageUrl);
    $stmt->bindParam(':id', $userId);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Image updated successfully'];
    } else {
        return ['success' => false, 'message' => 'Image update failed'];
    }
}
?>
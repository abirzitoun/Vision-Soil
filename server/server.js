const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const util = require('util'); // Make sure at top
const app = express();
app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"], // Autoriser plusieurs origines
  credentials: true
}));
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the folder where images will be stored
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Create a unique filename
  },
});

const upload = multer({ storage });


// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 } // 1h
}));

const OPENWEATHER_API_KEY = '181639490365072f24a907e79cee5663'; // Replace with your OpenWeather API 
// 🔹 Route d'enregistrement (Register)
app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Vérification des champs requis
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
  }

  // Vérifier si l'utilisateur existe déjà
  const sqlCheckUser = "SELECT * FROM users WHERE email = ?";
  db.query(sqlCheckUser, [email], async (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la vérification de l'utilisateur :", err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Cet utilisateur existe déjà" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    const sqlInsertUser = "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sqlInsertUser, [email, hashedPassword, firstName, lastName, role], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'insertion de l'utilisateur :", err);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }

      res.status(201).json({ success: true, message: "Utilisateur créé avec succès" });
    });
  });
});

// Session middleware

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'visionsoil',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});
db.query = util.promisify(db.query);
// Route pour récupérer un utilisateur par ID
async function calculerEtMettreAJourZones() {
  try {
    const poidsParTomateKg = 0.15;

    // Utiliser `await` avec la requête, qui renvoie une promesse
    const result = await db.query('SELECT id, healthy, not_healthy FROM zones');
    
    for (const zone of result) {
      const { id, healthy = 0, not_healthy = 0 } = zone;

      const total = healthy + not_healthy;
      const ripeness = total > 0 ? (not_healthy * 100) / total : 0;

      const poidsSaines = healthy * poidsParTomateKg;
      const tomatesRecuperables = not_healthy * (ripeness / 100);
      const poidsRecuperables = tomatesRecuperables * poidsParTomateKg;
      const production = poidsSaines + poidsRecuperables;

      // Mise à jour de la base de données avec `await`
      await db.query(
        'UPDATE zones SET ripeness = ?, production = ? WHERE id = ?',
        [ripeness.toFixed(2), production.toFixed(2), id]
      );

      console.log(`✅ Zone ${id} mise à jour : ripeness=${ripeness.toFixed(2)}% | production=${production.toFixed(2)} kg`);
    }

    console.log('✅ Toutes les zones ont été mises à jour.');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des zones :', error);
  }
}

calculerEtMettreAJourZones();


// 🔹 Mise à jour d'un utilisateur
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role } = req.body;

  if (!id || isNaN(id) || !first_name || !last_name || !email || !role) {
    return res.status(400).json({ message: 'Champs invalides' });
  }

  const query = `UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?`;
  db.query(query, [first_name, last_name, email, role, id], (err, result) => {
    if (err) {
      console.error('Erreur mise à jour:', err);
      return res.status(500).json({ message: 'Erreur interne' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  });
});


// 🔹 Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (results.length === 0) return res.status(400).json({ success: false, message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password" });

    // Store user data in session
    req.session.user = { id: user.id, name: user.first_name, email: user.email, role: user.role, status: user.status };

    res.json({ success: true, user: req.session.user });
  });
});

// 🔹 Session check route
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Suppression du cookie JWT ou session
  res.json({ success: true, message: "Déconnecté avec succès" });
});
// 🔹 Récupération de la liste des utilisateurs
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, first_name, last_name, email,phone_number,role ,status FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.status(200).json(results);
  });
});
// 🔹 Récupération de la liste des utilisateurs pending approval
app.get('/api/pending-engineers', (req, res) => {
  const query = "SELECT id, first_name, last_name, email,phone_number,role ,status FROM users WHERE role ='engineer' AND status='pending'  ";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.status(200).json(results);
  });
});
// 🔹 Suppression d'un utilisateur
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erreur suppression:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});
// Route pour compter le nombre d'agriculteurs (farmers)
app.get('/api/farmers/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM users WHERE role = "farmer"';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du comptage des agriculteurs' });
    }
    res.json({ count: results[0].count });
  });
});

// Route pour compter le nombre d'ingénieurs (engineers)
app.get('/api/engineers/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM users WHERE role = "engineer"';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du comptage des ingénieurs' });
    }
    res.json({ count: results[0].count });
  });
});


// Route pour récupérer un utilisateur par ID
app.get("/api/user/profile/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT first_name, last_name, role FROM users WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'utilisateur :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(result[0]); // Renvoie les données de l'utilisateur
  });
});
// 🔹 Mise à jour d'un utilisateur
app.put('/api/users/update/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number, role, status } = req.body;

  if (!id || isNaN(id) || !first_name || !last_name || !email || !phone_number || !role || !status) {
    return res.status(400).json({ message: 'Champs invalides' });
  }

  const query = `UPDATE users SET first_name = ?, last_name = ?, email = ?,phone_number=?, role = ?, status = ? WHERE id = ?`;
  db.query(query, [first_name, last_name, email, phone_number, role, status, id], (err, result) => {
    if (err) {
      console.error('Erreur mise à jour:', err);
      return res.status(500).json({ message: 'Erreur interne' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  });
});
//APProval


// ✅ Approuver un ingénieur
app.put("/users/approve/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  const sqlUpdateStatus = "UPDATE users SET status = 'approved' WHERE id = ?";
  db.query(sqlUpdateStatus, [id], (err, result) => {
    if (err) {
      console.error("Error during approval:", err);
      return res.status(500).json({ message: "Erreur lors de l'approbation" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const sqlGetUser = "SELECT * FROM users WHERE id = ?";
    db.query(sqlGetUser, [id], (err, results) => {
      if (err) {
        console.error("Error fetching updated user:", err);
        return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
      }

      res.json(results[0]);
    });
  });
});


// ✅ Rejeter un ingénieur
app.put("/users/reject/:id", (req, res) => {
  const { id } = req.params;

  const sqlUpdateStatus = "UPDATE users SET status = 'rejected' WHERE id = ?";
  db.query(sqlUpdateStatus, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors du rejet:", err);
      return res.status(500).json({ message: "Erreur lors du rejet" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const sqlGetUser = "SELECT * FROM users WHERE id = ?";
    db.query(sqlGetUser, [id], (err, results) => {
      if (err) {
        console.error("Error fetching updated user:", err);
        return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
      }

      res.json(results[0]);
    });
  });
});




// Route for user creation (POST)
app.post('/api/create', async (req, res) => {
  const { first_name, last_name, email, phone_number, password, role, status } = req.body;

  // Check for required fields
  if (!first_name || !last_name || !email || !phone_number || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Set default status if not provided
  const userStatus = status || (role === "engineer" ? "pending" : "active");
  const hashedPassword = await bcrypt.hash(password, 10);
  // Insert user into the database
  const query = "INSERT INTO users (first_name, last_name, email, phone_number, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [first_name, last_name, email, phone_number, hashedPassword, role, userStatus], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ message: "Error creating user." });
    }

    res.status(201).json({
      id: result.insertId,
      first_name,
      last_name,
      email,
      phone_number,
      role,
      status: userStatus,
    });
  });
});


// Route pour récupérer tous les fermiers
app.get("/users/farmers", (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'farmer' AND status = 'approved'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Route pour récupérer toutes les fermes
app.get("/api/admin/farms", (req, res) => {
  const sql = "SELECT * FROM farms";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
// Récupérer tous les robots avec leur farm_id et engineer_id
app.get("/api/admin/robots", async (req, res) => {
  const sql = "SELECT * FROM robots";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
// 🔹 Récupération de la liste des utilisateurs
app.get('/api/farmers', (req, res) => {
  const query = "SELECT id, first_name, last_name, email,phone_number,role ,status FROM users WHERE role ='farmer'";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.status(200).json(results);
  });
});

app.get('/api/engineers', (req, res) => {
  const query = "SELECT id, first_name, last_name, email,phone_number,role ,status FROM users WHERE role ='engineer'";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.status(200).json(results);
  });
});
app.delete("/api/delete/farms/:id", async (req, res) => {
  const farmId = req.params.id;

  try {
    // Check if the farm exists
    db.query("SELECT * FROM farms WHERE id = ?", [farmId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error checking farm existence", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Farm not found" });
      }

      // Disconnect robots from the farm
      db.query("UPDATE robots SET farm_id = NULL WHERE farm_id = ?", [farmId], (err) => {
        if (err) {
          return res.status(500).json({ message: "Error unlinking robots from farm", error: err.message });
        }

        // Delete the farm
        db.query("DELETE FROM farms WHERE id = ?", [farmId], (err) => {
          if (err) {
            return res.status(500).json({ message: "Error deleting farm", error: err.message });
          }

          res.status(200).json({ message: "Farm deleted successfully" });
        });
      });
    });
  } catch (error) {
    console.error("Error deleting farm:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
app.put('/api/farms/:id', (req, res) => {
  const farmId = req.params.id;  // Get the farm ID from the URL
  const { name, location, owner_id, image_url, latitude, longitude } = req.body;
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');


  // Ensure the required fields are present
  if (!name || !location || !owner_id || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SQL query to update the farm data
  const query = `
    UPDATE farms 
    SET name = ?, location = ?, owner_id = ?, image_url = ?, latitude = ?, longitude = ?
    WHERE id = ?
  `;

  // Execute the query to update the farm data
  db.query(query, [name, location, owner_id, image_url, latitude, longitude, farmId], (err, result) => {
    if (err) {
      console.error('❌ Error updating farm:', err);
      return res.status(500).json({ error: 'Failed to update farm' });
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, the farm with the given ID was not found
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Successfully updated the farm
    res.json({ message: 'Farm updated successfully', farmId });
  });
});
//robots admin affichage 
app.get('/api/robots', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM robots');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching robots:', error);
    res.status(500).json({ message: 'Failed to fetch robots' });
  }
});
// add robots
app.post('/api/add/robots', async (req, res) => {
  try {
    console.log("Données reçues :", req.body);

    // Exécuter la requête SQL
    db.query(
      "INSERT INTO robots (name, farm_id, engineer_id, status, connectivity) VALUES (?, ?, ?, ?, ?)",
      [req.body.name, req.body.farm_id, req.body.engineer_id, req.body.status, req.body.connectivity],
      (err, results) => {
        if (err) {
          console.error("Erreur SQL :", err);
          return res.status(500).json({ message: "Erreur lors de l’ajout du robot", error: err });
        }
        res.json({ message: "Robot ajouté avec succès", robotId: results.insertId });
      }
    );
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});


app.put('/api/update/robots/:id', async (req, res) => {
  const { name, farmId, engineerId, status, connectivity } = req.body;

  // Assurez-vous que farmId et engineerId sont des entiers
  const farmIdInt = parseInt(farmId, 10);
  const engineerIdInt = parseInt(engineerId, 10);

  // Validation de l'entrée
  if (isNaN(farmIdInt) || isNaN(engineerIdInt)) {
    return res.status(400).json({ message: 'farmId and engineerId must be integers' });
  }

  try {
    const result = await db.query(
      'UPDATE robots SET name = ?, farm_id = ?, engineer_id = ?, status = ?, connectivity = ? WHERE id = ?',
      [name, farmIdInt, engineerIdInt, status, connectivity, req.params.id]
    );

    console.log('Update result:', result);

    // Vérifie si la propriété affectedRows est présente dans la réponse de la requête
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Robot not found' });
    }

    res.json({ id: req.params.id, name, farmId, engineerId, status, connectivity });
  } catch (error) {
    console.error('Error updating robot:', error);
    res.status(500).json({ message: 'Failed to update robot' });
  }
});

app.delete('/api/delete/robot/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  const query = 'DELETE FROM robots WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erreur suppression:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// Endpoint pour assigner un ingénieur à plusieurs robots
app.post('/api/robots/assign-engineer', async (req, res) => {
  const { robotIds, engineerId } = req.body;

  // Validation des entrées
  if (!robotIds || !engineerId || !Array.isArray(robotIds)) {
    return res.status(400).json({ error: "Invalid input: robotIds and engineerId are required" });
  }

  try {
    // Vérifier si l'ingénieur existe
    const engineerQuery = 'SELECT * FROM users WHERE id = ?';
    db.query(engineerQuery, [engineerId], (err, engineerRes) => {
      if (err) {
        console.error("Error checking engineer:", err);
        return res.status(500).json({ error: "Failed to check engineer" });
      }

      if (engineerRes.length === 0) {
        return res.status(404).json({ error: "Engineer not found" });
      }

      // Mettre à jour les robots
      const updateQuery = `
        UPDATE robots
        SET engineer_id = ?, status = 'in-use'
        WHERE id IN (?)
      `;
      db.query(updateQuery, [engineerId, robotIds], (err, updateRes) => {
        if (err) {
          console.error("Error updating robots:", err);
          return res.status(500).json({ error: "Failed to update robots" });
        }

        // Récupérer les robots mis à jour
        const selectQuery = 'SELECT * FROM robots WHERE id IN (?)';
        db.query(selectQuery, [robotIds], (err, selectRes) => {
          if (err) {
            console.error("Error fetching updated robots:", err);
            return res.status(500).json({ error: "Failed to fetch updated robots" });
          }

          // Retourner les robots mis à jour
          res.status(200).json(selectRes);
        });
      });
    });
  } catch (error) {
    console.error("Error assigning engineer:", error);
    res.status(500).json({ error: "Failed to assign engineer" });
  }
});
app.get("/api/stats", (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'farmer') AS totalFarmers,
      (SELECT COUNT(*) FROM farms) AS activeFarms,
      (SELECT COUNT(*) FROM robots) AS deployedRobots,
      (SELECT COUNT(*) FROM users WHERE role = 'engineer') AS sensorNetworks
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des statistiques :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});


// 📌 Route : Répartition des robots par ferme
// 📌 Route : Répartition des robots par ferme
app.get("/api/robot-distribution", (req, res) => {
  const query = `
    SELECT farms.name, COUNT(robots.id) AS value
    FROM farms
    LEFT JOIN robots ON farms.id = robots.farm_id
    GROUP BY farms.name
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.get("/api/stats/robots", (req, res) => {
  const query = `
    SELECT 
      status, COUNT(*) AS count 
    FROM robots 
    GROUP BY status
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des stats des robots :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
//Farmer
//affichage des farms par id 
app.get('/farms/farmer/:farmerId', (req, res) => {
  const farmerId = req.params.farmerId;
  db.query('SELECT * FROM farms WHERE owner_id = ?', [farmerId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
//recuperer les zones 
app.get('/zones/farm/:farmId', (req, res) => {
  const farmId = req.params.farmId;
  db.query('SELECT * FROM zones WHERE farm_id = ?', [farmId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
// recuperer les donnees de capteur
app.get('/sensor_data/farm/:farmId', (req, res) => {
  const farmId = req.params.farmId;
  db.query('SELECT * FROM sensor_data WHERE farm_id = ?', [farmId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
// Route pour récupérer les données de capteurs d'une ferme spécifique
app.get('/sensor-data/farm/:farmId', (req, res) => {
  const farmId = req.params.farmId;

  // SQL pour récupérer les données de capteurs de cette ferme
  const query = `
    SELECT humidity, temperature
    FROM sensor_data
    WHERE farm_id = ?
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  // Exécuter la requête
  db.query(query, [farmId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des données des capteurs:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée de capteur trouvée pour cette ferme' });
    }

    // Retourner les données des capteurs
    res.json(result[0]);
  });
});
app.get('/sensor-dataaa/farm/:farmId', (req, res) => {
  const farmId = req.params.farmId;

  // SQL pour récupérer les données de capteurs de cette ferme
  const query = `
    SELECT production, ripeness
    FROM sensor_data
    WHERE farm_id = ?
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  // Exécuter la requête
  db.query(query, [farmId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des données des capteurs:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée de capteur trouvée pour cette ferme' });
    }

    // Retourner les données des capteurs
    res.json(result[0]);
  });
});
app.get('/api/zones/:farmId', (req, res) => {
  const { farmId } = req.params;

  // Vérifie si farmId est un nombre
  if (isNaN(farmId)) {
    return res.status(400).json({ error: 'ID de ferme invalide.' });
  }

  // Prépare la requête SQL
  const query = 'SELECT production, ripeness FROM zones WHERE farm_id = ?';

  console.log('Exécution de la requête pour farmId:', farmId);

  // Exécute la requête
  db.query(query, [farmId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la récupération des zones:', err);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des données.' });
    }

    console.log('Résultats de la requête:', results);

    // Aucune zone trouvée
    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucune zone trouvée pour cette ferme.' });
    }

    // Résultat trouvé
    res.status(200).json(results);
  });
});


app.get('/api/farm/:farmId/sensor-data', async (req, res) => {
  const farmId = req.params.farmId;

  const query = 'SELECT temperature, humidity, soilPH FROM sensor_data WHERE farm_id = ? ';

  // Use the query method for MySQL
  db.query(query, [farmId], (err, results) => {
    if (err) {
      console.error("Error fetching sensor data:", err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Sensor data not found' });
    }

    res.json(results[0]); // Return the latest sensor data
  });
});

//ingenieur
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.get("/api/farms", async (req, res) => {
  try {
    const farms = await query(`
      SELECT farms.*, 
             users.first_name AS owner_first_name, 
             users.last_name AS owner_last_name, 
             users.email AS owner_email
      FROM farms
      LEFT JOIN users ON farms.owner_id = users.id
    `);
    res.json(farms);
  } catch (error) {
    console.error("Error fetching farms with owner details:", error);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
});
app.get("/api/farm/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;
    const farm = await query(
      `SELECT farms.*, 
              users.first_name AS ownerFirstName, 
              users.last_name AS ownerLastName 
       FROM farms 
       JOIN users ON farms.owner_id = users.id
       WHERE farms.id = ?`,
      [farmId]
    );

    if (farm.length === 0) {
      return res.status(404).json({ error: "Farm not found" });
    }

    const formattedFarm = {
      ...farm[0],
      owner: `${farm[0].ownerFirstName} ${farm[0].ownerLastName}`, // Combine first & last name
    };

    res.json(formattedFarm);
  } catch (error) {
    console.error("Error fetching farm:", error);
    res.status(500).json({ error: "Failed to fetch farm" });
  }
});

// Updated backend: Get a single farm + its zones properly


// Corrected route for fetching a farm + zones
app.get('/api/farms/:id', async (req, res) => {
  const farmId = req.params.id;

  try {
    // Fetch farm details
    const farmRows = await query(
      'SELECT id, name, location, latitude, longitude, image_url, weather FROM farms WHERE id = ?',
      [farmId]
    );

    if (farmRows.length === 0) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const farm = farmRows[0];

    // Fetch zones
    const zoneRows = await query(
      `SELECT name, color, ST_AsText(coordinates) AS coordinates
       FROM zones
       WHERE farm_id = ?`,
      [farmId]
    );

    const parsedZones = zoneRows.map(zone => {
      const matches = [...zone.coordinates.matchAll(/([-\d\.]+) ([-\d\.]+)/g)];
      const coordinates = matches.map(match => [parseFloat(match[2]), parseFloat(match[1])]);
      return {
        name: zone.name,
        color: zone.color,
        coordinates,
      };
    });

    res.json({
      id: farm.id,
      name: farm.name,
      location: farm.location,
      latitude: parseFloat(farm.latitude),
      longitude: parseFloat(farm.longitude),
      image_url: farm.image_url,
      weather: farm.weather ? JSON.parse(farm.weather) : null,
      zones: parsedZones,
    });

  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ message: 'Error fetching farm', error: error.message });
  }
});




const axios = require('axios');  // Add this line at the top of your server.js


// Add farm endpoint with zones support

const query = util.promisify(db.query).bind(db);

app.post('/api/farm', upload.single('image'), async (req, res) => {
  const { name, location, latitude, longitude, farmer_first_name, farmer_last_name, zones } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !location || !latitude || !longitude || !farmer_first_name || !farmer_last_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 1. Find the farmer - using callback style to match your existing code
    db.query(
      'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND role = "farmer"',
      [farmer_first_name, farmer_last_name],
      async (err, farmerRows) => {
        if (err) {
          console.error('Error finding farmer:', err);
          return res.status(500).json({ message: 'Failed to find farmer' });
        }

        if (farmerRows.length === 0) {
          return res.status(404).json({ message: 'Farmer not found' });
        }

        const farmer_id = farmerRows[0].id; // This is now properly scoped

        // 2. Fetch weather
        try {
          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
          const weatherData = {
            temperature: weatherResponse.data.main.temp,
            humidity: weatherResponse.data.main.humidity,
            weatherCondition: weatherResponse.data.weather[0].main,
            highTemp: weatherResponse.data.main.temp_max,
            lowTemp: weatherResponse.data.main.temp_min,
            precipitation: weatherResponse.data.rain?.["1h"] || 0
          };

          // 3. Insert farm
          db.query(
            'INSERT INTO farms (name, owner_id, location, latitude, longitude, image_url, weather) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, farmer_id, location, latitude, longitude, imageUrl, JSON.stringify(weatherData)],
            (err, farmResult) => {
              if (err) {
                console.error('Error creating farm:', err);
                return res.status(500).json({ message: 'Failed to create farm' });
              }

              const farmId = farmResult.insertId;

              // 4. Insert zones if they exist
              if (zones) {
                const parsedZones = JSON.parse(zones);
                let zoneCount = 0;
                
                parsedZones.forEach((zone) => {
                  if (!zone.name || !zone.color || !Array.isArray(zone.coordinates)) {
                    console.warn('Skipping invalid zone:', zone);
                    return;
                  }

                  const closedCoords = [...zone.coordinates, zone.coordinates[0]];
                  const wktCoords = closedCoords.map(([lat, lng]) => `${lng} ${lat}`).join(', ');
                  const wktPolygon = `POLYGON((${wktCoords}))`;

                  db.query(
                    `INSERT INTO zones 
                    (name, color, coordinates, farm_id, count, healthy, not_healthy, healthy_trees, not_healthy_trees, production, ripeness)
                    VALUES (?, ?, ST_GeomFromText(?, 4326), ?, 0, 0, 0, 0, 0, 0.00, 'Not assessed')`,
                    [zone.name, zone.color, wktPolygon, farmId],
                    (err) => {
                      if (err) {
                        console.error('Error inserting zone:', err);
                        return;
                      }
                      zoneCount++;
                      
                      // If all zones are processed, send response
                      if (zoneCount === parsedZones.length) {
                        res.status(201).json({ message: 'Farm created successfully' });
                      }
                    }
                  );
                });
              } else {
                res.status(201).json({ message: 'Farm created successfully' });
              }
            }
          );
        } catch (weatherError) {
          console.error('Weather API error:', weatherError);
          return res.status(500).json({ message: 'Failed to fetch weather data' });
        }
      }
    );
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ message: 'Failed to create farm', error: error.message });
  }
});




// Route to fetch robots for the logged-in user
app.get("/api/engineer/robots", (req, res) => {
  // Check if the user is logged in and is an engineer
  if (!req.session.user || req.session.user.role !== "engineer") {
    return res.status(401).json({ success: false, message: "Unauthorized: User is not an engineer" });
  }

  const engineerId = req.session.user.id; // Get the engineer's ID from the session

  console.log("Fetching robots for engineer ID:", engineerId);

  // Fetch robots assigned to this engineer
  const robotQuery = `
    SELECT r.*, u.first_name AS engineer_first_name, u.last_name AS engineer_last_name
    FROM robots r
    LEFT JOIN users u ON r.engineer_id = u.id
    WHERE r.engineer_id = ?`;

  db.query(robotQuery, [engineerId], (err, results) => {
    if (err) {
      console.error("Error fetching robots:", err);
      return res.status(500).json({ success: false, message: "Database error while fetching robots" });
    }

    return res.status(200).json({ success: true, robots: results });
  });
});


// Ajouter un nouveau farmer


app.post("/api/engineer/add/farmers", async (req, res) => {
  // Vérifier si l'utilisateur est un admin

  const { firstName, lastName, email, phoneNumber, password } = req.body;

  // Vérification des champs
  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
  }

  // Vérification si l'email existe déjà
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification de l'email:", err);
      return res.status(500).json({ success: false, message: "Erreur de base de données" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }

    // Hachage du mot de passe
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Erreur lors du hachage du mot de passe:", err);
        return res.status(500).json({ success: false, message: "Erreur lors du hachage du mot de passe" });
      }

      // Insertion dans la base de données
      const sql = `
         INSERT INTO users (first_name, last_name, email, phone_number, password, role, image_url, status)
  VALUES (?, ?, ?, ?, ?, 'farmer', NULL, 'approved')
      `;
      db.query(sql, [firstName, lastName, email, phoneNumber, hashedPassword], (err, result) => {
        if (err) {
          console.error("Erreur lors de l'ajout de l'agriculteur:", err);
          return res.status(500).json({ success: false, message: "Erreur de base de données" });
        }

        // Vérification de l'insertion
        if (result.affectedRows === 1) {
          return res.status(201).json({ success: true, message: "Agriculteur ajouté avec succès" });
        } else {
          return res.status(500).json({ success: false, message: "Échec de l'insertion de l'agriculteur" });
        }
      });
    });
  });
});

app.get('/api/sensor_data/farm/:farmId', (req, res) => {
  const farmId = req.params.farmId;

  // SQL pour récupérer les données de capteurs de cette ferme
  const query = 
    'SELECT bh1750, mq2, temperature, humidity, soilPh, moisture, rain, windspeed FROM sensor_data WHERE farm_id = ?'
  ;

  db.query(query, [farmId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des données des capteurs:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée de capteur trouvée pour cette ferme' });
    }

    // Formater les données avant de les retourner
    const sensorData = result[0]; // Ici, on suppose qu'il n'y a qu'une seule ligne par farmId
    const formattedData = {
      bh1750: sensorData.bh1750,
      mq2: sensorData.mq2,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      ph: sensorData.soilPh,
      moisture: sensorData.moisture,
      rain: sensorData.rain,
      windSpeed: sensorData.windspeed,
    };

    // Retourner les données des capteurs
    res.json(formattedData);
  });
});


// Start the server
const port = 8081;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

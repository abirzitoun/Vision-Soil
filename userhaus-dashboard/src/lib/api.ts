
import { 
  mockRobots, 
  mockFarms, 
  mockUsers, 
  mockSensorData, 
  mockDashboardStats, 
  fetchWithDelay 
} from "./mock-data";
import axios from 'axios'; 
import { Robot, Farm, User, SensorData, DashboardStats } from "./types";
import { toast } from "sonner";

// API functions for Robots
export const robotsApi = {
  getAll: () => fetchWithDelay(mockRobots),
  
  getById: (id: string) => 
    fetchWithDelay(mockRobots.find(robot => robot.id === id)),
  
  create: (robot: Omit<Robot, "id" | "lastActive">) => {
    const newRobot: Robot = {
      id: `r${mockRobots.length + 1}`,
      lastActive: new Date().toISOString(),
      ...robot,
    };
    
    mockRobots.push(newRobot);
    toast.success("Robot added successfully");
    return fetchWithDelay(newRobot);
  },
  
  update: (id: string, updates: Partial<Robot>) => {
    const index = mockRobots.findIndex(robot => robot.id === id);
    if (index === -1) {
      throw new Error("Robot not found");
    }
    
    mockRobots[index] = { ...mockRobots[index], ...updates };
    toast.success("Robot updated successfully");
    return fetchWithDelay(mockRobots[index]);
  },
  
  delete: (id: string) => {
    const index = mockRobots.findIndex(robot => robot.id === id);
    if (index === -1) {
      throw new Error("Robot not found");
    }
    
    const deleted = mockRobots.splice(index, 1)[0];
    toast.success("Robot deleted successfully");
    return fetchWithDelay(deleted);
  },
  
  assignToEngineer: (robotIds: string[], engineerId: string) => {
    const engineer = mockUsers.find(user => user.id === engineerId);
    if (!engineer) {
      throw new Error("Engineer not found");
    }
    
    robotIds.forEach(robotId => {
      const robot = mockRobots.find(r => r.id === robotId);
      if (robot) {
        robot.engineerId = engineerId;
        robot.engineerName = `${engineer.first_name} ${engineer.last_name}`;
      }
    });
    
    toast.success(`${robotIds.length} robots assigned to engineer`);
    return fetchWithDelay(
      mockRobots.filter(robot => robotIds.includes(robot.id))
    );
  }
};

// API functions for Farms
export const farmsApi = {
  getAll: () => fetchWithDelay(mockFarms),
  
  getById: (id: string) => 
    fetchWithDelay(mockFarms.find(farm => farm.id === id)),
  
  create: (farm: Omit<Farm, "id" | "createdAt">) => {
    const newFarm: Farm = {
      id: `f${mockFarms.length + 1}`,
      createdAt: new Date().toISOString(),
      ...farm,
    };
    
    mockFarms.push(newFarm);
    toast.success("Farm added successfully");
    return fetchWithDelay(newFarm);
  },
  
  update: (id: string, updates: Partial<Farm>) => {
    const index = mockFarms.findIndex(farm => farm.id === id);
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    mockFarms[index] = { ...mockFarms[index], ...updates };
    toast.success("Farm updated successfully");
    return fetchWithDelay(mockFarms[index]);
  },
  
  delete: (id: string) => {
    const index = mockFarms.findIndex(farm => farm.id === id);
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    // Remove farm assignment from robots
    mockRobots.forEach(robot => {
      if (robot.farmId === id) {
        robot.farmId = null;
        robot.farmName = null;
      }
    });
    
    const deleted = mockFarms.splice(index, 1)[0];
    toast.success("Farm deleted successfully");
    return fetchWithDelay(deleted);
  }
};

// API functions for Users
export const usersApi = {
 
    // 🔹 Récupérer tous les utilisateurs
    getAll: async () => {
      const response = await axios.get(`http://localhost:8081/users/all`, { withCredentials: true });
      return response.data;
    },
  
    // 🔹 Récupérer les utilisateurs par rôle (ex: "engineer", "farmer", "admin")
    getByRole: async (role: string) => {
      const response = await axios.get(`http://localhost:8081/users/role/${role}`, { withCredentials: true });
      return response.data;
    },
  
    // 🔹 Récupérer uniquement les ingénieurs en attente
    getPendingEngineers: async () => {
      const response = await axios.get(`http://localhost:8081/users/pending-engineers`, { withCredentials: true });
      return response.data;
    },
  
    // 🔹 Approuver un ingénieur
    approveEngineer: async (id: string) => {
      const response = await axios.put(`http://localhost:8081/users/approve/${id}`, {}, { withCredentials: true });
      return response.data;
    },
  
    // 🔹 Rejeter un ingénieur
    rejectEngineer: async (id: string) => {
      const response = await axios.put(`http://localhost:8081/users/reject/${id}`, {}, { withCredentials: true });
      return response.data;
    },
  
  getById: (id: string) => 
    fetchWithDelay(mockUsers.find(user => user.id === id)),
  
  create: (user: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      id: `u${mockUsers.length + 1}`,
      createdAt: new Date().toISOString(),
      ...user,
    };
    
    mockUsers.push(newUser);
    toast.success("User added successfully");
    return fetchWithDelay(newUser);
  },
  
  update: (id: string, updates: Partial<User>) => {
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
    
    mockUsers[index] = { ...mockUsers[index], ...updates };
    
    // If it's an engineer with status change, update robot assignments
    if (mockUsers[index].role === "engineer" && updates.status) {
      if (updates.status !== "active") {
        // Remove engineer from robots
        mockRobots.forEach(robot => {
          if (robot.engineerId === id) {
            robot.engineerId = null;
            robot.engineerName = null;
          }
        });
      }
    }
    
    // If it's a farmer with status change, update farm ownership
    if (mockUsers[index].role === "farmer" && updates.status) {
      if (updates.status !== "active") {
        // Mark farms as inactive
        mockFarms.forEach(farm => {
          if (farm.farmerId === id) {
            farm.status = "inactive";
          }
        });
      }
    }
    
    toast.success("User updated successfully");
    return fetchWithDelay(mockUsers[index]);
  },
  
  delete: (id: string) => {
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
    
    // Handle dependencies before deletion
    if (mockUsers[index].role === "engineer") {
      mockRobots.forEach(robot => {
        if (robot.engineerId === id) {
          robot.engineerId = null;
          robot.engineerName = null;
        }
      });
    }
    
    if (mockUsers[index].role === "farmer") {
      mockFarms.forEach(farm => {
        if (farm.farmerId === id) {
          farm.status = "inactive";
        }
      });
    }
    
    const deleted = mockUsers.splice(index, 1)[0];
    toast.success("User deleted successfully");
    return fetchWithDelay(deleted);
  },
  
  approveEngineer: (id: string) => {
    const user = mockUsers.find(user => user.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.status = "active";
    toast.success("Engineer approved successfully");
    return fetchWithDelay(user);
  },
  
  rejectEngineer: (id: string) => {
    const user = mockUsers.find(user => user.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.status = "rejected";
    toast.success("Engineer rejected");
    return fetchWithDelay(user);
  }
};

// API functions for Sensor Data
export const sensorDataApi = {
  getAll: () => fetchWithDelay(mockSensorData),
  
  getByFarm: (farmId: string) => 
    fetchWithDelay(mockSensorData.filter(data => data.farmId === farmId)),
  
  getByRobot: (robotId: string) => 
    fetchWithDelay(mockSensorData.filter(data => data.robotId === robotId)),
  
  getByType: (sensorType: string) => 
    fetchWithDelay(mockSensorData.filter(data => data.sensorType === sensorType)),
  
  getByDateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return fetchWithDelay(
      mockSensorData.filter(data => {
        const dataTime = new Date(data.timestamp).getTime();
        return dataTime >= start && dataTime <= end;
      })
    );
  }
};
export const dashboardApi = {
  getStats: async () => {
    const response = await fetch(`http://localhost:8081/api/stats`);
    return response.json();
  },

  getRobotDistributionByFarm: async () => {
    const response = await fetch(`http://localhost:8081/api/robot-distribution`);
    return response.json();
  },

  
};

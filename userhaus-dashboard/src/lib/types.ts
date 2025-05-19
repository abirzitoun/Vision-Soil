
export interface Robot {
  id: string;
  name: string;
  farmId: string | null;
  farmName: string | null;
  engineerId: string | null;
  engineerName: string | null;
  status: 'available' | 'in-use' | 'maintenance';
  connectivity: 'online' | 'offline';
  lastActive: string;
  batteryLevel: number;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  };
  farmerId: string;
  farmerName: string;
  image: string;
  robotCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'engineer' | 'farmer';
  status: 'approved' | 'pending' | 'rejected';
  image_url: string;
  createdAt: string;
}

export interface SensorData {
  id: string;
  farmId: string;
  farmName: string;
  robotId: string;
  robotName: string;
  sensorType: 'temperature' | 'humidity' | 'soil_ph' | 'light';
  value: number;
  unit: string;
  timestamp: string;
}

export interface DashboardStats {
  totalFarms: number;
  activeFarms: number;
  totalRobots: number;
  totalEngineers: number;
  totalFarmers: number;
  robotStatusDistribution: {
    available: number;
    inUse: number;
    maintenance: number;
  };
}

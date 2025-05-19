import { useState, useEffect } from "react";
import { TreePine, Bot, Droplet, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
console.log("Admin component mounted");

const COLORS = ["#2D9596", "#9AD0C2", "#4BB543", "#FFA500", "#FF0033"];

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [robotDistribution, setRobotDistribution] = useState([]);
  const [robotStatus, setRobotStatus] = useState([]);
  const [farmStatus, setFarmStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [robotData, setRobotData] = useState([]);

  useEffect(() => {
    console.log("useEffect triggered");

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("fetchData running");

        // Fetch all data in parallel using Promise.all
        const [statsData, robotDist, robotStats] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRobotDistributionByFarm(),
          axios.get('http://localhost:8081/api/stats/robots'),
        ]);
        console.log(statsData)

        // Process and set stats data
        setStats(statsData);
        setRobotDistribution(robotDist);
        console.log("robotStats data:", robotStats.data);

        // Process and set robot stats data
        if (Array.isArray(robotStats.data)) {
          const formattedData = robotStats.data.map((item, index) => {
            let fillColor;

            // Assign colors based on the status
            switch (item.status) {
              case 'available':
                fillColor = '#4BB543'; // Green
                break;
              case 'in-use':
                fillColor = '#FFA500'; // Yellow
                break;
              case 'maintenance':
                fillColor = '#FF0033'; // Red
                break;
              default:
                fillColor = COLORS[index % COLORS.length]; // Default color
            }

            return {
              name: item.status,
              value: item.count,
              fill: fillColor,
            };
          });

          console.log("Formatted Data:", formattedData); // Vérifiez les données formatées ici
          setRobotData(formattedData); // Update robotData with formatted data
        } else {
          console.error('Invalid data format for robot stats:', robotStats.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetch (success or error)
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once on component mount



  return (
    <>
      <PageHeader title="Dashboard" description="VisionSoil Admin Panel" />

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-gray-200 glass-card">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Farmers" value={stats?.totalFarmers} icon={Users} />
          <StatCard title="Active Farms" value={stats?.activeFarms} icon={TreePine} />
          <StatCard title="Deployed Robots" value={stats?.deployedRobots} icon={Bot} />
          <StatCard title="Total Engineers" value={stats?.sensorNetworks} icon={Users} />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Robot Deployment by Farm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-gray-200 overflow-hidden glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Robot Deployment by Farm</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={robotDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="value" fill="#2D9596" radius={[4, 4, 0, 0]} name="Robots" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Robot Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border border-gray-200 glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Robot Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              {robotData && robotData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={robotData}
                      cx="50%"  // Center of the chart
                      cy="50%"  // Center of the chart
                      innerRadius={50}  // Reduced inner radius for smaller pie
                      outerRadius={80}  // Reduced outer radius for smaller pie
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {robotData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                    <Legend />
                  </PieChart>

                </ResponsiveContainer>
              ) : (
                <div>No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </>
  );
};

export default Admin;

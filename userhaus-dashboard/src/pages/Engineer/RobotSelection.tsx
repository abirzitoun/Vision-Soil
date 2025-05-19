import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Wifi, Signal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RobotSelection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState<number | null>(null);

  // Check if the user is logged in and is an engineer
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResponse = await fetch("http://localhost:8081/session", {
          credentials: "include", // Include session cookies
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to check session");
        }

        const sessionData = await sessionResponse.json();
        if (!sessionData.loggedIn || sessionData.user.role !== "engineer") {
          toast.error("You must be logged in as an engineer to view robots");
          navigate("/login"); // Redirect to login page
          return;
        }

        // Fetch robots if the user is logged in and is an engineer
        fetchRobots();
      } catch (error) {
        toast.error("Error checking session");
        console.error(error);
        navigate("/login"); // Redirect to login page
      }
    };

    checkSession();
  }, [navigate]);

  const fetchRobots = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/engineer/robots", {
        credentials: "include", // Include session cookies
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch robots: ${errorMessage}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        throw new Error(`Expected JSON, but got: ${responseText}`);
      }

      const data = await response.json();
      setRobots(data.robots); // Assuming the response contains a `robots` array
    } catch (error) {
      toast.error("Error fetching robots");
      console.error(error);
    }
  };

  const filteredRobots = robots.filter((robot) =>
    robot.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRobotSelect = (robotId: number) => {
    const robot = robots.find(r => r.id === robotId);
    if (robot?.status !== "available") {
      toast.error("This robot is not available for selection");
      return;
    }
    setSelectedRobot(robotId);
    toast.success("Robot selected successfully");
    navigate("/farm-selection");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold text-soil-500 hover:text-soil-600">
      Select Robot
    </h1>
    <p className="text-soil-500 hover:text-soil-600 font-semibold">
      Choose a robot to deploy for farm scanning
    </p>
  </div>
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-400" size={20} />
        <Input
          type="text"
          placeholder="Search robots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRobots.map((robot) => (
          <div
            key={robot.id}
            onClick={() => handleRobotSelect(robot.id)}
            className={`glass-morphism p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 
              ${selectedRobot === robot.id ? "ring-2 ring-soil-500" : ""}
              ${robot.status !== "available" ? "opacity-60" : ""}`}
          >
            <img
              src="/robot.png"
              alt={robot.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold text-soil-800 mb-2">{robot.name}</h3>
            <div className="flex justify-between items-center">
              <span className={`status-badge status-${robot.status}`}>
                {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
              </span>
              <div className="flex gap-2">
                <Wifi size={20} className={robot.connectivity.wifi ? "text-success" : "text-soil-300"} />
                <Signal size={20} className={robot.connectivity.cellular ? "text-success" : "text-soil-300"} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RobotSelection;
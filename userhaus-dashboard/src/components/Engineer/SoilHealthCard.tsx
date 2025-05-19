

import { Droplets, Thermometer, Activity } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const SoilHealthCard = () => {
  const { farmId } = useParams(); // Get farmId from the URL params
  const [soilData, setSoilData] = useState({
    humidity: null,
    temperature: null,
    phLevel: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch soil health data from the backend API
  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/farm/${farmId}/sensor-data`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Handle case where no sensor data is found
            setSoilData({
              humidity: "No data",
              temperature: "No data",
              phLevel: "No data",
            });
          } else {
            setError("Failed to fetch sensor data");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
          // Handle case where data is empty
          setSoilData({
            humidity: "No data",
            temperature: "No data",
            phLevel: "No data",
          });
        } else {
          // Set the fetched data
          setSoilData({
            humidity: data.humidity,
            temperature: data.temperature,
            phLevel: data.soilPH,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching soil data:", error);
        setError("Failed to load soil data");
        setLoading(false);
      }
    };

    fetchSoilData();
  }, [farmId]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state until data is fetched
  }

  if (error) {
    return <div>{error}</div>; // Show error message if there is an issue fetching data
  }

  return (
    <DashboardCard title="Soil Health">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-soil-600" />
            <span className="text-sm">Humidity</span>
          </div>
          <span className="font-semibold">
            {soilData.humidity !== null ? soilData.humidity : "No data"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-soil-600" />
            <span className="text-sm">Temperature</span>
          </div>
          <span className="font-semibold">
            {soilData.temperature !== null ? soilData.temperature : "No data"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-soil-600" />
            <span className="text-sm">pH Level</span>
          </div>
          <span className="font-semibold">
            {soilData.phLevel !== null ? soilData.phLevel : "No data"}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};
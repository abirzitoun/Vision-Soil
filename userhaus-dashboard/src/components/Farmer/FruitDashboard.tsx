import { motion } from 'framer-motion';
import { Farm, Fruit } from '@/pages/Farmer/Farmer';
import { ArrowLeft, Droplet, Leaf, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SoilHealthCard } from "@/components/Farmer/SoilHealthCard";
import { toast } from 'sonner';
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Interfaces
interface FruitDashboardProps {
  farm: Farm;
  fruit: Fruit;
  onBack: () => void;
}

// Helpers
const mapRecommendationToIndicator = (recommendation: string) => {
  const lower = recommendation.toLowerCase();

  if (lower.includes("irrigate") || lower.includes("moisture")) return "irrigate";
  if (lower.includes("ph")) return "adjust_pH";
  if (lower.includes("air quality")) return "check_air";
  if (lower.includes("shade") || lower.includes("sunlight")) return "shade_crops";
  if (lower.includes("conditions are optimal") || lower.includes("no immediate action")) return "do_nothing";

  return "other";
};

const extractStatusIndicators = (recommendations: string[]) => {
  let irrigation = "Optimal";
  let plantHealth = "Good";
  let diseases = "None";

  for (const rec of recommendations) {
    const type = mapRecommendationToIndicator(rec);

    switch (type) {
      case "irrigate":
        irrigation = "Low";
        break;
      case "adjust_pH":
      case "check_air":
      case "shade_crops":
        plantHealth = "Warning";
        break;
      case "do_nothing":
        // Nothing to do
        break;
      default:
        break;
    }
  }

  return { irrigation, plantHealth, diseases };
};


// Status Indicator Component
const StatusIndicators = ({ indicators }: { indicators: { irrigation: string, plantHealth: string, diseases: string } }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm space-y-4 border border-soil-200">
    <h3 className="text-xl font-semibold text-soil-900">Status Indicators</h3>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4">
        <Leaf className="mx-auto mb-2 text-green-500" size={24} />
        <p className="text-sm text-gray-600">Plant Health</p>
        <p className={`font-semibold ${indicators.plantHealth === "Warning" ? "text-yellow-700" : "text-green-700"}`}>
          {indicators.plantHealth}
        </p>
      </div>
      <div className="text-center p-4">
        <Droplet className="mx-auto mb-2 text-blue-500" size={24} />
        <p className="text-sm text-gray-600">Irrigation</p>
        <p className={`font-semibold ${indicators.irrigation === "Low" ? "text-red-600" : "text-blue-700"}`}>
          {indicators.irrigation}
        </p>
      </div>
      <div className="text-center p-4">
        <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={24} />
        <p className="text-sm text-gray-600">Diseases</p>
        <p className="font-semibold text-yellow-700">{indicators.diseases}</p>
      </div>
    </div>
  </div>
);

// InsightCard
const InsightCard = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded-lg bg-soil-100 p-4">
    <p className="text-sm font-medium text-soil-800">{title} {content}</p>
    <p className="text-xs text-soil-600">AI analysis based on current data</p>
  </div>
);

// Main Component
const FruitDashboard = ({ farm, fruit, onBack }: FruitDashboardProps) => {
  const [recommendation, setRecommendation] = useState<string | null>(null);
const navigate = useNavigate();
  const data = [
    { name: 'Week 1', ripeness: 20 },
    { name: 'Week 2', ripeness: 35 },
    { name: 'Week 3', ripeness: 50 },
    { name: 'Week 4', ripeness: 65 },
    { name: 'Week 5', ripeness: fruit.ripeness },
  ];

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const sensorDataResponse = await fetch(`http://localhost:8081/api/sensor_data/farm/${farm.id}`);
        if (!sensorDataResponse.ok) throw new Error("Sensor data not found");
        const sensorData = await sensorDataResponse.json();

        const response = await fetch('http://localhost:5000/recommend_ml', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sensorData),
        });

        if (!response.ok) throw new Error("Failed to get recommendation");
        const result = await response.json();
        setRecommendation(result.detailed_recommendations.join("\n"));
      } catch (error) {
        setRecommendation("No AI recommendation available.");
      }
    };

    fetchRecommendation();
  }, [farm.id]);
localStorage.setItem("farmId", farm.id);

  const recList = recommendation?.split('\n').filter(r => r.trim() !== '') || [];
  const indicators = extractStatusIndicators(recList);
  const handleClick = () => {
    // Utilisation des backticks pour l'interpolation de farmId
    navigate(`/reportf/${farm.id}`);
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-soil-700" />
          </button>
          <div className="ml-4">
            <h2 className="text-sm text-soil-600">{farm.name}</h2>
            <h1 className="text-2xl font-semibold text-soil-900">{fruit.name}</h1>
          </div>
        </div>

        <div className="flex justify-end">
        <button onClick={handleClick} className="px-4 py-2 bg-soil-600 text-white rounded-lg hover:bg-soil-700 flex items-center gap-2 mt-4">
       Farm Health Report
      </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-soil-200">
              <img src="/tomato.jpg" alt={fruit.name} className="w-full h-64 object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
                <h3 className="text-soil-600 mb-2">Current Production</h3>
                <p className="text-3xl font-semibold text-soil-900">{fruit.production}kg</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
                <h3 className="text-soil-600 mb-2">Ripeness</h3>
                <p className="text-3xl font-semibold text-soil-900">{fruit.ripeness}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <SoilHealthCard />
            </div>

            <StatusIndicators indicators={indicators} />
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
              <h3 className="text-xl font-semibold text-soil-900 mb-6">Ripeness Progression</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" />
                    <XAxis dataKey="name" stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderColor: "#E2E8F0" }} />
                    <Line type="monotone" dataKey="ripeness" stroke="#2563EB" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
              <h3 className="text-xl font-semibold text-soil-900 mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                {recList.map((line, index) => (
                  <InsightCard key={index} title={""} content={line} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FruitDashboard;

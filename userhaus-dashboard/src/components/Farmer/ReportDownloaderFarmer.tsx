import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Text, StyleSheet } from '@react-pdf/renderer';
import { ArrowLeft } from 'lucide-react';

const ReportDownloader = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState([]);
  const [zoneData, setZoneData] = useState({
    production: 0,
    ripeness: 0
  });
   const navigate = useNavigate();
  const [farmInfo, setFarmInfo] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    owner: '',
    address: '',
    image: '/farmImage.jpg',
    logo: '/logoVision.png',
    date: new Date().toLocaleDateString()
  });
  const [soilData, setSoilData] = useState({
    temperature: null,
    humidity: null,
    moisture: null,
    rain: null,
    soilPH: null
  });
  

  // Mapping sensor data to detailed explanations based on thresholds
  const mapToSensorExplanation = (soilData: any) => {
    const explanations: { [key: string]: string } = {
      soilMoisture: soilData.moisture < 20
        ? " Low Soil Moisture: The moisture level is below the ideal range for most crops (20–30%). This can lead to dehydration and poor crop growth. Recommended: Irrigate with 10–20 mm/m² of water."
        : soilData.moisture > 40
        ? " High Soil Moisture: Excessive moisture can lead to root rot and nutrient leaching. Ensure proper drainage and reduce irrigation frequency."
        : " Optimal Soil Moisture: The moisture level is within the recommended range (20–30%). Regular irrigation is maintaining soil health.",

      pH: soilData.soilPH < 6
        ? " Acidic Soil: The soil pH is below the optimal range (6.0–7.0). This can hinder nutrient uptake by plants. Recommended: Apply agricultural lime (2–3 tons/ha)."
        : soilData.soilPH > 7
        ? " Alkaline Soil: The soil pH is above the optimal range. Plants may have difficulty absorbing nutrients. Apply elemental sulfur or gypsum to adjust pH."
        : " Ideal Soil pH: The pH level is within the optimal range (6.0–7.0), which promotes healthy plant growth and nutrient absorption.",

      temperature: soilData.temperature < 18
        ? " **Low Temperature**: The temperature is below the ideal range for many crops (18–30°C). This can cause poor growth and slowed metabolism. Consider using row covers or heat lamps."
        : soilData.temperature > 35
        ? " High Temperature: High temperatures (>35°C) can lead to heat stress, reduced photosynthesis, and wilting. Shade nets or irrigation can help reduce stress."
        : " Ideal Temperature: The temperature is within the optimal range for crop growth (18–30°C).",

      humidity: soilData.humidity < 40
        ? " Low Humidity: Low humidity (<40%) can lead to water loss through transpiration. Consider using misting systems to raise humidity levels."
        : soilData.humidity > 80
        ? " High Humidity: High humidity (>80%) can increase the risk of fungal diseases. Ensure good airflow and consider using dehumidifiers."
        : " Ideal Humidity: The humidity level is within the optimal range (40–80%). Regular monitoring will ensure healthy plant growth.",

      light: soilData.light < 15000
        ? " Low Light: The light intensity is lower than needed for optimal photosynthesis. Consider improving light exposure through reflectors or supplementary lighting."
        : soilData.light > 60000
        ? " High Light: Light intensity is high and could cause leaf burn or stress. Provide shade to prevent crop damage."
        : " Ideal Light: The light level is within the optimal range for healthy plant growth (15,000–60,000 lux).",

      windSpeed: soilData.wind_speed > 30
        ? " High Wind Speed: Winds over 30 km/h can cause physical damage to plants and increase water loss. Consider using windbreaks or shade covers."
        : " Ideal Wind Speed: Wind speed is at a manageable level for crop protection."
    };

    return explanations;
  };
  const getExpandedRecommendation = (title: string): string => {
    const details: { [key: string]: string } = {
      "Please irrigate the crops to maintain soil moisture.": `
  **Recommendation:** Irrigate the crops to maintain soil moisture.
  
  **Explanation:**  Soil moisture is crucial for plant health, particularly during dry periods. Insufficient moisture leads to crop stress, stunted growth, and lower yields. Irrigation ensures healthy root development and optimal soil moisture.
  
  **Actionable Steps:**
  - Check soil moisture using moisture sensors.
  - Irrigate based on crop and soil moisture levels.
  - Monitor moisture after irrigation to ensure it stays in the optimal range.
  
  **Potential Consequences of Inaction:**  
  Delaying irrigation can result in dehydration, leading to stunted growth or crop failure.
      `,
      "Adjust the soil pH to the optimal range for plant growth.": `
  **Recommendation:** Adjust soil pH to the optimal range.
  
  **Explanation:**  Soil pH impacts nutrient availability and plant health. A pH outside the optimal range (usually 6.0-7.0) can lead to nutrient deficiencies, hindering growth.
  
  **Actionable Steps:**
  - Test soil pH with a pH meter or kit.
  - If pH is outside the optimal range, adjust it using lime to raise or sulfur to lower it.
  - Re-test pH after adjustments.
  
  **Potential Consequences of Inaction:**  
  Incorrect pH can result in poor nutrient absorption, leading to stunted growth and reduced yields.
      `,
      "Check the air quality to ensure a healthy environment.": `
  **Recommendation:** Check air quality for a healthy environment.
  
  **Explanation:**  Air quality affects plant health, especially in controlled environments like greenhouses. High pollutant levels (CO2, ozone) can reduce photosynthesis and stunt growth.
  
  **Actionable Steps:**
  - Monitor CO2, O2, and pollutants with air quality sensors.
  - Ventilate or use air purifiers if air quality is poor.
  
  **Potential Consequences of Inaction:**  
  Poor air quality reduces photosynthesis, stunting plant growth and possibly causing plant death.
      `,
      "Provide shading for the crops to protect them from intense sunlight.": `
  **Recommendation:** Provide shading to protect crops from intense sunlight.
  
  **Explanation:**  Excessive sunlight can cause heat stress, especially during the hottest parts of the day. Shading reduces temperature and minimizes water loss through evaporation, improving crop health.
  
  **Actionable Steps:**
  - Monitor temperature and sunlight levels.
  - Use shade nets or organic materials like straw for temporary shading.
  - Consider permanent shading options for long-term solutions.
  
  **Potential Consequences of Inaction:**  
  Without adequate shading, crops may wilt, suffer sunburn, and experience poor growth.
      `,
      "Conditions are optimal. No immediate action is needed.": `
  **Recommendation:** Conditions are optimal. No immediate action is needed.
  
  **Explanation:**   The current conditions (moisture, pH, air quality, temperature) are ideal for plant growth.
  
  **Actionable Steps:**
  - Continue to monitor conditions periodically.
  - Adjust management strategies if conditions change.
  
  **Potential Consequences of Inaction:**  
  No action required, but monitoring is essential to ensure conditions remain optimal.
      `
    };
  
    return details[title.trim()] || title;
  };
  

  const fetchFarmData = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/farm/${farmId}`);
      if (!response.ok) throw new Error("Farm not found");
      const data = await response.json();
      setFarmInfo((prev) => ({
        ...prev,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        owner: data.owner,
        address: data.address
      }));
    } catch (err) {
      setError('Error loading farm data.');
    }
  };

  const fetchRecommendation = async () => {
    try {
      const sensorResponse = await fetch(`http://localhost:8081/api/sensor_data/farm/${farmId}`);
      if (!sensorResponse.ok) throw new Error("Sensor data not found");
      const sensorData = await sensorResponse.json();

      const sensorExplanations = mapToSensorExplanation(sensorData);

      const response = await fetch('http://localhost:5000/recommend_ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorData),
      });

      if (!response.ok) throw new Error("Failed to get recommendation");
      const result = await response.json();
      const expanded = result.detailed_recommendations
  .map((r: string) => getExpandedRecommendation(r))
  .join('\n\n');
setRecommendation(expanded);


      setLoading(false);
    } catch (err) {
      setRecommendation("No AI recommendation available.");
      setLoading(false);
    }
  };
  const fetchSoilData = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/sensor_data/farm/${farmId}`);
      if (!response.ok) throw new Error("Sensor data not found");
  
      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        setSoilData({
          temperature: "No data",
          humidity: "No data",
          moisture: "No data",
          rain: "No data",
          soilPH: "No data"
        });
          console.log(soilData)
      } else {
        setSoilData({
          temperature: data.temperature ?? "No data",
          humidity: data.humidity ?? "No data",
          moisture: data.moisture ?? "No data",
          rain: data.rain ?? "No data",
          soilPH: data.soilPH ?? "No data", // <-- bien écrit comme dans le backend
        });
        
       
      }
    
    } catch (error) {
      console.error("Error fetching soil data:", error);
      setError("Failed to load soil data");
    } finally {
      setLoading(false);
    }
  };
  const fetchZoneData = async (farmId) => {
    const response = await fetch(`/api/zones/${farmId}`);
    const data = await response.json();
    setZoneData(data);
  };

  
  useEffect(() => {
    fetchFarmData();
    fetchSoilData();
  fetchZoneData(farmId);
    fetchRecommendation();
  }, [farmId]);
  const handleBack = () => navigate(-1);
  const generatePDF = () => {
    const input = document.getElementById('report-content');
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('farm-report.pdf');
    });
  };

  

  if (loading) return <p>Loading the report...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    
    <div id="pdf" className="p-6 bg-white text-gray-800 font-sans">
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
        

        {/* ✅ Bouton pour importer un rapport */}
        
      </div>
      <div id="report-content">
      <div className="flex items-start justify-between mb-6">
        <div className="w-1/4">
          <img src={farmInfo.logo} alt="VisionSoil Logo" className="h-20 w-auto object-contain" />
        </div>
        <div className="w-2/4 text-center pt-[56px]">
          <h1 className="text-2xl font-bold text-vision-green-dark">Farm Health Report</h1>
          <p className="text-lg text-gray-700">{farmInfo.name}-{farmInfo.owner}</p>
        </div>
        <div className="w-1/4 text-right text-sm text-gray-600 mt-[10px]">
          <p>Latitude: {farmInfo.latitude}° N</p>
          <p>Longitude: {farmInfo.longitude}° E</p>
          <p>Date: {farmInfo.date}</p>
        </div>
      </div>
{/* Executive Summary */}
<section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Executive Summary</h2>
        <p>This report provides a detailed analysis of the agricultural performance of the farm, utilizing advanced sensor data and AI-driven recommendations. Key findings include the overall health of tomato crops, predicted yield, and a comprehensive weather risk assessment to ensure optimal growth conditions.</p>
      </section>
      {/* Tomato Analysis */}
      <section className="mb-8">
  <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Tomato Crop Analysis</h2>
  <table className="w-full table-auto border-collapse">
    <thead>
      <tr>
        <th className="border p-2 text-left">Zone</th>
        <th className="border p-2 text-left">Expected Yield (kg)</th>
        <th className="border p-2 text-left">Ripeness (%)</th>
      </tr>
    </thead>
    <tbody>
      {zoneData ? (
        <>
          <tr>
            <td className="border p-2">Tomato</td>
            <td className="border p-2">6.08</td>
            <td className="border p-2">11.11</td>
          </tr>
        </>
      ) : (
        <tr>
          <td className="border p-2" colSpan={3}>No data available for analysis.</td>
        </tr>
      )}
    </tbody>
  </table>
  <p className="mt-4">
    The expected yield for each zone is calculated based on environmental conditions and crop health metrics. Weather risk assessments are categorized as "Low", "Medium", or "High" based on forecast data and historical trends.
  </p>
</section>

 {/* Sensor Data Analysis */}
 <section className="mb-8">
  <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Sensor Data Overview</h2>
  <p className="mb-4">
    The following data provides an in-depth overview of the environmental conditions affecting crop health:
  </p>
  <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border p-2 text-left">Temperature (°C)</th>
        <th className="border p-2 text-left">Humidity (%)</th>
        <th className="border p-2 text-left">Soil Moisture (%)</th>
        <th className="border p-2 text-left">Rainfall (mm)</th>
        <th className="border p-2 text-left">PH </th>
      </tr>
    </thead>
    <tbody>
      {soilData ? (
        <tr>
          <td className="border p-2">{soilData.temperature ?? "N/A"}</td>
          <td className="border p-2">{soilData.humidity ?? "N/A"}</td>
          <td className="border p-2">{soilData.moisture ?? "N/A"}</td>
          <td className="border p-2">{soilData.rain ?? "N/A"}</td>
          <td className="border p-2">{soilData.soilPH ?? "N/A"}</td>
        </tr>
      ) : (
        <tr>
          <td className="border p-2 text-center" colSpan={4}>
            No sensor data available for analysis.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</section>


<div className="mb-8">
  <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Sensor Explanations</h2>
  <ul className="list-disc list-inside space-y-2 text-sm">
    {Object.values(mapToSensorExplanation(fetchSoilData())).map((explanation, idx) => (
      <li key={idx}>{explanation}</li>
    ))}
  </ul>
</div>


{/* AI Recommendations */}
<div className="mb-8">
  <h2 className="text-2xl font-semibold border-b pb-2 mb-4">AI Recommendations</h2>
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm space-y-2 text-sm leading-relaxed">
    {recommendation
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((line, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="text-green-500 mt-1">•</span>
          <p className="text-gray-800">
            {
              // Remplace **texte** par <strong>texte</strong>
              line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={i} className="font-semibold text-black">
                      {part.slice(2, -2)}
                    </strong>
                  );
                } else {
                  return <span key={i}>{part}</span>;
                }
              })
            }
          </p>
        </div>
      ))}
  </div>
</div>


</div>

   

      {/* Generate PDF Button */}
      <div className="text-center">
        <button onClick={generatePDF} className="px-4 py-2 bg-soil-600 text-white rounded-lg hover:bg-soil-700 flex items-center gap-2 mt-4">
          Generate PDF Report
        </button>
      </div>
    </div>
  );
};

export default ReportDownloader;

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardCard } from "@/components/Engineer/DashboardCard";
import { WeatherWidget } from "@/components/Engineer/WeatherWidget";
import { SoilHealthCard } from "@/components/Engineer/SoilHealthCard";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from "@react-pdf/renderer";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";

// Load fonts for PDF
Font.register({
  family: "Helvetica",
  src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
});

const styles = StyleSheet.create({
  page: { padding: "40px", fontFamily: "Helvetica" },
  title: { fontSize: 26, textAlign: "center", marginBottom: 15, color: "#2e4a3a", fontWeight: "bold" },
  subtitle: { fontSize: 20, marginBottom: 10, color: "#4c6b52", fontWeight: "normal" },
  sectionTitle: { fontSize: 18, marginTop: 20, fontWeight: "bold", color: "#3a5a40", borderBottom: "1px solid #ddd", paddingBottom: 5 },
  text: { fontSize: 12, marginBottom: 8, color: "#5a5a5a" },
  textBold: { fontSize: 12, fontWeight: "bold", color: "#2e4a3a" },
});

// PDF report component
const MyDocument = ({ farmData, weatherData }) => {
  const financialData = { revenue: 500000, costs: 300000, netProfit: 200000, debt: 150000 };
  const cropAnalysis = { expectedYield: 1000, yieldTrends: "Stable over 3 years." };
  const riskData = { floodingRisk: "Medium", pestRisk: "Low" };

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{farmData?.name} - {farmData?.owner}</Text>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <Text style={styles.text}>Revenue: ${financialData.revenue}</Text>
        <Text style={styles.text}>Costs: ${financialData.costs}</Text>
        <Text style={styles.text}>Net Profit: ${financialData.netProfit}</Text>
        <Text style={styles.text}>Debt: ${financialData.debt}</Text>
        <Text style={styles.sectionTitle}>Crop Yield Analysis</Text>
        <Text style={styles.text}>Expected Yield: {cropAnalysis.expectedYield} tons</Text>
        <Text style={styles.text}>Trends: {cropAnalysis.yieldTrends}</Text>
        <Text style={styles.sectionTitle}>Weather</Text>
        <Text style={styles.text}>Temperature: {weatherData?.temperature}°C</Text>
        <Text style={styles.text}>Humidity: {weatherData?.humidity}%</Text>
        <Text style={styles.text}>Precipitation: {weatherData?.precipitation} mm</Text>
        <Text style={styles.sectionTitle}>Risks</Text>
        <Text style={styles.text}>Flooding Risk: {riskData.floodingRisk}</Text>
        <Text style={styles.text}>Pest Risk: {riskData.pestRisk}</Text>
        <Text style={styles.sectionTitle}>Sustainability</Text>
        <Text style={styles.text}>Carbon Footprint: {farmData?.carbonFootprint} kg CO2e</Text>
      </Page>
    </Document>
  );
};

// Center the map on farm location
const MapView = ({ position, zoom }: { position: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(position, zoom);
  return null;
};

const FarmDashboard = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/farms/${farmId}`);
        if (!response.ok) throw new Error("Farm not found");
        const data = await response.json();
        setFarmData(data);
      } catch (error) {
        console.error("Error fetching farm data:", error);
        setError("Failed to load farm data.");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRecommendation = async () => {
      try {
        const sensorDataResponse = await fetch(`http://localhost:8081/api/sensor_data/farm/${farmId}`);
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
    fetchFarmData();
  }, [farmId]);
  const handleClick = () => {
    // Utilisation des backticks pour l'interpolation de farmId
    navigate(`/report/${farmId}`);
  };
  const handleBack = () => navigate(-1);

  const customIcon = new Icon({
    iconUrl: markerIconPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const weatherData = farmData?.weather ?? null;
  const position: LatLngExpression = farmData?.latitude && farmData?.longitude ? [farmData.latitude, farmData.longitude] : [0, 0];
  return (
    <div className="space-y-8 p-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button onClick={handleBack} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-soil-500 hover:text-soil-600">Farm Dashboard - {farmData?.name}</h1>
        <p className="text-soil-600 font-semibold">{`Owner: ${farmData?.owner || "Unknown"}`}</p>
      </div>

      {/* ✅ Bouton pour importer un rapport */}
      <button onClick={handleClick} className="px-4 py-2 bg-soil-600 text-white rounded-lg hover:bg-soil-700 flex items-center gap-2 mt-4">
       Farm Health Report
      </button>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Map Section with Zones */}
        <DashboardCard className="lg:col-span-2">
          {farmData?.latitude && farmData?.longitude ? (
            <div style={{ height: "400px", width: "100%" }}>
              <MapContainer key={position.toString()} style={{ height: "100%", width: "100%" }} zoom={15}>
                <MapView position={position} zoom={15} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Draw Zones */}
                {farmData?.zones?.map((zone, index) => (
                  <Polygon
                    key={index}
                    positions={zone.coordinates}
                    pathOptions={{
                      color: zone.color,
                      fillColor: zone.color,
                      fillOpacity: 0.3
                    }}
                  >
                    <Popup>{zone.name}</Popup>
                  </Polygon>
                ))}

                {/* Marker at farm location */}
                <Marker position={position} icon={customIcon}>
                  <Popup>{farmData?.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-soil-600">No location data available for this farm</p>
            </div>
          )}
        </DashboardCard>

        {/* Weather + Soil Health */}
        <div className="flex flex-col gap-8">
          <WeatherWidget weather={weatherData} />
          <SoilHealthCard />
        </div>

        

        <DashboardCard title="AI Insights" className="h-full">
          <div className="space-y-4">
            {recommendation
              ?.split('\n')
              .filter(line => line.trim() !== '' && !line.toLowerCase().startsWith('weather-based recommendation'))
              .map((line, index) => (
                <InsightCard key={index} content={line} title={""} />
              ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

// InsightCard
const InsightCard = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded-lg bg-soil-100 p-4">
    <p className="text-sm font-medium text-soil-800">{title} {content}</p>
    <p className="text-xs text-soil-600">AI analysis based on current data</p>
  </div>
);



export default FarmDashboard;

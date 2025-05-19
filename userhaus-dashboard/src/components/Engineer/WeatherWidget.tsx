import { Cloud, Sun, Thermometer, Droplets } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCondition: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
}

export const WeatherWidget = ({ weather }: WeatherWidgetProps) => {
  if (!weather) {
    return (
      <DashboardCard title="Weather Conditions">
        <p className="text-soil-600">No weather data available</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Weather Conditions">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-semibold">{weather.temperature}°C</p>
              <p className="text-sm text-soil-600 capitalize">{weather.weatherCondition.toLowerCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-soil-600">High: {weather.highTemp}°C</p>
            <p className="text-sm text-soil-600">Low: {weather.lowTemp}°C</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-soil-200">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-soil-600" />
            <div>
              <p className="text-sm font-medium">Humidity</p>
              <p className="text-soil-600">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-soil-600" />
            <div>
              <p className="text-sm font-medium">Precipitation</p>
              <p className="text-soil-600">{weather.precipitation}%</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
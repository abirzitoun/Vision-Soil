import { motion } from 'framer-motion';
import { Farm } from '@/pages/Farmer/Farmer';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface FarmSelectionProps {
  farms: Farm[];
  onSelect: (farm: Farm) => void;
}

const FarmSelection = ({ farms, onSelect }: FarmSelectionProps) => {
  const [search, setSearch] = useState('');

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(search.toLowerCase()) ||
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-soil-500 hover:text-soil-600">Select Your Farm</h1>
          <p className="text-soil-700">Choose a farm to view its details and manage crops</p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-400" size={20} />
          <input
            type="text"
            placeholder="Search farms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-soil-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soil-500 transition-all bg-white/50 backdrop-blur-sm"
          />
        </div>

        {/* Display message if no farms found */}
        {filteredFarms.length === 0 && (
          <div className="text-center text-soil-600">
            <p>No farms found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFarms.map((farm) => (
            <motion.div
              key={farm.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => onSelect(farm)}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-soil-200">
                <div className="relative h-48">
                  <img
                    src="/farm.jpg"
                    alt={farm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soil-900/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{farm.name}</h3>
                    <p className="text-sm opacity-90">{farm.location}</p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-soil-600">Soil Moisture</p>
                    <p className="text-lg font-semibold text-soil-900">{farm.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-soil-600">Temperature</p>
                    <p className="text-lg font-semibold text-soil-900">{farm.temperature}°C</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FarmSelection;

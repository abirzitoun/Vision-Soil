
import { motion } from 'framer-motion';
import { Fruit } from '@/pages/Farmer/Farmer';
import { ArrowLeft } from 'lucide-react';

interface FruitSelectionProps {
  fruits: Fruit[];
  onSelect: (fruit: Fruit) => void;
  onBack: () => void;
  farmName: string;
}

const FruitSelection = ({ fruits, onSelect, onBack, farmName }: FruitSelectionProps) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-soil-500/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-soil-700" />
          </button>
          <div className="ml-4">
            <h2 className="text-sm text-soil-600">Selected Farm</h2>
            <h1 className="text-2xl font-semibold text-soil-900">{farmName}</h1>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-soil-500 hover:text-soil-600">Select a Crop</h2>
          <p className="text-soil-700">Choose a crop to view detailed information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fruits.map((fruit) => (
            <motion.div
              key={fruit.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => onSelect(fruit)}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-soil-200">
                <div className="relative h-48">
                  <img
                     src="/tomato.jpg"
                    alt={fruit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soil-900/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{fruit.name}</h3>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-soil-600">Production</p>
                    <p className="text-lg font-semibold text-soil-900">{fruit.production}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-soil-600">Ripeness</p>
                    <p className="text-lg font-semibold text-soil-900">{fruit.ripeness}%</p>
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

export default FruitSelection;

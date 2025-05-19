import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import FarmSelection from '@/components/Farmer/FarmSelection';
import FruitSelection from '@/components/Farmer/FruitSelection';
import FruitDashboard from '@/components/Farmer/FruitDashboard';

export type Farm = {
  id: string;
  name: string;
  location: string;
  image: string;
  humidity?: number;
  temperature?: number;
};

export type Fruit = {
  id: string;
  name: string;
  image: string;
  production: number;
  ripeness: number;
};

const Farmer = () => {
  const [step, setStep] = useState<'farm' | 'fruit' | 'dashboard'>('farm');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const userId = localStorage.getItem("userId"); // Récupération de l'ID du fermier

  // Charger les fermes du fermier
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8081/farms/farmer/${userId}`)
        .then(async (response) => {
          const farmsData = response.data;

          // Récupérer les données de capteurs pour chaque ferme
          const updatedFarms = await Promise.all(
            farmsData.map(async (farm: Farm) => {
              try {
                // Appel de l'API pour récupérer les données des capteurs
                const sensorResponse = await axios.get(`http://localhost:8081/api/farm/${farm.id}/sensor-data`);
                const { humidity, temperature } = sensorResponse.data;
                console.log(sensorResponse.data)
                return { ...farm, humidity, temperature };
                
              } catch (error) {
                console.error(`Erreur lors de la récupération des capteurs pour la ferme ${farm.id}`, error);
                return { ...farm, humidity: null, temperature: null };
                
              }
            })
          );

          setFarms(updatedFarms);
        })
        .catch(error => console.error('Erreur lors du chargement des fermes', error));

    }
    
  }, [userId]);

  // Charger les fruits après sélection d'une ferme
  const handleFarmSelect = (farm: Farm) => {
    // Enregistrer la ferme sélectionnée et son image
    setSelectedFarm(farm);
    
    // Mise à jour de l'étape
    setStep('fruit');
  
    // Récupérer les fruits de la ferme sélectionnée
    axios.get(`http://localhost:8081/zones/farm/${farm.id}`)
      .then(response => setFruits(response.data))
      .catch(error => console.error('Erreur lors du chargement des fruits', error));
  };
  

  // Sélection d'un fruit pour afficher le tableau de bord
  const handleFruitSelect = (fruit: Fruit) => {
    setSelectedFruit(fruit);
    setStep('dashboard');
    localStorage.getItem("farmId");
  };

  // Retour à l'étape précédente
  const handleBack = () => {
    if (step === 'dashboard') {
      setStep('fruit');
      setSelectedFruit(null);
    } else if (step === 'fruit') {
      setStep('farm');
      setSelectedFarm(null);
      localStorage.removeItem("farmId");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soil-100 to-soil-50 p-6">
      <AnimatePresence mode="wait">
        {step === 'farm' && (
          <motion.div
            key="farm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FarmSelection farms={farms} onSelect={handleFarmSelect} />
          </motion.div>
        )}

        {step === 'fruit' && selectedFarm && (
          <motion.div
            key="fruit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FruitSelection 
              fruits={fruits} 
              onSelect={handleFruitSelect} 
              onBack={handleBack}
              farmName={selectedFarm.name} 
            />
          </motion.div>
        )}

        {step === 'dashboard' && selectedFarm && selectedFruit && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FruitDashboard 
              farm={selectedFarm} 
              fruit={selectedFruit} 
              onBack={handleBack} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Farmer;

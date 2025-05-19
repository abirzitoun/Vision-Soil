import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Plus, Search, UserPlus, Tractor } from "lucide-react"; // 👈 added icons here
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AddFarmDialog } from "@/components/Engineer/AddFarmDialog";
import { AddFarmerDialog } from "@/components/Engineer/AddFarmerDialog";

const FarmSelection = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = useState(false);

  const fetchFarms = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/farms");
      if (!response.ok) throw new Error("Erreur lors de la récupération des fermes");
      const data = await response.json();
      console.log("Farms:", data);
      setFarms(data);
    } catch (error) {
      console.error("Error fetching farms:", error);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleFarmSelect = (farm: any) => {
    setSelectedFarm(farm);
    toast.success("Farm selected successfully");
    navigate(`/dashboard/${farm.id}`);
    fetchFarms();
  };

  const handleAddFarm = (newFarm: any) => {
    setFarms((prevFarms) => [...prevFarms, newFarm]);
    toast.success("Farm created successfully!");
    setIsDialogOpen(false);
    fetchFarms();
  };
  <AddFarmDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  onFarmAdded={handleAddFarm}
/>


  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

      <div className="text-center space-y-2">
  <h1 className="text-3xl font-bold text-soil-500 hover:text-soil-600">
    Select a Farm
  </h1>
  <p className="text-soil-500 hover:text-soil-600 font-semibold">
    Choose a farm to begin monitoring
  </p>
  </div>


      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-400" size={20} />
        <Input
          type="text"
          placeholder="Search farms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex justify-end gap-x-4">
  <Button 
    onClick={() => setIsAddFarmerDialogOpen(true)}
    className="bg-soil-500 hover:bg-soil-600"
  >
    <UserPlus className="mr-2 h-4 w-4" />
    Add Farmer
  </Button>
  <Button
    onClick={() => setIsDialogOpen(true)}
    className="bg-soil-500 hover:bg-soil-600"
  >
    <Tractor className="mr-2 h-4 w-4" />
    Add Farm
  </Button>
</div>



      {farms.length === 0 ? (
        <p className="text-center text-gray-500">No farms available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id || `${farm.name}-${farm.owner}`}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer transition-transform duration-300 hover:scale-105 border border-gray-200"
              onClick={() => handleFarmSelect(farm)}
            >
              <img
                src={farm.image_url ? `http://localhost:8081${farm.image_url}` : "/placeholder.svg"}
                alt={farm.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  // Fallback to a placeholder image if the image fails to load
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{farm.name}</h3>
              <p className="text-gray-600">
                Owner: {farm?.owner_first_name ? `${farm?.owner_first_name} ${farm?.owner_last_name}` : "No owner"}
              </p>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <p>{farm.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

<AddFarmerDialog
        open={isAddFarmerDialogOpen}
        onOpenChange={setIsAddFarmerDialogOpen}
      />
      <AddFarmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFarmAdded={handleAddFarm}
      />
    </div>
  );
};

export default FarmSelection;
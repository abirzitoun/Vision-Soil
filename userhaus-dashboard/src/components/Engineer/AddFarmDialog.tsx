import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Zone style
const zoneStyle = {
  color: '#2e4a3a',
  fillColor: '#3a5a40',
  fillOpacity: 0.3,
  weight: 2
};

// Available fruits/vegetables and their colors
const crops = {
  Tomato: "#FF6347",
  Potato: "#D2B48C",
  Strawberry: "#FF4C4C",
  Lettuce: "#228B22",
  Carrot: "#FFA500",
  Cucumber: "#006400",
  Eggplant: "#800080",
  Pepper: "#FF4500"
};

interface Farmer {
  id: number;
  first_name: string;
  last_name: string;
}

interface AddFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFarmAdded: (newFarm: any) => void;
}

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

export const AddFarmDialog = ({ open, onOpenChange, onFarmAdded }: AddFarmDialogProps) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [zones, setZones] = useState<{ name: string, color: string, coordinates: [number, number][] }[]>([]);
  const [currentZone, setCurrentZone] = useState<[number, number][]>([]);
  const [currentCrop, setCurrentCrop] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8081/api/farmers")
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(setFarmers)
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load farmers");
        });
    }
  }, [open]);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const newPosition: [number, number] = [lat, lng];

    if (!formData.latitude || !formData.longitude) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const locationName = data.display_name.split(',')[0];

        setFormData(prev => ({
          ...prev,
          location: locationName || "Unnamed location",
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
      } catch (error) {
        console.error("Geocoding error:", error);
        toast.error("Failed to detect location name");
      }
    }

    setCurrentZone(prev => [...prev, newPosition]);
    toast.info(`Added point ${currentZone.length + 1} to current zone`);
  };

  const handleAddZone = () => {
    if (currentZone.length < 3) return toast.error("Each zone needs at least 3 points");
    if (!currentCrop) return toast.error("Select a crop for this zone");

    setZones(prev => [...prev, {
      name: currentCrop,
      color: crops[currentCrop],
      coordinates: currentZone
    }]);

    setCurrentZone([]);
    setCurrentCrop("");
    toast.success("Zone added");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarmerId) return toast.error("Select a farmer");
    if (!formData.name) return toast.error("Farm name required");
    if (zones.length === 0) return toast.error("Add at least one zone");

    const selectedFarmer = farmers.find(f => f.id === Number(selectedFarmerId));
    if (!selectedFarmer) return toast.error("Farmer not found");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("latitude", formData.latitude);
    formDataToSend.append("longitude", formData.longitude);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    formDataToSend.append("farmer_first_name", selectedFarmer.first_name);
    formDataToSend.append("farmer_last_name", selectedFarmer.last_name);
    formDataToSend.append("zones", JSON.stringify(zones));
    console.log("Data being sent to server:", formData);


    try {
      const res = await fetch("http://localhost:8081/api/farm", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Creation failed");
      const newFarm = await res.json();
      toast.success("Farm with zones created!");
      onFarmAdded(newFarm);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create farm");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", location: "", latitude: "", longitude: "", image: null });
    setSelectedFarmerId("");
    setZones([]);
    setCurrentZone([]);
    setCurrentCrop("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-morphism p-6">
        <DialogHeader>
          <DialogTitle>Add New Farm with Zones</DialogTitle>
          <DialogDescription>Create farm and define multiple zones</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm name */}
          <div>
            <label>Farm Name</label>
            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required placeholder="Enter farm name" />
          </div>

          {/* Location */}
          <div>
            <label>Location</label>
            <Input value={formData.location} readOnly placeholder="Auto-detected from map" required />
          </div>

          {/* Draw zones */}
          <div className="space-y-4">
            <label>Draw Zones</label>

            {/* Select crop for the zone */}
            <Select value={currentCrop} onValueChange={setCurrentCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop (vegetable/fruit)" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(crops).map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Map */}
            <div className="h-[400px] w-full border rounded-lg overflow-hidden relative">
              <MapContainer
                center={formData.latitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : [0, 0]}
                zoom={formData.latitude ? 13 : 2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={handleMapClick} />
                {zones.map((zone, i) => (
                  <Polygon key={i} positions={zone.coordinates} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.3 }}>
                    <Popup>{zone.name}</Popup>
                  </Polygon>
                ))}
                {currentZone.map((pos, index) => (
                  <Marker key={`c-${index}`} position={pos} icon={customIcon}>
                    <Popup>Point {index + 1}</Popup>
                  </Marker>
                ))}
                {currentZone.length >= 3 && (
                  <Polygon positions={currentZone} pathOptions={{ color: crops[currentCrop] || "#000000", fillColor: crops[currentCrop] || "#000000", fillOpacity: 0.2 }} />
                )}
              </MapContainer>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setCurrentZone([])} disabled={currentZone.length === 0}>
                Clear
              </Button>
              <Button type="button" onClick={handleAddZone} disabled={currentZone.length < 3 || !currentCrop}>
                Add Zone
              </Button>
            </div>

          </div>

          {/* Farmer selection */}
          <div>
            <label>Select Owner</label>
            <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers.map(farmer => (
                  <SelectItem key={farmer.id} value={farmer.id.toString()}>{farmer.first_name} {farmer.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image upload */}
          <div>
            <label>Image</label>
            <Input type="file" onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            <Button type="submit" disabled={zones.length === 0}>Add Farm with Zones</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

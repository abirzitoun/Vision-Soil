import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { farmsApi, usersApi, robotsApi } from "@/lib/api";
import { Farm, User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { 
  Leaf,
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  MapPin,
  User as UserIcon,
  Image,
  Zap
} from "lucide-react";

// Validation schema for farm form
const farmSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  location: z.string().min(5, { message: "Location must be at least 5 characters" }),
  farmerId: z.string({ required_error: "Please select a farmer" }),
  status: z.enum(["active", "inactive"]),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  image: z.string().default("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop"),
});

type FarmFormValues = z.infer<typeof farmSchema>;

const FarmManagement = () => {
  const [activeTab, setActiveTab] = useState("table-view");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms
  const addForm = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      location: "",
      farmerId: "",
      status: "active",
      latitude: 0,
      longitude: 0,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    },
  });

  const editForm = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      location: "",
      farmerId: "",
      latitude: 0,
      longitude: 0,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    },
  });

  useEffect(() => {
    if (selectedFarm) {
      const { gpsCoordinates } = selectedFarm;
      editForm.reset({
        name: selectedFarm.name,
        location: selectedFarm.location,
        farmerId: selectedFarm.farmerId,
        status: selectedFarm.status,
        latitude: gpsCoordinates ? gpsCoordinates.latitude : '',
        longitude: gpsCoordinates ? gpsCoordinates.longitude : '',
        image: selectedFarm.image,
      });
    }
  }, [selectedFarm, editForm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [farmsRes, farmersRes, robotsRes] = await Promise.all([
        axios.get("http://localhost:8081/api/farms"),
        axios.get("http://localhost:8081/api/farmers"),
        axios.get("http://localhost:8081/api/admin/robots"),
      ]);

      const farmsData = farmsRes.data;
      const farmersData = farmersRes.data;
      const robotsData = robotsRes.data;
      window.localStorage.setItem("farmer", farmersData);
      console.log("Farms data:", farmsData);
      console.log("Farmers data:", farmersData);
      console.log("Robots data:", robotsData);

      const enrichedFarms = farmsData.map(farm => {
        const farmer = farmersData.find(f => f.id === farm.owner_id);
        const farmRobots = robotsData.filter(robot => robot.farm_id === farm.id);
        const robotCount = farmRobots.length;
        console.log(`Farm ID: ${farm.id}, Robots:`, farmRobots);

        const farmStatus = farmRobots.some(robot => robot.status === "active" || robot.status === "available") ? "active" : "inactive";
        console.log(`Farm ID: ${farm.id}, Status: ${farmStatus}`);

        return {
          ...farm,
          farmerName: farmer ? `${farmer.first_name} ${farmer.last_name}` : "Unknown",
          robotCount,
          status: farmStatus,
        };
      });

      console.log("Enriched Farms:", enrichedFarms);
      setFarms(enrichedFarms);
      setFarmers(farmersData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (values: FarmFormValues) => {
    try {
      setLoading(true);
      
      const farmer = farmers.find(f => f.id === values.farmerId);
      const farmerName = farmer ? `${farmer.first_name} ${farmer.last_name}` : "Unknown";
      
      const farmData = {
        name: values.name,
        location: values.location,
        gpsCoordinates: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        farmerId: values.farmerId,
        farmerName: farmerName,
        status: values.status,
        image: values.image,
        robotCount: 0,
      };
      
      const newFarm = await farmsApi.create(farmData);
      setFarms([...farms, newFarm]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast.success(`Farm ${newFarm.name} added successfully`);
    } catch (error) {
      console.error("Error creating farm:", error);
      toast.error("Failed to create farm");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFarm = async (values) => {
    if (!selectedFarm) {
      console.error(" No farm selected for update.");
      toast.error("No farm selected.");
      return;
    }

    try {
      setLoading(true);

      let farmerId = null;
      const storedFarmer = window.localStorage.getItem("farmer");

      if (storedFarmer) {
        try {
          const farmerData = JSON.parse(storedFarmer);
          farmerId = farmerData?.id || null;
        } catch (parseError) {
          console.error("❌ Failed to parse farmer data:", parseError);
          farmerId = null;
        }
      }

      if (!values.name || !values.location) {
        console.error(" Missing required fields:", values);
        toast.error("Missing required fields");
        return;
      }

      const updateData = {
        name: values.name,
        location: values.location,
        owner_id: values.farmerId || farmerId,
        image_url: values.image_url || null,
        latitude: 40.7128,
        longitude: -74.0060,
      };

      console.log("✅ Sending update data:", updateData);

      const response = await axios.put(
        `http://localhost:8081/api/farms/${selectedFarm.id}`,
        updateData
      );

      const updatedFarm = response.data;
      setFarms(farms.map((farm) => (farm.id === selectedFarm.id ? updatedFarm : farm)));

      setIsEditDialogOpen(false);
      toast.success(` Farm updated successfully!`);
      fetchData();
    } catch (error) {
      console.error(" Error updating farm:", error);

      if (error.response) {
        console.error(" Server Response:", error.response.data);
      }

      toast.error("Failed to update farm. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (!selectedFarm) return;
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteFarm = async (id: string) => {
    try {
      setLoading(true);

      const response = await axios.delete(`http://localhost:8081/api/delete/farms/${id}`);

      if (response.status === 200) {
        setFarms(farms.filter(farm => farm.id !== id));
        toast.success("Farm deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting farm:", error);
      toast.error("Failed to delete farm");
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    const demoCoordinates = {
      latitude: 38.5025 + (Math.random() * 2 - 1),
      longitude: -122.2654 + (Math.random() * 2 - 1),
    };
    
    const form = isAddDialogOpen ? addForm : editForm;
    form.setValue("latitude", demoCoordinates.latitude);
    form.setValue("longitude", demoCoordinates.longitude);
    
    toast.success("GPS coordinates updated");
  };

  const columns: ColumnDef<Farm>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
         src="/farm.jpg"
          alt={row.original.name}
          className="w-16 h-16 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Farm Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.original.location,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <StatusBadge 
            variant={status === "active" ? "active" : "rejected"}
          >
            {status === "active" ? "Active" : "Inactive"}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "farmerName",
      header: "Owner",
      cell: ({ row }) => row.original.farmerName,
    },
    {
      accessorKey: "robotCount",
      header: "Robots",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Zap size={14} className="text-primary" />
          <span>{row.original.robotCount}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.createdAt), "MMM d, yyyy");
        } catch (e) {
          return row.original.createdAt;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-soil-200 shadow-md">
              {/* <DropdownMenuItem 
                onClick={() => {
                  setSelectedFarm(row.original);
                  setIsEditDialogOpen(true);
                }}
                className="flex items-center gap-2 text-soil-700 cursor-pointer"
              >
                <Edit size={14} /> Edit
              </DropdownMenuItem> */}
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedFarm(row.original);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex items-center gap-2 text-error cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader 
        title="Farm Management" 
        description="Manage your farms and assign robots to them."
      >
        
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-soil-100">
          
          <TabsTrigger value="table-view">Table View</TabsTrigger>
          
        </TabsList>
        <TabsContent value="table-view" className="space-y-4">
          <Card className="border-soil-200 glass-card">
            <CardContent className="p-6">
              <DataTable 
                columns={columns} 
                data={farms} 
                searchPlaceholder="Search farms..." 
                searchKey="name" 
              />
            </CardContent>
          </Card>
        </TabsContent>
        {/* <TabsContent value="grid-view" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-soil-200 glass-card">
                  <CardContent className="p-0">
                    <div className="h-48 animate-pulse bg-soil-100 rounded-t-md"></div>
                    <div className="p-4">
                      <div className="h-5 w-32 animate-pulse bg-soil-100 rounded-md mb-2"></div>
                      <div className="h-4 w-48 animate-pulse bg-soil-100 rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : farms.length === 0 ? (
            <Card className="border-soil-200 glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Leaf size={48} className="text-soil-400 mb-4" />
                  <h3 className="text-xl font-medium text-soil-700 mb-2">No Farms Found</h3>
                  <p className="text-soil-500 max-w-md">
                    You haven't added any farms yet. Click the "Add Farm" button to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {farms.map((farm) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-soil-200 overflow-hidden h-full glass-card">
                      <div className="h-48 relative">
                        <img 
                          src="/farm.jpg" 
                          alt={farm.name} 
                          
                        />
                        <div className="absolute top-4 right-4">
                          <StatusBadge 
                            variant={farm.status === "active" ? "active" : "rejected"}
                          >
                            {farm.status === "active" ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                          {farm.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin size={14} className="text-soil-500" />
                          {farm.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
                          <Separator className="bg-soil-100" />
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <UserIcon size={16} className="text-soil-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium">Farm Owner</div>
                                <div className="text-xs text-soil-500">{farm.farmerName}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Zap size={16} className="text-soil-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium">Robots Deployed</div>
                                <div className="text-xs text-soil-500">{farm.robotCount} robots</div>
                              </div>
                            </div>
                            
                           
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2 border-t border-soil-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-soil-700"
                          onClick={() => {
                            setSelectedFarm(farm);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-error"
                          onClick={() => {
                            setSelectedFarm(farm);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent> */}

       
      </Tabs>

    


      {/* Delete Farm Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Delete Farm</DialogTitle>
            <DialogDescription>
              Review the farm details before deletion.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFarm && (
            <div className="p-4 mb-4 border border-soil-200 rounded-md bg-soil-50">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedFarm.image ? `http://localhost:8081${selectedFarm.image}` : "/placeholder.svg"}
                  alt={selectedFarm.name} 
                  className="w-16 h-16 object-cover rounded-md border border-soil-200"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div>
                  <div className="font-medium text-lg">{selectedFarm.name}</div>
                  <div className="text-sm text-soil-500">{selectedFarm.location}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-soil-200 grid grid-cols-2 gap-2 text-sm">
                <div className="text-soil-600">Status:</div>
                <div className="capitalize">{selectedFarm.status}</div>
                <div className="text-soil-600">Owner:</div>
                <div>{selectedFarm.farmerName}</div>
                <div className="text-soil-600">Robots:</div>
                <div>{selectedFarm.robotCount} robots deployed</div>
                
              </div>
              
              {selectedFarm.robotCount > 0 && (
                <div className="mt-4 p-3 bg-warning/10 text-warning rounded-md text-sm">
                  Note: This farm has {selectedFarm.robotCount} robots assigned to it.
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-soil-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirmation}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFarm?.robotCount ? (
                <>
                  <p className="mb-2">
                    This farm has <strong>{selectedFarm.robotCount} robots</strong> assigned to it. Deleting this farm will:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li>Remove all robot assignments from this farm</li>
                    <li>Set these robots as unassigned</li>
                    <li>Permanently delete the farm record</li>
                  </ul>
                  <p>This action cannot be undone.</p>
                </>
              ) : (
                "Are you sure you want to delete this farm? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-soil-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteFarm(selectedFarm?.id)}
              className="bg-error hover:bg-error/90"
            >
              Yes, Delete Farm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FarmManagement;
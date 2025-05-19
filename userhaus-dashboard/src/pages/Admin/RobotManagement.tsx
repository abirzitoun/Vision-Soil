import axios from 'axios';
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
import { robotsApi, farmsApi, usersApi } from "@/lib/api";
import { Robot, Farm, User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Zap, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  BatteryMedium, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  User as UserIcon,
  MapPin
} from "lucide-react";

// Validation schema for robot form
const robotSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  farmId: z.string().nullable().optional(),  // Allow `null` and `undefined`
  engineerId: z.string().nullable().optional(),  // Allow `null` and `undefined`
  status: z.enum(["available", "in-use", "maintenance"]),
  connectivity: z.enum(["online", "offline"]),
});


type RobotFormValues = z.infer<typeof robotSchema>;

// Validation schema for engineer assignment
const assignEngineerSchema = z.object({
  engineerId: z.string().min(1, { message: "Please select an engineer" }),
  robotIds: z.array(z.string()).min(1, { message: "Please select at least one robot" }),
});

type AssignEngineerFormValues = z.infer<typeof assignEngineerSchema>;

const RobotManagement = () => {
  const [activeTab, setActiveTab] = useState("grid-view");
  const [robots, setRobots] = useState<Robot[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedRobotIds, setSelectedRobotIds] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms
  const addForm = useForm<RobotFormValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: {
      name: "",
      farmId: null,
      engineerId: null,
      status: "available",
      connectivity: "online",
    },
  });

  const editForm = useForm<RobotFormValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: {
      name: "",
      farmId: null,
      engineerId: null,
      status: "available",
      connectivity: "online",
    },
  });

  const assignForm =useForm({
    defaultValues: {
      robotIds: [], // Assurez-vous que robotIds est initialisé
    },
  });

  // Set edit form values when a robot is selected
  useEffect(() => {
    if (selectedRobot) {
      editForm.reset({
        name: selectedRobot.name,
        farmId: selectedRobot.farmId,
        engineerId: selectedRobot.engineerId,
        status: selectedRobot.status,
        connectivity: selectedRobot.connectivity,
      });
    }
  }, [selectedRobot, editForm]);

  useEffect(() => {
    fetchdata();
  }, []);

  

  // Fonction pour récupérer toutes les données
  const fetchdata = async () => {
    try {
      setLoading(true);
  
      // Récupérer toutes les fermes, ingénieurs et robots en une seule requête parallèle
      const [farmsRes, engineersRes, robotsRes] = await Promise.all([
        axios.get("http://localhost:8081/api/farms"),
        axios.get("http://localhost:8081/api/engineers"),
        axios.get("http://localhost:8081/api/admin/robots"),
      ]);
  
      const farmsData = farmsRes.data;
      const engineersData = engineersRes.data;
      const robotsData = robotsRes.data;
  
      console.log("Farms data:", farmsData); // Vérifier les données dans la console
      console.log("Engineers data:", engineersData);
      console.log("Robots data:", robotsData);
  
      // Associer chaque robot à sa ferme et à son ingénieur
      const enrichedRobots = robotsData.map(robot => {
        const farm = farmsData.find(f => f.id === robot.farm_id); // Trouver la ferme associée
        const engineer = engineersData.find(e => e.id === robot.engineer_id); // Trouver l'ingénieur associé
  
        return {
          ...robot,
          farmName: farm ? farm.name : "Unknown Farm", // Nom de la ferme
          engineerName: engineer ? `${engineer.first_name} ${engineer.last_name}` : "Unknown Engineer", // Nom de l'ingénieur
        };
      });
      
  
      console.log("Enriched Robots:", enrichedRobots); // Vérifier les robots enrichis
  
      // Mettre à jour les états
      setRobots(enrichedRobots);
      setFarms(farmsData);
      setEngineers(engineersData);
  
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateRobot = async (values: RobotFormValues) => {
    try {
      setLoading(true);
  
      // Vérifier que tous les champs obligatoires sont présents
      if (!values.name || !values.status || !values.connectivity) {
        toast.error("Name, status, and connectivity are required");
        console.error("Missing fields:", values);
        return;
      }
  
      // Préparer les données à envoyer
      const newRobotData: any = {
        name: values.name,
        status: values.status,
        connectivity: values.connectivity,
      };
  
      // Ajouter farmId et engineerId si présents
      if (values.farmId) {
        const farmId = parseInt(values.farmId, 10);
        if (isNaN(farmId)) {
          toast.error("Invalid farmId");
          console.error("Invalid farmId:", values);
          return;
        }
        newRobotData.farm_id = farmId;
      }
  
      if (values.engineerId) {
        const engineerId = parseInt(values.engineerId, 10);
        if (isNaN(engineerId)) {
          toast.error("Invalid engineerId");
          console.error("Invalid engineerId:", values);
          return;
        }
        newRobotData.engineer_id = engineerId;
      }
  
      console.log("Data sent to API:", newRobotData); // 👈 Log des données envoyées
  
      const response = await fetch('http://localhost:8081/api/add/robots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRobotData),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Récupérer la réponse du serveur
        console.error("Server response:", errorText);
        throw new Error(`Failed to create robot: ${response.statusText}`);
      }
  
      const createdRobot = await response.json();
      setRobots(prevRobots => [...prevRobots, createdRobot]);
      setIsAddDialogOpen(false);
      toast.success(`Robot added successfully`);
      fetchdata();
    } catch (error) {
      console.error("Error creating robot:", error);
      toast.error("Failed to create robot");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleUpdateRobot = async (values: RobotFormValues) => {
    if (!selectedRobot) {
      console.error("No robot selected for update");
      toast.error("No robot selected for update");
      return;
    }
  
    try {
      setLoading(true);
  
      // Validation des champs nécessaires
      if (!values.name || !values.farmId || !values.engineerId || !values.status || !values.connectivity) {
        toast.error("All fields are required");
        console.error("Missing fields:", values);  // Log des champs manquants
        return;
      }
  
      // Conversion des IDs en entiers
      const farmId = parseInt(values.farmId, 10);  // Conversion de farmId en entier
      const engineerId = parseInt(values.engineerId, 10);  // Conversion de engineerId en entier
  
      if (isNaN(farmId) || isNaN(engineerId)) {
        toast.error("Invalid farmId or engineerId");
        return;
      }
  
      const updateData = {
        name: values.name,
        farmId: farmId,
        engineerId: engineerId,
        status: values.status,
        connectivity: values.connectivity,
      };
  
      console.log("Data to update robot:", updateData);  // Log des données envoyées
  
      // Appel à l'API pour mettre à jour le robot
      const response = await fetch(`http://localhost:8081/api/update/robots/${selectedRobot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update robot: ${response.statusText}`);
      }
  
      const updatedRobot = await response.json();
      console.log("Updated robot:", updatedRobot);  // Log de la réponse de l'API
  
      // Mettre à jour l'état des robots avec le robot mis à jour
      setRobots(prevRobots =>
        prevRobots.map(robot =>
          robot.id === selectedRobot.id ? updatedRobot : robot
        )
      );
  
      // Fermer le dialogue d'édition
      setIsEditDialogOpen(false);
  
      // Afficher un message de succès
      toast.success(`Robot ${updatedRobot.name} updated successfully`);
      fetchdata();
    } catch (error) {
      console.error("Error updating robot:", error);
      toast.error("Failed to update robot");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRobot = async () => {
    if (!selectedRobot) return;
    console.log("Robot ID to delete:", selectedRobot.id);  // Vérifie l'ID avant la requête
    
    try {
        setLoading(true);
        await axios.delete(`http://localhost:8081/api/delete/robot/${selectedRobot.id}`);
        setRobots(robots.filter(robot => robot.id !== selectedRobot.id));
        setIsDeleteDialogOpen(false);
        toast.success("Robot deleted successfully");
        fetchdata();
    } catch (error) {
        console.error("Error deleting robot:", error);
        toast.error("Failed to delete robot");
    } finally {
        setLoading(false);
    }
};


  const handleAssignEngineer = async (values: AssignEngineerFormValues) => {
    try {
        setLoading(true);

        console.log("Form Values Received:", values);

        // Log the API request being sent
        console.log("Sending request to assign engineer:", {
            robotIds: values.robotIds,
            engineerId: values.engineerId,
        });

        // Fetch the current state of robots before updating
        const robotsBeforeUpdate = robots.filter(robot => values.robotIds.includes(robot.id));

        // Send request to assign engineer
        const response = await fetch('http://localhost:8081/api/robots/assign-engineer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                robotIds: values.robotIds,
                engineerId: values.engineerId,
            }),
        });

        // Fetch updated data
        fetchdata();

        console.log("API Response Status:", response.status, response.statusText);

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("API Error Response:", errorResponse);
            throw new Error("Failed to assign engineer");
        }

        // Get the updated robot list from the API response
        const updatedRobots = await response.json();
        console.log("API Success Response - Updated Robots:", updatedRobots);

        // Update the frontend robot list
        setRobots((prevRobots) => {
            const updatedRobotsList = prevRobots.map((robot) => {
                // Check if the robot was just updated
                const updatedRobot = updatedRobots.find((r) => r.id === robot.id);
                
                if (updatedRobot) {
                    // If the robot was "available", set it to "in_use"
                    if (robot.status === "available") {
                        updatedRobot.status = "in_use";
                    }
                    return updatedRobot;
                }
                return robot; // Keep the existing robot if it wasn’t updated
            });

            console.log("Updated Robots List:", updatedRobotsList);
            return updatedRobotsList;
        });

        // Close dialog and reset form
        setIsAssignDialogOpen(false);
        assignForm.reset();
        setSelectedRobotIds([]);

        // Get engineer details for the success message
        const engineer = engineers.find((e) => e.id === values.engineerId);
        const engineerName = engineer ? `${engineer.first_name} ${engineer.last_name}` : "Engineer";

        console.log("Engineer Assigned:", engineerName);

        // Show success message
        toast.success(`${updatedRobots.length} robots assigned to ${engineerName}`);
    } catch (error) {
        console.error("Error assigning engineer:", error);
        toast.error("Failed to assign engineer");
    } finally {
        setLoading(false);
        console.log("Loading state set to false");
    }
};


  // Table columns
  const columns: ColumnDef<Robot>[] = [
    {
      accessorKey: "name",
      header: "Robot Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <StatusBadge 
            variant={status}
          >
            {status === "available" ? "Available" : 
             status === "in-use" ? "In Use" : 
             "Maintenance"}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "connectivity",
      header: "Connectivity",
      cell: ({ row }) => {
        const connectivity = row.original.connectivity;
        return (
          <div className="flex items-center">
            {connectivity === "online" ? (
              <>
                <Wifi size={14} className="text-success mr-1" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-soil-400 mr-1" />
                <span>Offline</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "batteryLevel",
      header: "Battery",
      cell: ({ row }) => {
        const batteryLevel = row.original.batteryLevel;
        return (
          <div className="flex items-center">
            <BatteryMedium size={14} className={
              batteryLevel > 70 ? "text-success mr-1" :
              batteryLevel > 30 ? "text-warning mr-1" :
              "text-error mr-1"
            } />
            <span>{batteryLevel}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "farmName",
      header: "Farm",
      cell: ({ row }) => row.original.farmName || "-",
    },
    {
      accessorKey: "engineerName",
      header: "Engineer",
      cell: ({ row }) => row.original.engineerName || "-",
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.lastActive), "MMM d, yyyy HH:mm");
        } catch (e) {
          return row.original.lastActive;
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
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedRobot(row.original);
                  setIsEditDialogOpen(true);
                }}
                className="flex items-center gap-2 text-soil-700 cursor-pointer"
              >
                <Edit size={14} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedRobot(row.original);
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
        title="Robot Management" 
        description="Manage your VisionSoil robots, assign them to farms and engineers."
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              addForm.reset();
              setIsAddDialogOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <Zap size={16} />
            <span>Add Robot</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              assignForm.reset();
              setIsAssignDialogOpen(true);
            }}
            className="flex items-center gap-1"
            disabled={robots.filter(r => !r.engineerId).length === 0}
          >
            <UserIcon size={16} />
            <span>Assign Engineer</span>
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-soil-100">
          <TabsTrigger value="grid-view">Card View</TabsTrigger>
          <TabsTrigger value="table-view">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid-view" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border-soil-200 glass-card">
                  <CardContent className="p-6">
                    <div className="h-48 animate-pulse bg-soil-100 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : robots.length === 0 ? (
            <Card className="border-soil-200 glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Zap size={48} className="text-soil-400 mb-4" />
                  <h3 className="text-xl font-medium text-soil-700 mb-2">No Robots Found</h3>
                  <p className="text-soil-500 max-w-md">
                    You haven't added any robots yet. Click the "Add Robot" button to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {robots.map((robot) => (
                  <motion.div
                    key={robot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-soil-200 overflow-hidden h-full glass-card bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">
                            {robot.name}
                          </CardTitle>
                          <StatusBadge 
                            variant={robot.status}
                          >
                            {robot.status === "available" ? "Available" : 
                            robot.status === "in-use" ? "In Use" : 
                            "Maintenance"}
                          </StatusBadge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {robot.connectivity === "online" ? (
                                <Wifi size={18} className="text-success" />
                              ) : (
                                <WifiOff size={18} className="text-soil-400" />
                              )}
                              <span className="text-sm">
                                {robot.connectivity === "online" ? "Online" : "Offline"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BatteryMedium size={18} className={
                                robot.batteryLevel > 70 ? "text-success" :
                                robot.batteryLevel > 30 ? "text-warning" :
                                "text-error"
                              } />
                              <span className="text-sm">{robot.batteryLevel}%</span>
                            </div>
                          </div>
                          
                          <Separator className="bg-soil-100" />
                          
                          <div className="space-y-2">
                            {robot.farmName && (
                              <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-soil-500 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium">Farm</div>
                                  <div className="text-xs text-soil-500">{robot.farmName}</div>
                                </div>
                              </div>
                            )}
                            
                            {robot.engineerName && (
                              <div className="flex items-start gap-2">
                                <UserIcon size={16} className="text-soil-500 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium">Engineer</div>
                                  <div className="text-xs text-soil-500">{robot.engineerName}</div>
                                </div>
                              </div>
                            )}
                            
                           
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2 border-t border-soil-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-soil-700"
                          onClick={() => {
                            setSelectedRobot(robot);
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
                            setSelectedRobot(robot);
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
        </TabsContent>

        <TabsContent value="table-view" className="space-y-4">
          <Card className="border-soil-200 glass-card">
            <CardContent className="p-6">
              <DataTable 
                columns={columns} 
                data={robots} 
                searchPlaceholder="Search robots..." 
                searchKey="name" 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Robot Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Add New Robot</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new robot to the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateRobot)} className="space-y-5">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter robot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent  className="bg-white/80">
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="connectivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connectivity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connectivity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent  className="bg-white/80">
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Farm (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/80">
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Engineer (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/80">
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.first_name} {engineer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Robot"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Robot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Edit Robot</DialogTitle>
            <DialogDescription>
              Update robot information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateRobot)} className="space-y-5">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter robot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="connectivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connectivity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connectivity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Farm</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Engineer</FormLabel>
                    <Select
        onValueChange={field.onChange}
        value={field.value || undefined}  
      >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.first_name} {engineer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Robot"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Robot Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Delete Robot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this robot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRobot && (
            <div className="p-4 mb-4 border border-soil-200 rounded-md bg-soil-50">
              <div className="font-medium text-lg">{selectedRobot.name}</div>
              <div className="mt-3 pt-3 border-t border-soil-200 grid grid-cols-2 gap-2 text-sm">
                <div className="text-soil-600">Status:</div>
                <div className="capitalize">{selectedRobot.status.replace('-', ' ')}</div>
                <div className="text-soil-600">Connectivity:</div>
                <div className="capitalize">{selectedRobot.connectivity}</div>
                {selectedRobot.farmName && (
                  <>
                    <div className="text-soil-600">Farm:</div>
                    <div>{selectedRobot.farmName}</div>
                  </>
                )}
                {selectedRobot.engineerName && (
                  <>
                    <div className="text-soil-600">Engineer:</div>
                    <div>{selectedRobot.engineerName}</div>
                  </>
                )}
            
                
              </div>
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
              onClick={handleDeleteRobot}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Robot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Engineer Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Assign Engineer to Robots</DialogTitle>
            <DialogDescription>
              Select an engineer and the robots you want to assign to them.
            </DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(handleAssignEngineer)} className="space-y-5">
              <FormField
                control={assignForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Engineer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.first_name} {engineer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* This is the truncated section that caused the issue - fixing it now */}
              <FormField
                control={assignForm.control}
                name="robotIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Robots</FormLabel>
                    <FormDescription>
                      Choose which robots to assign to the selected engineer.
                    </FormDescription>
                    <div className="space-y-2 mt-2">
                      {robots.filter(r => !r.engineerId).map((robot) => (
                        <div key={robot.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`robot-${robot.id}`}
                            value={robot.id}
                            checked={selectedRobotIds.includes(robot.id)}
                            onChange={(e) => {
                              const id = robot.id;
                              if (e.target.checked) {
                                setSelectedRobotIds([...selectedRobotIds, id]);
                                field.onChange([...field.value || [], id]);
                              } else {
                                setSelectedRobotIds(selectedRobotIds.filter(r => r !== id));
                                field.onChange((field.value || []).filter(r => r !== id));
                              }
                            }}
                            className="h-4 w-4 rounded border-soil-300 text-primary focus:ring-soil-200"
                          />
                          <label htmlFor={`robot-${robot.id}`} className="text-sm">
                            {robot.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedRobotIds([]);
                  }}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || selectedRobotIds.length === 0}
                >
                  {loading ? "Assigning..." : "Assign Engineer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RobotManagement;

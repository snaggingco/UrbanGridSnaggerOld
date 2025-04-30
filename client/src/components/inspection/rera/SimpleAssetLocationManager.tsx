import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AssetLocation {
  id: number;
  name: string;
  projectId: number;
  type: string;
  [key: string]: any;
}

interface SimpleAssetLocationManagerProps {
  projectId: number;
}

export default function SimpleAssetLocationManager({ projectId }: SimpleAssetLocationManagerProps) {
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedLocationType, setSelectedLocationType] = useState("room");
  const [editingLocation, setEditingLocation] = useState<AssetLocation | null>(null);
  
  // Fetch all locations for this project
  const { 
    data: locations = [], 
    isLoading: isLocationsLoading,
    isError: isLocationsError 
  } = useQuery<AssetLocation[]>({
    queryKey: ["/api/rera/projects", projectId, "locations"],
    queryFn: async () => {
      console.log("Fetching RERA asset locations for project:", projectId);
      const response = await apiRequest(`/api/rera/projects/${projectId}/locations`);
      console.log("RERA asset locations response:", response);
      
      // Filter out any invalid data
      if (!Array.isArray(response)) {
        return [];
      }
      
      const filteredLocations = response.filter(item => {
        // Make sure the item is a valid location (not a project or other item)
        if (!item || typeof item !== 'object') return false;
        
        // Check that it has the right shape of a location
        if (!item.name || !item.type) return false;
        
        // Make sure it's for the right project
        if (item.projectId !== projectId) return false;
        
        // Valid location
        return true;
      });
      
      console.log("Filtered RERA asset locations:", filteredLocations);
      return filteredLocations;
    },
  });

  // Create asset location mutation
  const createAssetLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsCreating(true);
      return apiRequest(`/api/rera/projects/${projectId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "locations"] });
      setShowCreateDialog(false);
      setNewLocationName("");
      setIsCreating(false);
      toast({
        title: "Asset location created",
        description: "The asset location has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating asset location:", error);
      setIsCreating(false);
      toast({
        title: "Error",
        description: "Failed to create asset location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update asset location mutation
  const updateAssetLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/rera/projects/${projectId}/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "locations"] });
      setEditDialogOpen(false);
      toast({
        title: "Asset location updated",
        description: "The asset location has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating asset location:", error);
      toast({
        title: "Error",
        description: "Failed to update asset location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete asset location mutation
  const deleteAssetLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/rera/projects/${projectId}/locations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "locations"] });
      toast({
        title: "Asset location deleted",
        description: "The asset location has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting asset location:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle the create location form submission
  const handleCreateLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the asset location.",
        variant: "destructive",
      });
      return;
    }

    createAssetLocationMutation.mutate({
      name: newLocationName,
      parentId: null, // No parent-child relationship in the flat structure
      projectId,
      type: selectedLocationType
    });
  };

  // Handle opening the edit dialog for a location
  const handleEditLocation = (location: AssetLocation) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setSelectedLocationType(location.type || "room");
    setEditDialogOpen(true);
  };

  // Handle the edit location form submission
  const handleUpdateLocation = () => {
    if (!editingLocation) return;
    
    if (!newLocationName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the asset location.",
        variant: "destructive",
      });
      return;
    }

    updateAssetLocationMutation.mutate({
      id: editingLocation.id,
      data: {
        name: newLocationName,
        type: selectedLocationType
      }
    });
  };

  // Handle deleting a location
  const handleDeleteLocation = (locationId: number) => {
    if (confirm("Are you sure you want to delete this asset location? This cannot be undone.")) {
      deleteAssetLocationMutation.mutate(locationId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Asset Locations</h3>
          <p className="text-sm text-muted-foreground">
            Create locations where building assets are physically located
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Asset Locations</AlertTitle>
        <AlertDescription>
          Create specific locations where assets will be physically located in the building, such as:
          <ul className="list-disc ml-6 mt-2">
            <li>HVAC Room</li>
            <li>Lobby</li>
            <li>Corridors</li>
            <li>Electrical Room</li>
            <li>Pool Area</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            After adding locations here, go to the NRM3 Framework tab to select assets and assign them to these asset locations.
          </p>
        </AlertDescription>
      </Alert>

      {isLocationsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading asset locations...</span>
        </div>
      ) : isLocationsError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch asset locations. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Asset Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No asset locations added yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Add locations where building assets are physically placed
                </p>
                <Button 
                  onClick={() => {
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Location
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {location.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.type || 'room'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLocation(location.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Location Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Asset Location</DialogTitle>
            <DialogDescription>
              Create a new location where building assets are physically placed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                placeholder="e.g., Main Building, Tower A, Floor 3"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location-type">Location Type</Label>
              <Select
                value={selectedLocationType}
                onValueChange={setSelectedLocationType}
              >
                <SelectTrigger id="location-type">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floor">Floor</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="subSystem">Sub-System</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="element">Element</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Specify what kind of location this is
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLocation} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Location"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset Location</DialogTitle>
            <DialogDescription>
              Update the details of this asset location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location-name">Location Name</Label>
              <Input
                id="edit-location-name"
                placeholder="e.g., Main Building, Tower A, Floor 3"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location-type">Location Type</Label>
              <Select
                value={selectedLocationType}
                onValueChange={setSelectedLocationType}
              >
                <SelectTrigger id="edit-location-type">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floor">Floor</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="subSystem">Sub-System</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="element">Element</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Specify what kind of location this is
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation}>
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
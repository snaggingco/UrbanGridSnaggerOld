import { useState, useMemo } from "react";
import { Building, Home, Layers, MapPin, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Location as DBLocation, Project } from "@shared/schema";

export interface Location {
  id: string | number;
  projectId: number;
  name: string;
  type: string;
  parentId: string | number | null;
  snagCount?: number;
  children?: Location[];
  // createdAt is optional for UI components
  createdAt?: Date;
}

interface LocationTreeProps {
  locations: Location[];
  activeLocationId?: string | number | null;
  onSelectLocation: (locationId: string | number | null) => void;
  projectId: number;
}

export default function LocationTree({
  locations,
  activeLocationId,
  onSelectLocation,
  projectId
}: LocationTreeProps) {
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationType, setNewLocationType] = useState<string>("room");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get project details to show the location
  const { data: project } = useQuery<any>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (values: { name: string; type: string; parentId: number | null }) => {
      return apiRequest(`/api/projects/${projectId}/locations`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/locations`] });
      toast({
        title: "Room created",
        description: "Room has been added successfully",
      });
      setAddLocationOpen(false);
      setNewLocationName("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create room",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    createLocationMutation.mutate({
      name: newLocationName.trim(),
      type: newLocationType,
      parentId: null
    });
  };

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    
    const query = searchQuery.toLowerCase().trim();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  // Group locations by type for better organization
  const groupedLocations = useMemo(() => {
    const grouped: Record<string, Location[]> = {
      room: [],
      area: [],
      floor: [],
      other: []
    };
    
    filteredLocations.forEach(loc => {
      const type = loc.type || 'other';
      if (grouped[type]) {
        grouped[type].push(loc);
      } else {
        grouped.other.push(loc);
      }
    });
    
    // Sort rooms alphabetically
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, [filteredLocations]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Rooms & Areas</CardTitle>
          <Badge variant="outline" className="text-xs">
            {locations.length} Total
          </Badge>
        </div>
        {project?.location && (
          <CardDescription className="flex items-center text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Property located in {project.location}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Search and actions row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search rooms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Create a new room or area for inspection in this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Project information */}
                {project && (
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">Project Location:</span>
                      <span className="ml-1 truncate text-blue-700">{project.location}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      This room will be added to the inspection project at this location.
                    </p>
                  </div>
                )}
                
                {/* Room name input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Master Bedroom, Kitchen, Bathroom"
                    value={newLocationName}
                    onChange={e => setNewLocationName(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {/* Room type selection */}
                <div className="space-y-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Select 
                    defaultValue="room" 
                    value={newLocationType}
                    onValueChange={setNewLocationType}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="floor">Floor</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    This helps categorize different spaces in your inspection.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddLocationOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLocation}
                  disabled={!newLocationName.trim() || createLocationMutation.isPending}
                >
                  {createLocationMutation.isPending ? 'Creating...' : 'Save Room'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* All Rooms button */}
        <div 
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer border",
            activeLocationId === null 
              ? "bg-blue-50 text-blue-700 font-medium border-blue-200"
              : "hover:bg-gray-50 border-gray-100"
          )}
          onClick={() => onSelectLocation(null)}
        >
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium">All Rooms</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {locations.length}
          </Badge>
        </div>
        
        {/* Room list by type */}
        <div className="space-y-4">
          {/* Rooms */}
          {groupedLocations.room.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</h3>
              {groupedLocations.room.map(room => (
                <LocationItem 
                  key={room.id}
                  location={room} 
                  isActive={activeLocationId === room.id}
                  onClick={() => onSelectLocation(room.id)}
                />
              ))}
            </div>
          )}
          
          {/* Areas */}
          {groupedLocations.area.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Areas</h3>
              {groupedLocations.area.map(area => (
                <LocationItem 
                  key={area.id}
                  location={area} 
                  isActive={activeLocationId === area.id}
                  onClick={() => onSelectLocation(area.id)}
                />
              ))}
            </div>
          )}
          
          {/* Floors */}
          {groupedLocations.floor.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Floors</h3>
              {groupedLocations.floor.map(floor => (
                <LocationItem 
                  key={floor.id}
                  location={floor} 
                  isActive={activeLocationId === floor.id}
                  onClick={() => onSelectLocation(floor.id)}
                />
              ))}
            </div>
          )}
          
          {/* Other */}
          {groupedLocations.other.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Other</h3>
              {groupedLocations.other.map(other => (
                <LocationItem 
                  key={other.id}
                  location={other} 
                  isActive={activeLocationId === other.id}
                  onClick={() => onSelectLocation(other.id)}
                />
              ))}
            </div>
          )}
          
          {/* No results */}
          {filteredLocations.length === 0 && (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  <p className="text-gray-500 mb-2">No rooms match your search</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">No rooms added yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAddLocationOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Room
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Separate component for location items
function LocationItem({ 
  location, 
  isActive, 
  onClick 
}: { 
  location: Location;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer border",
        isActive 
          ? "bg-blue-50 text-blue-700 font-medium border-blue-200"
          : "hover:bg-gray-50 border-gray-100"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        {getLocationIcon(location.type)}
        <span className="ml-2 text-sm">{location.name}</span>
      </div>
      
      {location.snagCount !== undefined && (
        <Badge 
          variant={location.snagCount > 0 ? "secondary" : "outline"} 
          className={cn(
            "text-xs",
            location.snagCount > 0 ? "bg-blue-50" : "bg-gray-50"
          )}
        >
          {location.snagCount}
        </Badge>
      )}
    </div>
  );
}

function getLocationIcon(type: string) {
  switch (type) {
    case 'floor':
      return <Building className="h-4 w-4 text-gray-500" />;
    case 'room':
      return <Home className="h-4 w-4 text-gray-500" />;
    case 'area':
      return <Layers className="h-4 w-4 text-gray-500" />;
    default:
      return <Building className="h-4 w-4 text-gray-500" />;
  }
}
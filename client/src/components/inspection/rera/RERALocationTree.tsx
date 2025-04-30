import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Building, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2,
  FolderTree,
  AlertTriangle,
  BookOpen
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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Project {
  id: number;
  name: string;
  clientName: string;
  location: string;
  date: string;
  propertyType: string;
  propertySize: string;
  status: string;
  userId: number;
  projectType: string;
  reraAuditType?: string;
  [key: string]: any;
}

interface RERALocationTreeProps {
  projectId: number;
}

// Default type for API compatibility
const DEFAULT_LOCATION_TYPE = "area";

export default function RERALocationTree({ projectId }: RERALocationTreeProps) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedAssetLocation, setSelectedAssetLocation] = useState<any | null>(null);
  const [assetLocationName, setAssetLocationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  // Fetch project details
  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  // Fetch asset locations for this project
  const { data: assetLocations, isLoading: isAssetLocationsLoading, error: assetLocationsError } = useQuery({
    queryKey: ["/api/projects", projectId, "locations"],
  });

  // Create asset location mutation
  const createAssetLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/projects/${projectId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "locations"] });
      setAssetLocationName("");
      setCreateDialogOpen(false);
      setIsCreating(false);
      toast({
        title: "Asset location created",
        description: "The new asset location has been created successfully.",
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
      return apiRequest(`/api/projects/${projectId}/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "locations"] });
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
      return apiRequest(`/api/projects/${projectId}/locations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "locations"] });
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

  // Handle creating a new asset location
  const handleCreateAssetLocation = () => {
    if (!assetLocationName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an asset location name.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    // Create the asset location data
    const locationData = {
      name: assetLocationName,
      type: DEFAULT_LOCATION_TYPE, // Using the default type for backend compatibility
      parentId: selectedParentId,
      projectId: projectId
    };

    createAssetLocationMutation.mutate(locationData);
  };

  // Handle updating an asset location
  const handleUpdateAssetLocation = () => {
    if (!selectedAssetLocation) return;

    updateAssetLocationMutation.mutate({
      id: selectedAssetLocation.id,
      data: {
        name: assetLocationName,
        type: selectedAssetLocation.type || DEFAULT_LOCATION_TYPE,
      },
    });
  };

  // Handle deleting an asset location
  const handleDeleteAssetLocation = (id: number) => {
    if (confirm("Are you sure you want to delete this asset location? This will also delete any child locations and may affect associated assets.")) {
      deleteAssetLocationMutation.mutate(id);
    }
  };

  // Toggle node expansion
  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Define a type for the asset location tree node
  interface AssetLocationTreeNode {
    id: number;
    name: string;
    type: string;
    parentId: number | null;
    projectId: number;
    children: AssetLocationTreeNode[];
    [key: string]: any; // For other properties that might exist
  }

  // Build a tree structure from the flat asset locations array
  const buildAssetLocationTree = (items: any[], parentId: number | null = null): AssetLocationTreeNode[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildAssetLocationTree(items, item.id),
      }));
  };

  // Render an asset location tree node
  const renderAssetLocationNode = (node: AssetLocationTreeNode, level = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes[node.id] || false;

    return (
      <div key={node.id} className="asset-location-tree-node">
        <div 
          className={`
            flex items-center py-2 px-2 hover:bg-muted rounded-md cursor-pointer
            ${level > 0 ? 'ml-' + (level * 4) : ''}
          `}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6 mr-1"
            onClick={() => toggleNode(node.id)}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="w-4" />
            )}
          </Button>

          {/* Icon based on level for visual hierarchy */}
          {level === 0 ? (
            <Building className="h-4 w-4 mr-2 text-blue-500" />
          ) : level === 1 ? (
            <MapPin className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <FolderTree className="h-4 w-4 mr-2 text-amber-500" />
          )}
          
          <span className="flex-1 text-sm font-medium">
            {node.name}
          </span>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                setSelectedAssetLocation(node);
                setAssetLocationName(node.name);
                setEditDialogOpen(true);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteAssetLocation(node.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary"
              onClick={() => {
                setSelectedParentId(node.id);
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="asset-location-tree-children">
            {node.children.map((child: AssetLocationTreeNode) => renderAssetLocationNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Check if any asset locations exist
  const assetLocationTree = assetLocations && Array.isArray(assetLocations) ? buildAssetLocationTree(assetLocations) : [];
  const hasAssetLocations = assetLocations && Array.isArray(assetLocations) && assetLocations.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Asset Locations</h3>
          <p className="text-sm text-muted-foreground">
            Create locations to organize building assets for easier assessment
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedParentId(null);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset Location
        </Button>
      </div>

      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Building Asset Locations</AlertTitle>
        <AlertDescription>
          First, create the location structure where assets will be placed:
          <ul className="list-disc ml-6 mt-2">
            <li><strong>Main Locations</strong>: Major sections of the building (e.g., Common Areas, Exterior, Facilities)</li>
            <li><strong>Sub-Locations</strong>: Specific areas within main locations (e.g., Lobby, Roof, HVAC Room)</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            After locations are set up, go to the NRM3 Framework tab to select assets and assign them to these asset locations.
          </p>
        </AlertDescription>
      </Alert>

      {isAssetLocationsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading asset locations...</span>
        </div>
      ) : assetLocationsError ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load asset locations. Please refresh and try again.
          </AlertDescription>
        </Alert>
      ) : !hasAssetLocations ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FolderTree className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Asset Locations Added Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Start by adding asset locations to organize building elements for your assessment
            </p>
            <Button 
              onClick={() => {
                setSelectedParentId(null);
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-1 pr-3">
            {assetLocationTree.map(node => renderAssetLocationNode(node))}
          </div>
        </ScrollArea>
      )}

      {/* Create Asset Location Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Asset Location</DialogTitle>
            <DialogDescription>
              {selectedParentId ? "Add a sub-location to the selected area" : "Add a location for organizing assets"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Project information */}
            {project && (
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Project:</span>
                  <span className="ml-1 truncate text-blue-700">{project.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {selectedParentId ? "Adding a sub-location to the selected area." : "Adding a new asset location."}
                </p>
              </div>
            )}
            
            {/* Simple Asset Location Entry */}
            <div className="space-y-4 py-4">
              {/* Asset Location name input */}
              <div className="space-y-2">
                <Label htmlFor="name">Asset Location Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Building, Common Areas, HVAC Room, etc."
                  value={assetLocationName}
                  onChange={e => setAssetLocationName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descriptive name for where assets are physically located within the property.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md mt-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Note:</span>
                </div>
                <p className="text-xs text-gray-700 mt-1 ml-6">
                  When selecting assets in the NRM3 Framework tab, you'll assign them to these asset locations for easier assessment and reporting.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssetLocation} 
              disabled={isCreating || !assetLocationName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Asset Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Location Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset Location</DialogTitle>
            <DialogDescription>
              Update the name of this asset location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Asset Location name input */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Asset Location Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Main Building, Common Areas, HVAC Room, etc."
                value={assetLocationName}
                onChange={e => setAssetLocationName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAssetLocation}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
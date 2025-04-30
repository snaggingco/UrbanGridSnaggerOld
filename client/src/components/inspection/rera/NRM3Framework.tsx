import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAssetDefaultValues } from "@/components/inspection/rera/nrm3DefaultValues";
import { 
  Loader2, 
  AlertTriangle, 
  Info, 
  Search, 
  Filter, 
  FileText,
  Save,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface for component props
export interface NRM3FrameworkProps {
  projectId: number;
  yearOfConstruction?: number; // Optional year of construction from project details
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { loadNRM3ClassificationData, type NRM3Asset, type NRM3SubCategory, type NRM3Category } from "@/lib/nrm3-classification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for locations
interface Location {
  id: number;
  name: string;
  projectId: number;
  [key: string]: any;
}

// Interface for asset classifications
interface AssetClassification {
  id: number;
  locationId: number;
  nrmGroup: string;       // Level 1 code (e.g., "1")
  nrmSubGroup: string;    // Level 2 code (e.g., "1.1")
  nrmElement: string;     // Level 3 code (e.g., "1.1.1")
  description: string;    // Asset name
  quantity?: string;      // Optional quantity
  unit?: string;          // Optional unit of measurement
  installationYear?: number; // Year the asset was installed
  lastReplacementYear?: number; // Year the asset was last replaced
  effectiveAge?: number;  // Calculated based on installation/replacement
  projectId: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export default function NRM3Framework({ projectId, yearOfConstruction }: NRM3FrameworkProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nrm3-selection");
  
  // NRM3 selection state
  const [nrm3Categories, setNrm3Categories] = useState<NRM3Category[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<NRM3Asset | null>(null);
  const [loadingNrm3Data, setLoadingNrm3Data] = useState(true);
  
  // Classification form state
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [classificationQuantity, setClassificationQuantity] = useState<string>("1");
  const [installationYear, setInstallationYear] = useState<string>("");
  const [lastReplacementYear, setLastReplacementYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationDialogOpen, setClassificationDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClassification, setCurrentClassification] = useState<AssetClassification | null>(null);
  
  // Fetch locations for this project
  const { 
    data: locations = [], 
    isLoading: isLocationsLoading 
  } = useQuery<Location[]>({
    queryKey: ["/api/rera/projects", projectId, "locations"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/rera/projects/${projectId}/locations`);
        return response || [];
      } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
      }
    },
  });

  // Fetch asset classifications for this project
  const { 
    data: classifications = [], 
    isLoading: isClassificationsLoading, 
    refetch 
  } = useQuery<AssetClassification[]>({
    queryKey: ["/api/rera/projects", projectId, "classifications"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/rera/projects/${projectId}/classifications`);
        return response || [];
      } catch (error) {
        console.error("Error fetching classifications:", error);
        return [];
      }
    },
  });

  // Fetch NRM3 classification data
  useEffect(() => {
    const fetchNrm3Data = async () => {
      setLoadingNrm3Data(true);
      try {
        const data = await loadNRM3ClassificationData();
        setNrm3Categories(data);
      } catch (error) {
        console.error("Error fetching NRM3 data:", error);
        toast({
          title: "Error",
          description: "Failed to load NRM3 classification data.",
          variant: "destructive",
        });
      } finally {
        setLoadingNrm3Data(false);
      }
    };

    fetchNrm3Data();
  }, [toast]);
  


  // Create classification mutation
  const createClassificationMutation = useMutation({
    mutationFn: async (data: Omit<AssetClassification, 'id'>) => {
      try {
        return apiRequest(`/api/rera/projects/${projectId}/classifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Error creating classification:", error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setClassificationDialogOpen(false);
      toast({
        title: "Asset Added",
        description: "The asset has been classified successfully.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to add the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update classification mutation
  const updateClassificationMutation = useMutation({
    mutationFn: async (data: AssetClassification) => {
      try {
        return apiRequest(`/api/rera/projects/${projectId}/classifications/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId: data.locationId,
            quantity: data.quantity,
            installationYear: data.installationYear,
            lastReplacementYear: data.lastReplacementYear,
            effectiveAge: data.effectiveAge
          }),
        });
      } catch (error) {
        console.error("Error updating classification:", error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setClassificationDialogOpen(false);
      toast({
        title: "Asset Updated",
        description: "The asset classification has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to update the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete classification mutation
  const deleteClassificationMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return apiRequest(`/api/rera/projects/${projectId}/classifications/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting classification:", error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Asset Removed",
        description: "The asset has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to remove the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle asset selection
  const handleSelectAsset = (asset: NRM3Asset) => {
    if (!selectedLevel1 || !selectedLevel2) return;
    
    setSelectedAsset(asset);
    
    // Open the classification dialog
    setClassificationDialogOpen(true);
    setEditMode(false);
    setClassificationQuantity("1");
    
    // Default installation year to the construction year if available
    const currentYear = new Date().getFullYear();
    if (yearOfConstruction) {
      // Make sure we have a valid number for construction year
      const constructionYear = String(yearOfConstruction);
      setInstallationYear(constructionYear);
      setLastReplacementYear(constructionYear); // Default last replacement to same as installation
    } else {
      // Default to current year if no construction year is available
      setInstallationYear(String(currentYear));
      setLastReplacementYear(String(currentYear));
    }
  };

  // Handle classification dialog submission
  const handleSubmitClassification = () => {
    if (!selectedLocationId) {
      toast({
        title: "Missing Location",
        description: "Please select a location for this asset.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAsset || !selectedLevel1 || !selectedLevel2) {
      toast({
        title: "Missing Asset",
        description: "Please select an asset from the NRM3 framework.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(classificationQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity (must be a positive number).",
        variant: "destructive",
      });
      return;
    }

    // Parse years from string inputs
    const parsedInstallationYear = installationYear ? parseInt(installationYear, 10) : undefined;
    const parsedLastReplacementYear = lastReplacementYear ? parseInt(lastReplacementYear, 10) : undefined;
    
    // Calculate effective age (if installation year is provided)
    const currentYear = new Date().getFullYear();
    const effectiveAge = parsedInstallationYear 
      ? (parsedLastReplacementYear ? currentYear - parsedLastReplacementYear : currentYear - parsedInstallationYear) 
      : undefined;
    
    if (editMode && currentClassification) {
      // Update existing classification
      updateClassificationMutation.mutate({
        ...currentClassification,
        locationId: selectedLocationId,
        quantity: classificationQuantity,
        installationYear: parsedInstallationYear,
        lastReplacementYear: parsedLastReplacementYear,
        effectiveAge: effectiveAge,
      });
    } else {
      // Get default values for this asset
      const defaultValues = getAssetDefaultValues(
        selectedAsset!.code,
        selectedLevel1!
      );
      
      // Create new classification
      createClassificationMutation.mutate({
        locationId: selectedLocationId,
        nrmGroup: selectedLevel1!,
        nrmSubGroup: selectedLevel2!, // matches the DB schema
        nrmElement: selectedAsset!.code, // matches the DB schema
        description: selectedAsset!.name,
        quantity: classificationQuantity,
        unit: defaultValues.unit, // Use unit from default values
        installationYear: parsedInstallationYear,
        lastReplacementYear: parsedLastReplacementYear,
        effectiveAge: effectiveAge,
        projectId: projectId,
      });
    }
  };

  // Handle editing a classification
  const handleEditClassification = (classification: AssetClassification) => {
    setCurrentClassification(classification);
    setSelectedLocationId(classification.locationId);
    setClassificationQuantity(classification.quantity?.toString() || "1");
    setInstallationYear(classification.installationYear?.toString() || "");
    setLastReplacementYear(classification.lastReplacementYear?.toString() || "");
    setEditMode(true);
    setClassificationDialogOpen(true);
  };

  // Handle deleting a classification
  const handleDeleteClassification = (id: number) => {
    if (confirm("Are you sure you want to remove this asset? This cannot be undone.")) {
      deleteClassificationMutation.mutate(id);
    }
  };

  // Filter classifications based on search query
  const filteredClassifications = classifications.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    return (
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nrmGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nrmSubGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nrmElement.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Helper functions for displaying location and asset info
  const getLocationName = (locationId: number) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : "Unknown";
  };

  const getLevel1Name = (code: string) => {
    const category = nrm3Categories.find(cat => cat.code === code);
    return category ? `${category.code} - ${category.name}` : code;
  };

  const getLevel2Name = (level1Code: string, level2Code: string) => {
    const category = nrm3Categories.find(cat => cat.code === level1Code);
    if (!category) return level2Code;
    
    const subCategory = category.subCategories.find(sub => sub.code === level2Code);
    return subCategory ? `${subCategory.code} - ${subCategory.name}` : level2Code;
  };
  
  // Update existing asset classifications with construction year if they're missing installation/replacement years
  useEffect(() => {
    // Skip if no construction year provided or if classifications aren't loaded yet
    if (!yearOfConstruction || isClassificationsLoading || classifications.length === 0) {
      return;
    }
    
    // Find classifications that are missing installation or replacement years
    const classificationsNeedingUpdate = classifications.filter(
      (cls) => (!cls.installationYear || !cls.lastReplacementYear)
    );
    
    if (classificationsNeedingUpdate.length > 0) {
      // Update each classification that needs it
      classificationsNeedingUpdate.forEach(classification => {
        const currentYear = new Date().getFullYear();
        const installYear = classification.installationYear || yearOfConstruction;
        const replacementYear = classification.lastReplacementYear || installYear;
        const effectiveAge = currentYear - replacementYear;
        
        updateClassificationMutation.mutate({
          ...classification,
          installationYear: installYear,
          lastReplacementYear: replacementYear,
          effectiveAge: effectiveAge
        });
      });
      
      // Show a toast notification about the update
      toast({
        title: "Assets Updated",
        description: `${classificationsNeedingUpdate.length} assets were updated with installation and replacement years.`,
      });
    }
  }, [classifications, yearOfConstruction, isClassificationsLoading, updateClassificationMutation, toast]);

  // Render the NRM3 Framework component
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">NRM3 Classification Framework</h3>
          <p className="text-sm text-muted-foreground">
            Select and classify assets according to the NRM3 standard
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="nrm3-selection">
            <FolderTree className="h-4 w-4 mr-2" />
            Select NRM3 Assets
          </TabsTrigger>
          <TabsTrigger value="asset-classifications">
            <FileText className="h-4 w-4 mr-2" />
            Asset Classifications
          </TabsTrigger>
        </TabsList>

        {/* NRM3 Selection Tab */}
        <TabsContent value="nrm3-selection">
          {loadingNrm3Data ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading NRM3 classification data...</span>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
              {/* Level 1 Selection */}
              <Card className="md:col-span-3">
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Level 1 Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-0.5 p-2">
                      {nrm3Categories.map((category) => (
                        <Button
                          key={category.code}
                          variant={selectedLevel1 === category.code ? "default" : "ghost"}
                          className="w-full justify-start text-left font-normal"
                          onClick={() => {
                            setSelectedLevel1(selectedLevel1 === category.code ? null : category.code);
                            setSelectedLevel2(null);
                            setSelectedAsset(null);
                          }}
                        >
                          <span className="font-mono mr-2">{category.code}</span>
                          <span className="truncate">{category.name}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Level 2 Selection */}
              <Card className={`md:col-span-3 ${!selectedLevel1 ? 'opacity-50' : ''}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Level 2 Sub-Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {selectedLevel1 ? (
                      <div className="space-y-0.5 p-2">
                        {nrm3Categories
                          .find(cat => cat.code === selectedLevel1)
                          ?.subCategories.map((subCategory) => (
                            <Button
                              key={subCategory.code}
                              variant={selectedLevel2 === subCategory.code ? "default" : "ghost"}
                              className="w-full justify-start text-left font-normal"
                              onClick={() => {
                                setSelectedLevel2(selectedLevel2 === subCategory.code ? null : subCategory.code);
                                setSelectedAsset(null);
                              }}
                            >
                              <span className="font-mono mr-2">{subCategory.code}</span>
                              <span className="truncate">{subCategory.name}</span>
                            </Button>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Please select a Level 1 category first
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Level 3 Assets */}
              <Card className={`md:col-span-6 ${!selectedLevel2 ? 'opacity-50' : ''}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Level 3 Assets</CardTitle>
                  <CardDescription>
                    Select an asset to add to your classifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {selectedLevel1 && selectedLevel2 ? (
                      <div className="space-y-1 p-2">
                        {nrm3Categories
                          .find(cat => cat.code === selectedLevel1)
                          ?.subCategories
                          .find(sub => sub.code === selectedLevel2)
                          ?.assets.map((asset) => (
                            <div 
                              key={asset.code} 
                              className="flex items-center justify-between py-2 px-4 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => handleSelectAsset(asset)}
                            >
                              <div>
                                <div className="font-medium"><span className="font-mono mr-2">{asset.code}</span> {asset.name}</div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Please select both Level 1 and Level 2 categories
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Asset Classifications Tab */}
        <TabsContent value="asset-classifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Asset Classifications</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <CardDescription>
                Assets selected from the NRM3 framework and their location assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isClassificationsLoading || isLocationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading classifications...</span>
                </div>
              ) : classifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No assets classified yet</div>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Go to the "Select NRM3 Assets" tab to add assets from the NRM3 framework
                  </p>
                  <Button onClick={() => setActiveTab("nrm3-selection")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Select Assets
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Installed</TableHead>
                        <TableHead>Last Replaced</TableHead>
                        <TableHead>Effective Age</TableHead>
                        <TableHead>Lifespan</TableHead>
                        <TableHead>Cost/Unit</TableHead>
                        <TableHead>NRM3 Code</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClassifications.map((classification) => {
                        // Get default values for this asset
                        const defaultValues = getAssetDefaultValues(
                          classification.nrmElement || classification.nrmSubGroup || '',
                          classification.nrmGroup
                        );
                        
                        return (
                          <TableRow key={classification.id}>
                            <TableCell className="font-medium">{classification.description}</TableCell>
                            <TableCell>{getLocationName(classification.locationId)}</TableCell>
                            <TableCell>{classification.quantity || 1}</TableCell>
                            <TableCell>{classification.unit || defaultValues.unit || 'each'}</TableCell>
                            <TableCell>{classification.installationYear || '-'}</TableCell>
                            <TableCell>{classification.lastReplacementYear || '-'}</TableCell>
                            <TableCell>
                              {classification.effectiveAge !== undefined ? `${classification.effectiveAge} years` : '-'}
                            </TableCell>
                            <TableCell>{defaultValues.lifespan} years</TableCell>
                            <TableCell>
                              {defaultValues.replacementCostPerUnit !== null
                                ? `AED ${defaultValues.replacementCostPerUnit.toLocaleString()}`
                                : 'AED 1,000'}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>{getLevel1Name(classification.nrmGroup)}</div>
                                <div>{getLevel2Name(classification.nrmGroup, classification.nrmSubGroup)}</div>
                                <div className="font-mono">{classification.nrmElement}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditClassification(classification)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => handleDeleteClassification(classification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Classification Dialog */}
      <Dialog open={classificationDialogOpen} onOpenChange={setClassificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Asset Classification" : "Add Asset to Project"}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update the location and quantity for this asset" 
                : "Assign this asset to a location in your project"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Selected Asset Info (only shown when adding new, not when editing) */}
            {!editMode && selectedAsset && selectedLevel1 && (
              <div className="rounded-md bg-muted p-3">
                <div className="font-medium">Selected Asset:</div>
                <div className="mt-1 text-sm">
                  <div className="font-medium">{selectedAsset.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{selectedAsset.code}</span>
                    <span className="ml-2">
                      Category: {getLevel1Name(selectedLevel1)}
                    </span>
                    {selectedLevel2 && (
                      <span className="ml-2">
                        Sub-Category: {getLevel2Name(selectedLevel1, selectedLevel2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Asset Default Values */}
                  <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    {(() => {
                      const defaultValues = getAssetDefaultValues(
                        selectedAsset.code,
                        selectedLevel1
                      );
                      
                      return (
                        <>
                          <div>
                            <span className="font-medium text-xs">Lifespan:</span>{' '}
                            <span>{defaultValues.lifespan} years</span>
                          </div>
                          <div>
                            <span className="font-medium text-xs">Unit:</span>{' '}
                            <span>{defaultValues.unit || 'each'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-xs">Cost/Unit:</span>{' '}
                            <span>
                              {defaultValues.replacementCostPerUnit !== null
                                ? `AED ${defaultValues.replacementCostPerUnit.toLocaleString()}`
                                : 'AED 1,000'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-xs">Maint.:</span>{' '}
                            <span>{defaultValues.maintenancePercentage}%</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Current asset being edited */}
            {editMode && currentClassification && (
              <div className="rounded-md bg-muted p-3">
                <div className="font-medium">Editing Asset:</div>
                <div className="mt-1 text-sm">
                  <div className="font-medium">{currentClassification.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{currentClassification.nrmElement}</span>
                    <span className="ml-2">
                      Category: {getLevel1Name(currentClassification.nrmGroup)}
                    </span>
                    <span className="ml-2">
                      Sub-Category: {getLevel2Name(currentClassification.nrmGroup, currentClassification.nrmSubGroup)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location">Asset Location</Label>
              <Select
                value={selectedLocationId?.toString() || ""}
                onValueChange={(value) => setSelectedLocationId(value !== "" ? parseInt(value, 10) : null)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.length === 0 ? (
                    <div className="py-2 px-4 text-sm text-muted-foreground">
                      No locations available. Please add locations first.
                    </div>
                  ) : (
                    locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {locations.length === 0 && (
                <p className="text-xs text-destructive">
                  You need to create asset locations before you can classify assets.
                </p>
              )}
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              {!editMode && selectedAsset && selectedLevel1 ? (
                (() => {
                  const defaultValues = getAssetDefaultValues(
                    selectedAsset.code,
                    selectedLevel1
                  );
                  const unit = defaultValues.unit || 'each';
                  
                  return (
                    <>
                      <Label htmlFor="quantity">Quantity ({unit})</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          placeholder="Enter quantity"
                          value={classificationQuantity}
                          onChange={(e) => setClassificationQuantity(e.target.value)}
                        />
                        <div className="text-sm text-muted-foreground border border-border rounded px-2 py-1 min-w-[50px] text-center">
                          {unit}
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                <>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={classificationQuantity}
                    onChange={(e) => setClassificationQuantity(e.target.value)}
                  />
                </>
              )}
            </div>
            
            {/* Installation Year */}
            <div className="space-y-2">
              <Label htmlFor="installationYear">Installation Year</Label>
              <Input
                id="installationYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Year of installation (e.g., 2015)"
                value={installationYear}
                onChange={(e) => setInstallationYear(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the year this asset was originally installed
              </p>
            </div>
            
            {/* Last Replacement Year */}
            <div className="space-y-2">
              <Label htmlFor="lastReplacementYear">Last Replacement Year</Label>
              <Input
                id="lastReplacementYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Year of last replacement (if applicable)"
                value={lastReplacementYear}
                onChange={(e) => setLastReplacementYear(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the year this asset was most recently replaced (if applicable)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setClassificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitClassification}>
              {editMode ? "Update" : "Add to Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
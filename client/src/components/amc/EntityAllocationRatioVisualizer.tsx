import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Circle, 
  CircleOff, 
  Layers, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronsLeft, 
  ChevronsRight,
  Info,
  Percent,
  BarChart4,
  LayoutGrid,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  Scale,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface Entity {
  id: number;
  name: string;
  type: string;
  suitArea: string;
  balconyArea?: string;
  sellableArea?: string;
  applicableArea?: string;
  dedicatedCommonArea?: string;
  parkingBays?: string;
  totalComponentArea?: string;
  headcount?: string | number;
  operationalHours?: string | number;
  color?: string;
}

interface SharedArea {
  id: number;
  name: string;
  type: "principal_common" | "common_element";
  area: string;
  description?: string;
}

interface EntityAllocationRatio {
  id: number;
  name: string;
  projectId: number;
  description?: string;
  uomType: string;
  isCore?: boolean;
  formula?: string;
  unitOfMeasurement: string;
}

interface EntityRatioValue {
  id: number;
  ratioId: number;
  entityId: number;
  value: string;
  isManualOverride?: boolean;
}

interface SharedAreaInclusion {
  id: number;
  ratioId: number;
  entityId: number;
  sharedAreaId: number;
  inclusionFactor: string;
  notes?: string;
}

interface EntityAllocationRatioVisualizerProps {
  projectId: number;
  entities: Entity[];
  sharedAreas: SharedArea[];
  onUnitChange?: (fromUnit: string, toUnit: string) => void;
  readOnly?: boolean;
}

// Utility to generate a color based on entity type
const getColorForEntityType = (type: string): string => {
  const colors: Record<string, string> = {
    residential: "#4361ee",
    retail: "#f72585",
    office: "#3a0ca3",
    hotel: "#4cc9f0",
    other: "#7209b7",
  };
  return colors[type] || "#6c757d";
};

const EntityAllocationRatioVisualizer: React.FC<EntityAllocationRatioVisualizerProps> = ({
  projectId,
  entities,
  sharedAreas,
  onUnitChange,
  readOnly = false,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeTab, setActiveTab] = useState("entities");
  const [activeRatioId, setActiveRatioId] = useState<number | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [selectedSharedArea, setSelectedSharedArea] = useState<number | null>(null);
  const [newRatioName, setNewRatioName] = useState("");
  const [newRatioType, setNewRatioType] = useState("area_based");
  const [newRatioUnit, setNewRatioUnit] = useState("sq.m");
  const [newRatioIsCore, setNewRatioIsCore] = useState(false);
  const [showCreateRatioDialog, setShowCreateRatioDialog] = useState(false);
  const [editingRatioValueId, setEditingRatioValueId] = useState<number | null>(null);
  const [editingRatioValue, setEditingRatioValue] = useState("");
  const [showAreaInclusionDialog, setShowAreaInclusionDialog] = useState(false);
  
  // API query for ratios
  const { data: allocationRatios = [], isLoading: isLoadingRatios } = useQuery({
    queryKey: ['/api/allocation/ratios/project', projectId],
    queryFn: () => apiRequest(`/api/allocation/ratios/project/${projectId}`),
    enabled: !!projectId
  });
  
  // API query for values of active ratio
  const { data: ratioValues = [], isLoading: isLoadingValues } = useQuery({
    queryKey: ['/api/allocation/values/ratio', activeRatioId],
    queryFn: () => apiRequest(`/api/allocation/values/ratio/${activeRatioId}`),
    enabled: !!activeRatioId
  });
  
  // API query for shared area inclusions of active ratio
  const { data: sharedAreaInclusions = [], isLoading: isLoadingInclusions } = useQuery({
    queryKey: ['/api/allocation/inclusions/ratio', activeRatioId],
    queryFn: () => apiRequest(`/api/allocation/inclusions/ratio/${activeRatioId}`),
    enabled: !!activeRatioId
  });
  
  // Initialize active ratio if none selected
  useEffect(() => {
    if (allocationRatios.length > 0 && activeRatioId === null) {
      setActiveRatioId(allocationRatios[0].id);
    }
  }, [allocationRatios, activeRatioId]);
  
  // Mutations for CRUD operations
  const createRatioMutation = useMutation({
    mutationFn: (newRatio: any) => apiRequest('/api/allocation/ratios', {
      method: 'POST',
      body: newRatio
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allocation/ratios/project', projectId] });
      toast({
        title: "Ratio Created",
        description: "New allocation ratio has been created successfully",
      });
      setNewRatioName("");
      setShowCreateRatioDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create",
        description: error.message || "Failed to create new ratio",
        variant: "destructive"
      });
    }
  });
  
  const updateRatioValueMutation = useMutation({
    mutationFn: ({ id, value, silent = false }: { id: number, value: string, silent?: boolean }) => 
      apiRequest(`/api/allocation/values/${id}`, {
        method: 'PUT',
        body: { value }
      }).then(result => ({ result, silent })),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/allocation/values/ratio', activeRatioId] });
      setEditingRatioValueId(null);
      
      // Only show toast for manual updates, not automatic ones
      const isSilent = data?.silent === true;
      if (!isSilent) {
        toast({
          title: "Value Updated",
          description: "Ratio value has been updated successfully",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to update ratio value",
        variant: "destructive"
      });
    }
  });
  
  const createSharedAreaInclusionMutation = useMutation({
    mutationFn: (inclusion: any) => apiRequest('/api/allocation/inclusions', {
      method: 'POST',
      body: inclusion
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allocation/inclusions/ratio', activeRatioId] });
      toast({
        title: "Area Included",
        description: "Shared area has been included in the ratio calculation",
      });
      setShowAreaInclusionDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Include",
        description: error.message || "Failed to include shared area",
        variant: "destructive"
      });
    }
  });
  
  const deleteSharedAreaInclusionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/allocation/inclusions/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allocation/inclusions/ratio', activeRatioId] });
      toast({
        title: "Area Removed",
        description: "Shared area has been removed from the ratio calculation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Remove",
        description: error.message || "Failed to remove shared area",
        variant: "destructive"
      });
    }
  });
  
  const calculateRatioMutation = useMutation({
    mutationFn: (ratioId: number) => apiRequest(`/api/allocation/calculate-ratio/${ratioId}`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allocation/values/ratio', activeRatioId] });
      toast({
        title: "Ratio Calculated",
        description: "Allocation ratios have been recalculated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate ratios",
        variant: "destructive"
      });
    }
  });
  
  const convertUnitsMutation = useMutation({
    mutationFn: (params: { fromUnit: string, toUnit: string }) => apiRequest(`/api/allocation/convert-units/${projectId}`, {
      method: 'POST',
      body: params
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries();
      toast({
        title: "Units Converted",
        description: `Measurements converted from ${variables.fromUnit} to ${variables.toUnit}`,
      });
      
      if (onUnitChange) {
        onUnitChange(variables.fromUnit, variables.toUnit);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert units",
        variant: "destructive"
      });
    }
  });
  
  // Handle creating a new ratio
  const handleCreateRatio = () => {
    if (!newRatioName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the new ratio",
        variant: "destructive"
      });
      return;
    }
    
    createRatioMutation.mutate({
      projectId,
      name: newRatioName,
      uomType: newRatioType,
      unitOfMeasurement: newRatioUnit,
      isCore: newRatioIsCore,
      description: `${newRatioName} - ${newRatioType.replace('_', ' ')}`
    });
  };
  
  // Update a ratio value
  const handleUpdateRatioValue = (id: number, value: string) => {
    updateRatioValueMutation.mutate({ id, value });
  };
  
  // Include shared area in ratio
  const handleIncludeSharedArea = (sharedAreaId: number) => {
    if (!activeRatioId || !selectedEntity) {
      toast({
        title: "Selection Required",
        description: "Please select an entity and ensure a ratio is active",
        variant: "destructive"
      });
      return;
    }
    
    createSharedAreaInclusionMutation.mutate({
      ratioId: activeRatioId,
      entityId: selectedEntity,
      sharedAreaId,
      inclusionFactor: "1.0" // Default to 100% inclusion
    });
  };
  
  // Start unit conversion
  const handleUnitConversion = (fromUnit: string, toUnit: string) => {
    convertUnitsMutation.mutate({ fromUnit, toUnit });
  };
  
  
  // Get current active ratio
  const activeRatio = allocationRatios.find(ratio => ratio.id === activeRatioId) || null;
  
  // Calculate total for active ratio
  const totalRatioValue = ratioValues.reduce(
    (sum, value) => sum + parseFloat(value.value), 
    0
  );
  
  // Find entity names for values
  const ratioValuesWithNames = ratioValues.map(value => {
    const entity = entities.find(e => e.id === value.entityId);
    return {
      ...value,
      entityName: entity?.name || 'Unknown Entity',
      entityType: entity?.type || 'other',
      entityColor: entity?.color || getColorForEntityType(entity?.type || 'other')
    };
  });
  
  // Find included areas for each entity
  const entityIncludedAreas = entities.map(entity => {
    const includedAreas = sharedAreaInclusions
      .filter(inclusion => inclusion.entityId === entity.id)
      .map(inclusion => {
        const area = sharedAreas.find(a => a.id === inclusion.sharedAreaId);
        return {
          ...inclusion,
          areaName: area?.name || 'Unknown Area',
          areaSize: area?.area || '0'
        };
      });
      
    return {
      entityId: entity.id,
      entityName: entity.name,
      includedAreas
    };
  });
  
  // Function to render the pie chart visualization
  const renderPieChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || ratioValuesWithNames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Sort values by percentage descending for a better visual
    const sortedValues = [...ratioValuesWithNames]
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    // Draw pie chart
    let startAngle = 0;
    sortedValues.forEach((value, index) => {
      const percentage = parseFloat(value.value);
      const sliceAngle = (percentage / 100) * 2 * Math.PI;
      
      // Draw pie slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      // Fill with entity color
      ctx.fillStyle = value.entityColor + (value.entityId === hoveredEntity ? 'FF' : '80'); // Adjust opacity
      ctx.fill();
      
      // Draw slice border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Calculate position for label
      const labelAngle = startAngle + (sliceAngle / 2);
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      // Only show label if slice is big enough
      if (percentage > 5) {
        // Draw entity name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.entityName, labelX, labelY);
        
        // Draw percentage below
        ctx.font = '10px Arial';
        ctx.fillText(`${percentage.toFixed(2)}%`, labelX, labelY + 15);
      }
      
      startAngle += sliceAngle;
    });
    
    // Draw center circle with ratio name
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#f8f9fa';
    ctx.fill();
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add ratio name in center
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activeRatio?.name || 'Ratio', centerX, centerY);
    
    // Add UOM type below
    ctx.font = '12px Arial';
    ctx.fillText(
      activeRatio?.uomType.replace('_', ' ') || '',
      centerX, 
      centerY + 20
    );
  };
  
  // Render the chart whenever relevant state changes
  useEffect(() => {
    renderPieChart();
  }, [ratioValuesWithNames, hoveredEntity, activeRatioId]);
  
  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          renderPieChart();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  
  // Handle canvas hover for pie chart segments
  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || ratioValuesWithNames.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate distance from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const radius = Math.min(centerX, centerY) - 20;
    
    // Only check if inside pie area
    if (distance <= radius && distance >= radius * 0.3) {
      // Calculate angle
      let angle = Math.atan2(y - centerY, x - centerX);
      if (angle < 0) angle += 2 * Math.PI; // Convert to 0-2π range
      
      // Find which slice contains this angle
      let startAngle = 0;
      for (const value of ratioValuesWithNames) {
        const percentage = parseFloat(value.value);
        const sliceAngle = (percentage / 100) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        
        if (angle >= startAngle && angle <= endAngle) {
          setHoveredEntity(value.entityId);
          return;
        }
        
        startAngle = endAngle;
      }
    } else {
      setHoveredEntity(null);
    }
  };
  
  // Handle unit conversion
  const handleUnitToggle = () => {
    if (!activeRatio) return;
    
    const currentUnit = activeRatio.unitOfMeasurement;
    const newUnit = currentUnit === 'sq.m' ? 'sq.ft' : 'sq.m';
    
    handleUnitConversion(currentUnit, newUnit);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Entity Allocation Ratios</CardTitle>
            <CardDescription>
              Visualize and manage cost allocation ratios between entities
            </CardDescription>
          </div>
          {!readOnly && (
            <Button 
              variant="outline" 
              onClick={() => setShowCreateRatioDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Ratio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="visualization">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Visualization
                </TabsTrigger>
                <TabsTrigger value="data">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Data Table
                </TabsTrigger>
                <TabsTrigger value="inclusions">
                  <Layers className="h-4 w-4 mr-2" />
                  Area Inclusions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualization" className="mt-0">
                <div className="h-[400px] relative">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full border rounded-md cursor-pointer" 
                    onMouseMove={handleCanvasHover}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-0">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Percent className="h-5 w-5 mr-2" />
                    Allocation Percentages
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Entity</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Allocation %</TableHead>
                          {!readOnly && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ratioValuesWithNames.map((value) => (
                          <TableRow key={value.id}>
                            <TableCell className="font-medium">{value.entityName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: value.entityColor }} 
                                />
                                {value.entityType.charAt(0).toUpperCase() + value.entityType.slice(1)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {editingRatioValueId === value.id ? (
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="number" 
                                    value={editingRatioValue}
                                    onChange={(e) => setEditingRatioValue(e.target.value)}
                                    className="w-24"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      handleUpdateRatioValue(value.id, editingRatioValue);
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setEditingRatioValueId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {parseFloat(value.value).toFixed(4)}%
                                  <Progress 
                                    value={parseFloat(value.value)} 
                                    className="w-24" 
                                  />
                                </div>
                              )}
                            </TableCell>
                            {!readOnly && (
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingRatioValueId(value.id);
                                    setEditingRatioValue(value.value);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="font-bold text-right">
                            Total:
                          </TableCell>
                          <TableCell className="font-bold">
                            {totalRatioValue.toFixed(4)}%
                          </TableCell>
                          {!readOnly && <TableCell />}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="inclusions" className="mt-0">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Layers className="h-5 w-5 mr-2" />
                    Shared Area Inclusions
                  </h3>
                  
                  {!readOnly && (
                    <div className="mb-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAreaInclusionDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Include Shared Area
                      </Button>
                    </div>
                  )}
                  
                  {entityIncludedAreas.filter(item => item.includedAreas.length > 0).length > 0 ? (
                    <div className="space-y-4">
                      {entityIncludedAreas
                        .filter(item => item.includedAreas.length > 0)
                        .map(entity => (
                        <div key={entity.entityId} className="border rounded-md p-3">
                          <h4 className="font-medium mb-2">{entity.entityName}</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Shared Area</TableHead>
                                <TableHead>Area (m²)</TableHead>
                                <TableHead>Inclusion Factor</TableHead>
                                {!readOnly && <TableHead>Actions</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entity.includedAreas.map(area => (
                                <TableRow key={area.id}>
                                  <TableCell>{area.areaName}</TableCell>
                                  <TableCell>{area.areaSize}</TableCell>
                                  <TableCell>{parseFloat(area.inclusionFactor) * 100}%</TableCell>
                                  {!readOnly && (
                                    <TableCell>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => deleteSharedAreaInclusionMutation.mutate(area.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No shared areas included in the current ratio.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={30}>
            <div className="p-4 h-full">
              <h3 className="text-lg font-medium mb-4">Allocation Ratios</h3>
              
              <div className="space-y-2 mb-4">
                {allocationRatios.map(ratio => (
                  <Button
                    key={ratio.id}
                    variant={ratio.id === activeRatioId ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveRatioId(ratio.id)}
                  >
                    <div className="flex items-center">
                      {ratio.isCore ? (
                        <Scale className="h-4 w-4 mr-2" />
                      ) : (
                        <Percent className="h-4 w-4 mr-2" />
                      )}
                      <div className="text-left">
                        <div>{ratio.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ratio.uomType.replace('_', ' ')} • {ratio.unitOfMeasurement}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
                
                {isLoadingRatios && (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading ratios...
                  </div>
                )}
                
                {!isLoadingRatios && allocationRatios.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No allocation ratios defined.
                  </div>
                )}
              </div>
              
              {activeRatio && (
                <div className="space-y-4">
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Ratio Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Name:</span> {activeRatio.name}</div>
                      <div><span className="font-medium">Type:</span> {activeRatio.uomType.replace('_', ' ')}</div>
                      <div><span className="font-medium">Unit:</span> {activeRatio.unitOfMeasurement}</div>
                      <div><span className="font-medium">Core:</span> {activeRatio.isCore ? 'Yes' : 'No'}</div>
                      {activeRatio.description && (
                        <div><span className="font-medium">Description:</span> {activeRatio.description}</div>
                      )}
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => calculateRatioMutation.mutate(activeRatio.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recalculate
                      </Button>
                      
                      {activeRatio.uomType === 'area_based' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={handleUnitToggle}
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          {activeRatio.unitOfMeasurement === 'sq.m' ? 'To sq.ft' : 'To sq.m'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
      
      {/* Create Ratio Dialog */}
      <AlertDialog open={showCreateRatioDialog} onOpenChange={setShowCreateRatioDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Allocation Ratio</AlertDialogTitle>
            <AlertDialogDescription>
              Define a new allocation ratio for distributing costs among entities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ratio-name">Ratio Name</Label>
              <Input
                id="ratio-name"
                placeholder="e.g., Utility Consumption Ratio"
                value={newRatioName}
                onChange={(e) => setNewRatioName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ratio-type">Ratio Type</Label>
              <Select value={newRatioType} onValueChange={setNewRatioType}>
                <SelectTrigger id="ratio-type">
                  <SelectValue placeholder="Select ratio type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area_based">Area Based</SelectItem>
                  <SelectItem value="headcount_based">Headcount Based</SelectItem>
                  <SelectItem value="consumption_based">Consumption Based</SelectItem>
                  <SelectItem value="parking_based">Parking Based</SelectItem>
                  <SelectItem value="time_based">Operational Hours Based</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Custom Formula)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newRatioType === 'area_based' && (
              <div className="space-y-2">
                <Label htmlFor="ratio-unit">Unit of Measurement</Label>
                <Select value={newRatioUnit} onValueChange={setNewRatioUnit}>
                  <SelectTrigger id="ratio-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sq.m">Square Meters (sq.m)</SelectItem>
                    <SelectItem value="sq.ft">Square Feet (sq.ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-core"
                checked={newRatioIsCore}
                onCheckedChange={setNewRatioIsCore}
              />
              <Label htmlFor="is-core">Core Ratio (Used for multiple allocations)</Label>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateRatio}>Create Ratio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Area Inclusion Dialog */}
      <AlertDialog open={showAreaInclusionDialog} onOpenChange={setShowAreaInclusionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Include Shared Area</AlertDialogTitle>
            <AlertDialogDescription>
              Include a shared area in the allocation ratio calculation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entity-selection">Select Entity</Label>
              <Select 
                value={selectedEntity?.toString() || ''} 
                onValueChange={(value) => setSelectedEntity(parseInt(value))}
              >
                <SelectTrigger id="entity-selection">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shared-area-selection">Select Shared Area</Label>
              <Select 
                value={selectedSharedArea?.toString() || ''} 
                onValueChange={(value) => setSelectedSharedArea(parseInt(value))}
              >
                <SelectTrigger id="shared-area-selection">
                  <SelectValue placeholder="Select shared area" />
                </SelectTrigger>
                <SelectContent>
                  {sharedAreas.map(area => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name} ({area.area} {activeRatio?.unitOfMeasurement})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedSharedArea) {
                  handleIncludeSharedArea(selectedSharedArea);
                }
              }}
            >
              Include Area
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EntityAllocationRatioVisualizer;
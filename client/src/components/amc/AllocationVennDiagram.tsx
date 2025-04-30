import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useToast } from "@/hooks/use-toast";
import { 
  Circle, 
  CircleOff, 
  Layers, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronsLeft, 
  ChevronsRight,
  Info
} from "lucide-react";

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
  parkingBayArea?: string;
  totalComponentArea?: string;
  proportionalShare?: string;
  color?: string;
}

interface SharedArea {
  id: number;
  name: string;
  type: "principal_common" | "common_element";
  area: string;
  description?: string;
  beneficiaries?: EntityBeneficiary[];
}

interface EntityBeneficiary {
  id: number;
  entityId: number;
  sharedAreaId: number;
  allocationPercentage: string;
}

interface AllocationVennDiagramProps {
  entities: Entity[];
  sharedAreas: SharedArea[];
  onEntityUpdate?: (id: number, data: Partial<Entity>) => void;
  onSharedAreaUpdate?: (id: number, data: Partial<SharedArea>) => void;
  onSharedAreaCreate?: (data: Omit<SharedArea, "id">) => void;
  onBeneficiaryUpdate?: (sharedAreaId: number, entityId: number, percentage: string) => void;
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

const AllocationVennDiagram: React.FC<AllocationVennDiagramProps> = ({
  entities,
  sharedAreas,
  onEntityUpdate,
  onSharedAreaUpdate,
  onSharedAreaCreate,
  onBeneficiaryUpdate,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("entities");
  const [hoveredEntity, setHoveredEntity] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [selectedSharedArea, setSelectedSharedArea] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Assign colors to entities if they don't have one
  const entitiesWithColors = entities.map(entity => ({
    ...entity,
    color: entity.color || getColorForEntityType(entity.type),
  }));

  // Calculate total area
  const totalArea = entities.reduce(
    (sum, entity) => sum + parseFloat(entity.suitArea || "0"), 
    0
  );

  // Calculate principal common area
  const principalCommonAreas = sharedAreas.filter(area => area.type === "principal_common");
  const principalCommonArea = principalCommonAreas.reduce(
    (sum, area) => sum + parseFloat(area.area || "0"),
    0
  );

  // Function to render the Venn diagram
  const renderVennDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;
    
    // Draw principal common area (if any)
    if (principalCommonArea > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Label principal common area
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Principal Common Area', centerX, centerY - maxRadius + 15);
    }

    // Calculate positions for entity circles
    const entityCount = entitiesWithColors.length;
    const angleIncrement = (2 * Math.PI) / entityCount;
    
    // Draw entity circles
    entitiesWithColors.forEach((entity, index) => {
      const entityArea = parseFloat(entity.suitArea || "0");
      const ratio = entityArea / totalArea;
      const radius = maxRadius * Math.sqrt(ratio) * 0.8; // Use sqrt for visual area representation
      
      // Calculate position in a circle layout
      const angle = index * angleIncrement;
      const x = centerX + (maxRadius * 0.5) * Math.cos(angle);
      const y = centerY + (maxRadius * 0.5) * Math.sin(angle);
      
      // Determine if this entity is highlighted
      const isHighlighted = entity.id === hoveredEntity || entity.id === selectedEntity;
      const strokeWidth = isHighlighted ? 3 : 1;
      
      // Draw the circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = `${entity.color}40`; // Add alpha transparency
      ctx.fill();
      ctx.strokeStyle = entity.color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
      
      // Add entity name
      ctx.fillStyle = '#333';
      ctx.font = isHighlighted ? 'bold 12px Arial' : '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(entity.name, x, y);
      
      // Add area size below
      ctx.font = '10px Arial';
      ctx.fillText(`${entity.suitArea} m²`, x, y + 15);
    });
    
    // Draw shared area connections if in shared area tab
    if (activeTab === "sharedAreas") {
      sharedAreas.forEach(area => {
        if (!area.beneficiaries || area.beneficiaries.length < 2) return;
        
        // Get the entities that benefit from this shared area
        const beneficiaryEntities = area.beneficiaries.map(ben => 
          entitiesWithColors.find(entity => entity.id === ben.entityId)
        ).filter(Boolean) as Entity[];
        
        if (beneficiaryEntities.length < 2) return;
        
        // Draw connections between beneficiary entities
        for (let i = 0; i < beneficiaryEntities.length; i++) {
          for (let j = i + 1; j < beneficiaryEntities.length; j++) {
            const entity1 = beneficiaryEntities[i];
            const entity2 = beneficiaryEntities[j];
            
            // Find positions of both entities
            const index1 = entitiesWithColors.findIndex(e => e.id === entity1.id);
            const index2 = entitiesWithColors.findIndex(e => e.id === entity2.id);
            
            if (index1 >= 0 && index2 >= 0) {
              const angle1 = index1 * angleIncrement;
              const angle2 = index2 * angleIncrement;
              
              const x1 = centerX + (maxRadius * 0.5) * Math.cos(angle1);
              const y1 = centerY + (maxRadius * 0.5) * Math.sin(angle1);
              const x2 = centerX + (maxRadius * 0.5) * Math.cos(angle2);
              const y2 = centerY + (maxRadius * 0.5) * Math.sin(angle2);
              
              // Draw connecting line
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = area.id === selectedSharedArea ? '#f00' : '#999';
              ctx.lineWidth = area.id === selectedSharedArea ? 2 : 1;
              ctx.setLineDash([5, 3]);
              ctx.stroke();
              ctx.setLineDash([]);
              
              // If this is the first connection, add label for the shared area
              if (i === 0 && j === 1) {
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                
                // Add a small circle at the midpoint to represent the shared area
                ctx.beginPath();
                ctx.arc(midX, midY, 5, 0, 2 * Math.PI);
                ctx.fillStyle = area.id === selectedSharedArea ? '#f00' : '#999';
                ctx.fill();
                
                // Add shared area name
                ctx.fillStyle = '#333';
                ctx.font = area.id === selectedSharedArea ? 'bold 10px Arial' : '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(area.name, midX, midY - 10);
              }
            }
          }
        }
      });
    }
  };

  // Render the diagram whenever relevant state changes
  useEffect(() => {
    renderVennDiagram();
  }, [entities, sharedAreas, activeTab, hoveredEntity, selectedEntity, selectedSharedArea]);

  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          renderVennDiagram();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Handle entity click in the diagram
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate center and max radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;
    
    // Calculate positions for entity circles to detect clicks
    const entityCount = entitiesWithColors.length;
    const angleIncrement = (2 * Math.PI) / entityCount;
    
    // Check if any entity was clicked
    let clickedEntity = null;
    entitiesWithColors.forEach((entity, index) => {
      const entityArea = parseFloat(entity.suitArea || "0");
      const ratio = entityArea / totalArea;
      const radius = maxRadius * Math.sqrt(ratio) * 0.8;
      
      const angle = index * angleIncrement;
      const entityX = centerX + (maxRadius * 0.5) * Math.cos(angle);
      const entityY = centerY + (maxRadius * 0.5) * Math.sin(angle);
      
      // Distance from click to entity center
      const distance = Math.sqrt((x - entityX) ** 2 + (y - entityY) ** 2);
      
      // If click is inside entity circle
      if (distance <= radius) {
        clickedEntity = entity.id;
      }
    });
    
    if (clickedEntity !== null) {
      setSelectedEntity(clickedEntity === selectedEntity ? null : clickedEntity);
    } else {
      setSelectedEntity(null);
    }
  };

  // Create a new shared area
  const createNewSharedArea = () => {
    if (onSharedAreaCreate && selectedEntity !== null) {
      const entity = entities.find(e => e.id === selectedEntity);
      if (!entity) return;
      
      const newArea: Omit<SharedArea, "id"> = {
        name: `Shared Area ${sharedAreas.length + 1}`,
        type: "common_element",
        area: "0",
        description: "Shared between some entities",
        beneficiaries: [{
          id: -1, // Temporary ID, will be replaced by backend
          entityId: entity.id,
          sharedAreaId: -1, // Temporary ID, will be replaced by backend
          allocationPercentage: "100" // Initially 100% for the creating entity
        }]
      };
      
      onSharedAreaCreate(newArea);
      toast({
        title: "Shared Area Created",
        description: "Add more beneficiaries to complete the setup",
      });
    } else {
      toast({
        title: "Select an Entity First",
        description: "Please select an entity to create a shared area",
        variant: "destructive"
      });
    }
  };

  // Handle adding entity to shared area
  const addEntityToSharedArea = () => {
    if (selectedEntity !== null && selectedSharedArea !== null && onBeneficiaryUpdate) {
      const sharedArea = sharedAreas.find(area => area.id === selectedSharedArea);
      if (!sharedArea || !sharedArea.beneficiaries) return;
      
      // Check if entity is already a beneficiary
      const isAlreadyBeneficiary = sharedArea.beneficiaries.some(
        ben => ben.entityId === selectedEntity
      );
      
      if (isAlreadyBeneficiary) {
        toast({
          title: "Entity Already Added",
          description: "This entity is already part of the shared area",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate new equal percentages
      const newBeneficiaryCount = sharedArea.beneficiaries.length + 1;
      const equalPercentage = (100 / newBeneficiaryCount).toFixed(2);
      
      // Update existing beneficiaries
      sharedArea.beneficiaries.forEach(ben => {
        onBeneficiaryUpdate(sharedArea.id, ben.entityId, equalPercentage);
      });
      
      // Add new beneficiary
      onBeneficiaryUpdate(sharedArea.id, selectedEntity, equalPercentage);
      
      toast({
        title: "Entity Added",
        description: "Entity added to shared area with adjusted percentages",
      });
    } else {
      toast({
        title: "Selection Required",
        description: "Please select both an entity and a shared area",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AMC Cost Allocation Visualization</CardTitle>
        <CardDescription>
          Visual representation of entities and shared areas for allocation mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <div className="p-4 h-[500px] relative">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full border rounded-md cursor-pointer" 
                onClick={handleCanvasClick}
                onMouseMove={(e) => {
                  // Similar logic to handleCanvasClick for hover detection
                  // but only updating hoveredEntity state
                  const canvas = canvasRef.current;
                  if (!canvas) return;
              
                  const rect = canvas.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const centerX = canvas.width / 2;
                  const centerY = canvas.height / 2;
                  const maxRadius = Math.min(centerX, centerY) - 20;
                  
                  const entityCount = entitiesWithColors.length;
                  const angleIncrement = (2 * Math.PI) / entityCount;
                  
                  let hovered = null;
                  entitiesWithColors.forEach((entity, index) => {
                    const entityArea = parseFloat(entity.suitArea || "0");
                    const ratio = entityArea / totalArea;
                    const radius = maxRadius * Math.sqrt(ratio) * 0.8;
                    
                    const angle = index * angleIncrement;
                    const entityX = centerX + (maxRadius * 0.5) * Math.cos(angle);
                    const entityY = centerY + (maxRadius * 0.5) * Math.sin(angle);
                    
                    const distance = Math.sqrt((x - entityX) ** 2 + (y - entityY) ** 2);
                    
                    if (distance <= radius) {
                      hovered = entity.id;
                    }
                  });
                  
                  setHoveredEntity(hovered);
                }}
                onMouseLeave={() => setHoveredEntity(null)}
              />
              <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-sm text-xs">
                <div className="flex items-center gap-1">
                  <Circle className="h-3 w-3" />
                  <span>Entity Size = Suite Area</span>
                </div>
                {activeTab === "sharedAreas" && (
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>Dashed Lines = Shared Areas</span>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <Tabs defaultValue="entities" value={activeTab} onValueChange={setActiveTab}>
              <div className="p-4">
                <TabsList className="w-full">
                  <TabsTrigger value="entities" className="flex-1">Entities</TabsTrigger>
                  <TabsTrigger value="sharedAreas" className="flex-1">Shared Areas</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="entities" className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium">Project Entities</h3>
                    <p className="text-xs text-muted-foreground">
                      Define entities and their properties for allocation calculations
                    </p>
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {entitiesWithColors.map(entity => (
                      <Card 
                        key={entity.id} 
                        className={`p-3 ${entity.id === selectedEntity ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entity.color }}
                            />
                            <h4 className="text-sm font-medium">{entity.name}</h4>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setSelectedEntity(entity.id)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Select this entity</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                          <div>Type: <span className="font-medium">{entity.type}</span></div>
                          <div>Suite Area: <span className="font-medium">{entity.suitArea} m²</span></div>
                          {entity.balconyArea && (
                            <div>Balcony: <span className="font-medium">{entity.balconyArea} m²</span></div>
                          )}
                          {entity.totalComponentArea && (
                            <div>Total Area: <span className="font-medium">{entity.totalComponentArea} m²</span></div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedEntity !== null && (
                    <div className="mt-4 p-3 border rounded-md">
                      <h4 className="text-sm font-medium mb-2">Selected Entity Details</h4>
                      {entities.filter(e => e.id === selectedEntity).map(entity => (
                        <div key={entity.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{entity.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" className="h-6 w-6 p-0"
                              onClick={() => setEditMode(!editMode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          {editMode ? (
                            // Edit form for the selected entity
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label htmlFor="suitArea" className="text-xs">Suite Area (m²)</Label>
                                  <Input 
                                    id="suitArea" 
                                    type="number" 
                                    value={entity.suitArea} 
                                    onChange={(e) => onEntityUpdate && onEntityUpdate(entity.id, { suitArea: e.target.value })}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="balconyArea" className="text-xs">Balcony Area (m²)</Label>
                                  <Input 
                                    id="balconyArea" 
                                    type="number" 
                                    value={entity.balconyArea || ''} 
                                    onChange={(e) => onEntityUpdate && onEntityUpdate(entity.id, { balconyArea: e.target.value })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label htmlFor="dedicatedCommon" className="text-xs">Dedicated Common (m²)</Label>
                                  <Input 
                                    id="dedicatedCommon" 
                                    type="number" 
                                    value={entity.dedicatedCommonArea || ''} 
                                    onChange={(e) => onEntityUpdate && onEntityUpdate(entity.id, { dedicatedCommonArea: e.target.value })}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="parkingBay" className="text-xs">Parking Bay (m²)</Label>
                                  <Input 
                                    id="parkingBay" 
                                    type="number" 
                                    value={entity.parkingBayArea || ''} 
                                    onChange={(e) => onEntityUpdate && onEntityUpdate(entity.id, { parkingBayArea: e.target.value })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setEditMode(false)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Display details of the selected entity
                            <div className="space-y-1 text-sm">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>Suite Area:</div>
                                <div className="font-medium">{entity.suitArea} m²</div>
                                
                                <div>Balcony Area:</div>
                                <div className="font-medium">{entity.balconyArea || '0'} m²</div>
                                
                                <div>Dedicated Common:</div>
                                <div className="font-medium">{entity.dedicatedCommonArea || '0'} m²</div>
                                
                                <div>Parking Bay:</div>
                                <div className="font-medium">{entity.parkingBayArea || '0'} m²</div>
                                
                                <div>Total Component Area:</div>
                                <div className="font-medium">{entity.totalComponentArea || 'Calculating...'} m²</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="sharedAreas" className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium">Shared Areas</h3>
                    <p className="text-xs text-muted-foreground">
                      Define shared areas and their beneficiary entities
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={createNewSharedArea}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Shared Area
                    </Button>
                    
                    {selectedEntity !== null && selectedSharedArea !== null && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={addEntityToSharedArea}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Add Selected Entity to Shared Area
                      </Button>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {sharedAreas.map(area => (
                      <Card 
                        key={area.id} 
                        className={`p-3 ${area.id === selectedSharedArea ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${area.type === 'principal_common' ? 'bg-gray-500' : 'bg-blue-500'}`} />
                            <h4 className="text-sm font-medium">{area.name}</h4>
                          </div>
                          <div className="flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" className="h-6 w-6 p-0"
                                    onClick={() => setSelectedSharedArea(area.id === selectedSharedArea ? null : area.id)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Select this shared area</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="text-xs mt-1">
                          <div>Type: <span className="font-medium capitalize">{area.type.replace('_', ' ')}</span></div>
                          <div>Area: <span className="font-medium">{area.area} m²</span></div>
                        </div>
                        {area.beneficiaries && area.beneficiaries.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium mb-1">Beneficiaries:</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                              {area.beneficiaries.map(ben => {
                                const entity = entities.find(e => e.id === ben.entityId);
                                return entity ? (
                                  <div key={ben.id} className="flex items-center justify-between">
                                    <span>{entity.name}</span>
                                    <span className="font-medium">{ben.allocationPercentage}%</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  
                  {selectedSharedArea !== null && (
                    <div className="mt-4 p-3 border rounded-md">
                      <h4 className="text-sm font-medium mb-2">Selected Shared Area</h4>
                      {sharedAreas.filter(a => a.id === selectedSharedArea).map(area => (
                        <div key={area.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{area.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" className="h-6 w-6 p-0"
                              onClick={() => setEditMode(!editMode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {editMode ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label htmlFor="areaName" className="text-xs">Name</Label>
                                <Input 
                                  id="areaName" 
                                  value={area.name} 
                                  onChange={(e) => onSharedAreaUpdate && onSharedAreaUpdate(area.id, { name: e.target.value })}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="areaType" className="text-xs">Type</Label>
                                <Select 
                                  value={area.type} 
                                  onValueChange={(value) => 
                                    onSharedAreaUpdate && 
                                    onSharedAreaUpdate(area.id, { 
                                      type: value as "principal_common" | "common_element" 
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="principal_common">Principal Common</SelectItem>
                                    <SelectItem value="common_element">Common Element</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="areaSize" className="text-xs">Area Size (m²)</Label>
                                <Input 
                                  id="areaSize" 
                                  type="number" 
                                  value={area.area} 
                                  onChange={(e) => onSharedAreaUpdate && onSharedAreaUpdate(area.id, { area: e.target.value })}
                                  className="h-8"
                                />
                              </div>
                              <div className="pt-2">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setEditMode(false)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1 text-sm">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  <div>Type:</div>
                                  <div className="font-medium capitalize">{area.type.replace('_', ' ')}</div>
                                  
                                  <div>Area Size:</div>
                                  <div className="font-medium">{area.area} m²</div>
                                </div>
                              </div>
                              
                              {area.beneficiaries && area.beneficiaries.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium mb-1">Beneficiary Allocation:</h5>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Entity</TableHead>
                                        <TableHead className="text-xs text-right">Percentage</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {area.beneficiaries.map(ben => {
                                        const entity = entities.find(e => e.id === ben.entityId);
                                        return entity ? (
                                          <TableRow key={ben.id}>
                                            <TableCell className="text-xs py-1">{entity.name}</TableCell>
                                            <TableCell className="text-xs text-right py-1">
                                              <Input 
                                                type="number" 
                                                value={ben.allocationPercentage} 
                                                onChange={(e) => onBeneficiaryUpdate && onBeneficiaryUpdate(
                                                  area.id, 
                                                  ben.entityId, 
                                                  e.target.value
                                                )}
                                                className="h-6 w-16 px-1 py-0 inline-block"
                                              />
                                              %
                                            </TableCell>
                                          </TableRow>
                                        ) : null;
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
};

export default AllocationVennDiagram;
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PlusCircleIcon,
  EditIcon as Edit,
  Trash as TrashIcon,
  FilterIcon,
  MinusIcon,
  PlusIcon,
  Percent as PercentIcon,
  InfoIcon
} from 'lucide-react';

// Import standard types from shared definitions
import {
  Entity,
  EntityBeneficiary,
  SharedArea,
  CombinationRatio,
  DerivedRatio,
  EntityModification,
  RatioType,
  SpecialArea
} from '@shared/ratio-types';

import { useToast } from "@/hooks/use-toast";

import { 
  getStandardizedRatioName, 
  getRatioTypeDisplayName,
  getRatioTypeColorClass,
  formatRatioValue,
  formatPercentage
} from './ratio-utils';

// Define the props
interface DerivedRatiosDisplayProps {
  entities: Entity[];
  sharedAreas: SharedArea[]; // We keep this for backward compatibility but don't convert to special areas
  combinationRatios: CombinationRatio[];
  derivedRatios?: DerivedRatio[]; // Add prop to accept existing derived ratios
  unitType: 'sqm' | 'sqft';
  onSave?: (derivedRatios: DerivedRatio[]) => void;
  // We'll also save special areas when they're updated
  onSaveSpecialAreas?: (specialAreas: SpecialArea[]) => void;
  
  // External control props for dialogs
  isCreateDialogOpen?: boolean;
  onCreateDialogOpenChange?: (open: boolean) => void;
  isManageAreasDialogOpen?: boolean;
  onManageAreasDialogOpenChange?: (open: boolean) => void;
  selectedSourceRatio?: CombinationRatio | null;
}

export function DerivedRatiosDisplay({
  entities,
  sharedAreas,
  combinationRatios,
  derivedRatios: existingDerivedRatios = [],
  unitType,
  onSave,
  onSaveSpecialAreas,
  // External control props
  isCreateDialogOpen: externalIsCreateDialogOpen,
  onCreateDialogOpenChange,
  isManageAreasDialogOpen: externalIsManageAreasDialogOpen,
  onManageAreasDialogOpenChange,
  selectedSourceRatio
}: DerivedRatiosDisplayProps) {
  // State for managing derived ratios
  const { toast } = useToast();
  const [derivedRatios, setDerivedRatios] = useState<DerivedRatio[]>(existingDerivedRatios);
  
  // Use local state with fallback to props
  const [internalIsCreateDialogOpen, setInternalIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [internalIsManageAreasDialogOpen, setInternalIsManageAreasDialogOpen] = useState(false);
  
  // Use controlled state for dialogs (prioritize external control if provided)
  const isCreateDialogOpen = externalIsCreateDialogOpen !== undefined ? externalIsCreateDialogOpen : internalIsCreateDialogOpen;
  const isManageAreasDialogOpen = externalIsManageAreasDialogOpen !== undefined ? externalIsManageAreasDialogOpen : internalIsManageAreasDialogOpen;
  
  // Wrapper functions to handle state changes with fallback
  const setIsCreateDialogOpen = (open: boolean) => {
    if (onCreateDialogOpenChange) {
      onCreateDialogOpenChange(open);
    }
    setInternalIsCreateDialogOpen(open);
  };
  
  const setIsManageAreasDialogOpen = (open: boolean) => {
    if (onManageAreasDialogOpenChange) {
      onManageAreasDialogOpenChange(open);
    }
    setInternalIsManageAreasDialogOpen(open);
  };
  
  // Use the external source ratio if provided
  const [selectedSourceRatioId, setSelectedSourceRatioId] = useState<number | null>(null);
  
  // When selectedSourceRatio changes, update the internal state
  useEffect(() => {
    if (selectedSourceRatio) {
      setSelectedSourceRatioId(selectedSourceRatio.id);
    }
  }, [selectedSourceRatio]);
  
  const [ratioName, setRatioName] = useState('');
  const [ratioDescription, setRatioDescription] = useState('');
  const [entityModifications, setEntityModifications] = useState<EntityModification[]>([]);
  const [editingRatioId, setEditingRatioId] = useState<number | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaValue, setNewAreaValue] = useState('');
  
  // Manage special areas (these are separate from shared areas)
  const [specialAreas, setSpecialAreas] = useState<SpecialArea[]>([
    // Initialize with a few sample special areas 
    { id: 1001, name: 'Landscaping Area', area: 500, type: 'special' },
    { id: 1002, name: 'Equipment Room', area: 120, type: 'special' },
    { id: 1003, name: 'Recreation Area', area: 350, type: 'special' }
  ]);
  
  // Update derived ratios if external ones change
  useEffect(() => {
    setDerivedRatios(existingDerivedRatios);
  }, [existingDerivedRatios]);
  
  // Helper function to get entity name
  const getEntityName = (entityId: number) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : `Entity ${entityId}`;
  };
  
  // Find a source ratio by ID
  const findSourceRatio = (ratioId: number) => {
    return combinationRatios.find(r => r.id === ratioId);
  };
  
  // Calculate entity values for a source ratio
  const calculateEntityValues = (ratio: CombinationRatio) => {
    const result: Record<number, { value: number, percentage: number }> = {};
    const ratioType = ratio.ratioType || 'sellable_area';
    
    ratio.entityIds.forEach(entityId => {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) return;
      
      // Get area value based on ratio type
      let areaValue = 0;
      
      switch(ratioType) {
        case 'sellable_area':
          areaValue = parseFloat(entity.sellableArea || entity.suitArea || '0');
          break;
        case 'applicable_area':
          areaValue = parseFloat(entity.applicableArea || '0');
          break;
        case 'total_component_area': 
          // Sum all component areas
          areaValue = parseFloat(entity.totalComponentArea || '0');
          break;
        case 'common_element_area':
          // Calculate entity's share of common element areas
          areaValue = parseFloat(entity.commonElementArea || '0');
          break;
        case 'principal_common_area':
          // Calculate entity's share of principal common areas
          areaValue = parseFloat(entity.principalCommonArea || '0');
          break;
        case 'total_common_area':
          // Sum of common element and principal common
          areaValue = parseFloat(entity.totalCommonArea || '0');
          break;
        case 'combined_area':
          // Custom combined area calculation
          areaValue = parseFloat(entity.combinedArea || '0');
          break;
        // Add other ratio types as needed
        default:
          areaValue = parseFloat(entity.sellableArea || entity.suitArea || '0');
      }
      
      result[entityId] = {
        value: areaValue,
        percentage: 0 // Percentage will be calculated after all values are known
      };
    });
    
    // Calculate percentages
    const totalArea = Object.values(result).reduce((sum, item) => sum + item.value, 0);
    
    Object.keys(result).forEach(entityId => {
      const numericId = parseInt(entityId);
      const value = result[numericId].value;
      result[numericId].percentage = totalArea > 0 ? (value / totalArea) * 100 : 0;
    });
    
    return result;
  };
  
  // Generate a ratio name based on modifications
  const generateRatioName = (
    sourceName: string, 
    modifications: EntityModification[]
  ): string => {
    // Check if there are any special area modifications
    const hasSpecialAreaMods = modifications.some(mod => {
      return (
        (mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0) ||
        (mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0)
      );
    });
    
    // If no special area modifications, just use the source name
    if (!hasSpecialAreaMods) return `Modified ${sourceName}`;
    
    // Analyze modifications to create a more descriptive name
    
    // Get areas being added and excluded
    const addedAreaIds = new Set<number>();
    const excludedAreaIds = new Set<number>();
    
    modifications.forEach(mod => {
      // Add all area IDs to respective sets
      mod.addedSpecialAreas?.forEach(id => addedAreaIds.add(id));
      mod.excludedSpecialAreas?.forEach(id => excludedAreaIds.add(id));
    });
    
    // Get area names from IDs
    const addedAreaNames = Array.from(addedAreaIds)
      .map(id => specialAreas.find(a => a.id === id)?.name || `Area ${id}`)
      .slice(0, 2); // Limit to first 2 for readability
    
    const excludedAreaNames = Array.from(excludedAreaIds)
      .map(id => specialAreas.find(a => a.id === id)?.name || `Area ${id}`)
      .slice(0, 2); // Limit to first 2 for readability
    
    // Create descriptive name based on modifications
    let newName = sourceName;
    
    // If we have both additions and exclusions
    if (addedAreaIds.size > 0 && excludedAreaIds.size > 0) {
      const addedSuffix = addedAreaIds.size > 2 ? ` +${addedAreaIds.size - 2} more` : '';
      const excludedSuffix = excludedAreaIds.size > 2 ? ` +${excludedAreaIds.size - 2} more` : '';
      
      newName = `${sourceName} [+${addedAreaNames.join(', ')}${addedSuffix} | -${excludedAreaNames.join(', ')}${excludedSuffix}]`;
    } 
    // If we only have additions
    else if (addedAreaIds.size > 0) {
      const suffix = addedAreaIds.size > 2 ? ` +${addedAreaIds.size - 2} more` : '';
      newName = `${sourceName} [+${addedAreaNames.join(', ')}${suffix}]`;
    } 
    // If we only have exclusions
    else if (excludedAreaIds.size > 0) {
      const suffix = excludedAreaIds.size > 2 ? ` +${excludedAreaIds.size - 2} more` : '';
      newName = `${sourceName} [-${excludedAreaNames.join(', ')}${suffix}]`;
    }
    
    // Ensure the name doesn't get too long
    if (newName.length > 70) {
      // Revert to simpler naming if too long
      if (addedAreaIds.size > 0 && excludedAreaIds.size > 0) {
        newName = `${sourceName} [+${addedAreaIds.size} areas, -${excludedAreaIds.size} areas]`;
      } else if (addedAreaIds.size > 0) {
        newName = `${sourceName} [+${addedAreaIds.size} areas]`;
      } else if (excludedAreaIds.size > 0) {
        newName = `${sourceName} [-${excludedAreaIds.size} areas]`;
      }
    }
    
    return newName;
  };
  
  // Calculate the value of a derived ratio based on entity modifications
  const calculateDerivedRatioValue = (
    sourceRatio: CombinationRatio,
    modifications: EntityModification[]
  ): Record<number, number> => {
    // First calculate the base values from the source ratio
    const baseValues = calculateEntityValues(sourceRatio);
    
    // Create the result object
    const result: Record<number, number> = {};
    
    // Apply modifications to each entity
    modifications.forEach(mod => {
      // Skip if no action specified
      if (!mod.action) return;
      
      const entityId = mod.entityId;
      let value = baseValues[entityId]?.value || 0;
      
      // Process add/remove special areas
      if (mod.action === 'include') {
        // Subtract excluded areas
        if (mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0) {
          mod.excludedSpecialAreas.forEach(areaId => {
            const area = specialAreas.find(a => a.id === areaId);
            if (area) {
              value -= area.area;
            }
          });
        }
        
        // Add included areas
        if (mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0) {
          mod.addedSpecialAreas.forEach(areaId => {
            const area = specialAreas.find(a => a.id === areaId);
            if (area) {
              value += area.area;
            }
          });
        }
        
        // Ensure value is not negative
        value = Math.max(0, value);
        
        // Update modified value on the mod object for reference
        mod.modifiedValue = value;
        
        // Add to result
        result[entityId] = value;
      } else if (mod.action === 'exclude') {
        // Entity is excluded from calculation
        result[entityId] = 0;
      }
    });
    
    return result;
  };
  
  // Update a specific entity modification
  const updateEntityModification = (
    entityId: number, 
    action?: 'include' | 'exclude',
    specialAreaUpdate?: {
      specialAreaId: number;
      action: 'add' | 'subtract' | 'neutral';
    }
  ) => {
    // Find the existing modification for this entity
    const modIndex = entityModifications.findIndex(m => m.entityId === entityId);
    
    if (modIndex === -1) {
      console.error('Entity modification not found:', entityId);
      return;
    }
    
    // Create a copy of the modifications array
    const newModifications = [...entityModifications];
    const mod = { ...newModifications[modIndex] };
    
    // Update the action if provided
    if (action) {
      mod.action = action;
    }
    
    // Update special area if provided
    if (specialAreaUpdate) {
      const { specialAreaId, action: areaAction } = specialAreaUpdate;
      
      if (areaAction === 'add') {
        // Add to added areas
        const addedSpecialAreas = mod.addedSpecialAreas || [];
        
        // First, ensure it's not in excluded areas
        mod.excludedSpecialAreas = (mod.excludedSpecialAreas || [])
          .filter(id => id !== specialAreaId);
        
        // Then add it to added areas if not already there
        if (!addedSpecialAreas.includes(specialAreaId)) {
          mod.addedSpecialAreas = [...addedSpecialAreas, specialAreaId];
        } else {
          mod.addedSpecialAreas = addedSpecialAreas;
        }
      } else if (areaAction === 'subtract') {
        // Add to excluded areas
        const excludedSpecialAreas = mod.excludedSpecialAreas || [];
        
        // First, ensure it's not in added areas
        mod.addedSpecialAreas = (mod.addedSpecialAreas || [])
          .filter(id => id !== specialAreaId);
        
        // Then add it to excluded areas if not already there
        if (!excludedSpecialAreas.includes(specialAreaId)) {
          mod.excludedSpecialAreas = [...excludedSpecialAreas, specialAreaId];
        } else {
          mod.excludedSpecialAreas = excludedSpecialAreas;
        }
      } else if (areaAction === 'neutral') {
        // Remove from both added and excluded
        mod.addedSpecialAreas = (mod.addedSpecialAreas || [])
          .filter(id => id !== specialAreaId);
        
        mod.excludedSpecialAreas = (mod.excludedSpecialAreas || [])
          .filter(id => id !== specialAreaId);
      }
    }
    
    // Update the modification in the array
    newModifications[modIndex] = mod;
    
    // Update modifications state
    setEntityModifications(newModifications);
    
    // If we have a source ratio selected, recalculate the derived values
    if (selectedSourceRatioId) {
      const sourceRatio = combinationRatios.find(r => r.id === selectedSourceRatioId);
      if (sourceRatio) {
        const newValues = calculateDerivedRatioValue(sourceRatio, newModifications);
        
        // Update the modifiedValue field for each modification
        newModifications.forEach(mod => {
          mod.modifiedValue = newValues[mod.entityId] || 0;
        });
        
        setEntityModifications(newModifications);
      }
    }
  };
  
  // Reset the form for creating new derived ratios
  const resetForm = () => {
    setSelectedSourceRatioId(null);
    setRatioName('');
    setRatioDescription('');
    setEntityModifications([]);
    setEditingRatioId(null);
  };
  
  // Create a new derived ratio
  const handleCreateDerivedRatio = () => {
    if (!selectedSourceRatioId) {
      console.error('No source ratio selected');
      return;
    }
    
    const sourceRatio = combinationRatios.find(r => r.id === selectedSourceRatioId);
    if (!sourceRatio) {
      console.error('Source ratio not found');
      return;
    }
    
    const name = ratioName || generateRatioName(sourceRatio.name, entityModifications);
    
    // Calculate entity values
    const entityValues = calculateDerivedRatioValue(sourceRatio, entityModifications);
    
    // Create the new derived ratio
    const newRatio: DerivedRatio = {
      id: Date.now(), // Use timestamp as temporary ID
      name,
      description: ratioDescription || undefined,
      sourceRatioId: sourceRatio.id,
      sourceRatioName: sourceRatio.name,
      ratioType: sourceRatio.ratioType || 'custom',
      entityIds: sourceRatio.entityIds,
      entityValues,
      entityModifications
    };
    
    // Update state
    const updatedRatios = [...derivedRatios, newRatio];
    setDerivedRatios(updatedRatios);
    
    // Call the save callback
    if (onSave) {
      onSave(updatedRatios);
    }
    
    // Reset form and close dialog
    resetForm();
    setIsCreateDialogOpen(false);
  };
  
  // Open the edit dialog for a ratio
  const openEditDialog = (derivedRatio: DerivedRatio) => {
    setEditingRatioId(derivedRatio.id);
    setRatioName(derivedRatio.name);
    setRatioDescription(derivedRatio.description || '');
    setSelectedSourceRatioId(derivedRatio.sourceRatioId);
    setEntityModifications(derivedRatio.entityModifications || []);
    setIsEditDialogOpen(true);
  };
  
  // Update an existing derived ratio
  const handleUpdateDerivedRatio = () => {
    if (!editingRatioId || !selectedSourceRatioId) {
      console.error('No ratio selected for editing');
      return;
    }
    
    const sourceRatio = combinationRatios.find(r => r.id === selectedSourceRatioId);
    if (!sourceRatio) {
      console.error('Source ratio not found');
      return;
    }
    
    const name = ratioName || generateRatioName(sourceRatio.name, entityModifications);
    
    // Calculate entity values
    const entityValues = calculateDerivedRatioValue(sourceRatio, entityModifications);
    
    // Create the updated ratio
    const updatedRatio: DerivedRatio = {
      id: editingRatioId,
      name,
      description: ratioDescription || undefined,
      sourceRatioId: sourceRatio.id,
      sourceRatioName: sourceRatio.name,
      ratioType: sourceRatio.ratioType || 'custom',
      entityIds: sourceRatio.entityIds,
      entityValues,
      entityModifications
    };
    
    // Update state
    const updatedRatios = derivedRatios.map(ratio => 
      ratio.id === editingRatioId ? updatedRatio : ratio
    );
    setDerivedRatios(updatedRatios);
    
    // Call the save callback
    if (onSave) {
      onSave(updatedRatios);
    }
    
    // Reset form and close dialog
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  // Delete a derived ratio
  const handleDeleteDerivedRatio = (id: number) => {
    const updatedRatios = derivedRatios.filter(ratio => ratio.id !== id);
    setDerivedRatios(updatedRatios);
    
    // Call the save callback
    if (onSave) {
      onSave(updatedRatios);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Special Area Modifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom ratios by adding or excluding special areas from existing ratios
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            onClick={() => setIsManageAreasDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Manage Special Areas
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Create Derived Ratio
          </Button>
        </div>
        
        {/* Manage Special Areas Dialog */}
        <Dialog open={isManageAreasDialogOpen} onOpenChange={setIsManageAreasDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Special Areas</DialogTitle>
              <DialogDescription>
                Special areas are distinct spaces that can be added to or excluded from entity calculations.
                They are separate from shared areas and are used for custom area adjustments.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {/* Add new special area */}
              <div className="border rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-2">Add New Special Area</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="area-name">Area Name</Label>
                    <Input
                      id="area-name"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      placeholder="Enter area name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="area-value">Area Value ({unitType})</Label>
                    <Input
                      id="area-value"
                      value={newAreaValue}
                      onChange={(e) => setNewAreaValue(e.target.value)}
                      placeholder="Enter area value"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-3 w-full"
                  onClick={() => {
                    if (!newAreaName || !newAreaValue) {
                      toast({
                        title: "Error",
                        description: "Please provide both name and area value",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    const value = parseFloat(newAreaValue);
                    if (isNaN(value) || value <= 0) {
                      toast({
                        title: "Error",
                        description: "Area value must be a positive number",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // Create new special area
                    const newArea: SpecialArea = {
                      id: Date.now(), // Use timestamp as ID
                      name: newAreaName,
                      area: value,
                      type: 'special'
                    };
                    
                    // Add to special areas
                    const updatedSpecialAreas = [...specialAreas, newArea];
                    setSpecialAreas(updatedSpecialAreas);
                    
                    // Call save callback if provided
                    if (onSaveSpecialAreas) {
                      onSaveSpecialAreas(updatedSpecialAreas);
                    }
                    
                    // Reset form
                    setNewAreaName('');
                    setNewAreaValue('');
                    
                    toast({
                      title: "Special Area Added",
                      description: `Added ${newArea.name} (${value} ${unitType})`,
                    });
                  }}
                >
                  Add Special Area
                </Button>
              </div>
              
              {/* List of existing special areas */}
              <div>
                <h3 className="text-sm font-medium mb-2">Existing Special Areas</h3>
                {specialAreas.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Area ({unitType})</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specialAreas.map((area) => (
                          <TableRow key={area.id}>
                            <TableCell>{area.name}</TableCell>
                            <TableCell className="text-right">{area.area}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm"
                                variant="ghost" 
                                onClick={() => {
                                  // Remove special area
                                  const updatedSpecialAreas = specialAreas.filter(a => a.id !== area.id);
                                  setSpecialAreas(updatedSpecialAreas);
                                  
                                  // Call save callback if provided
                                  if (onSaveSpecialAreas) {
                                    onSaveSpecialAreas(updatedSpecialAreas);
                                  }
                                  
                                  toast({
                                    title: "Special Area Removed",
                                    description: `Removed ${area.name}`
                                  });
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No special areas added yet</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsManageAreasDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        {/* Derived Ratios Matrix - Only show those with special area inclusions/exclusions */}
        {derivedRatios.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-sm font-medium mb-2">Special Area Modifications Matrix</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Each ratio is displayed as a row, with the ratio distribution shown between entities.
            </p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Ratio Name</TableHead>
                    <TableHead className="w-[120px]">Source</TableHead>
                    <TableHead className="w-[120px]">Distribution</TableHead>
                    {entities.map(entity => (
                      <TableHead key={entity.id} className="text-center w-[120px]">
                        {entity.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {derivedRatios.filter(ratio => {
                    // Only show ratios that have special area inclusions or exclusions
                    if (!ratio.entityModifications) return false;
                    
                    // Check if any entity has special area modifications
                    return ratio.entityModifications.some(mod => 
                      (mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0) || 
                      (mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0)
                    );
                  }).map(ratio => {
                    // Calculate distribution percentages
                    const totalValue = Object.values(ratio.entityValues || {}).reduce((sum, val) => sum + val, 0);
                    
                    const distributionData = Object.entries(ratio.entityValues || {})
                      .map(([entityId, value]) => {
                        const entity = entities.find(e => e.id.toString() === entityId.toString());
                        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                        
                        return {
                          entityId: parseInt(entityId),
                          entityName: entity ? entity.name : `Entity ${entityId}`,
                          value,
                          percentage,
                          display: `${formatRatioValue(value, unitType)}\n${formatPercentage(percentage)}`
                        };
                      })
                      .filter(item => item.value > 0)
                      .sort((a, b) => b.percentage - a.percentage);
              
                    return (
                      <TableRow key={ratio.id}>
                        <TableCell className="font-medium">
                          {ratio.description || getStandardizedRatioName(ratio)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRatioTypeColorClass(ratio.ratioType)} text-xs py-0.5 font-normal text-black`}>
                            {ratio.sourceRatioName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {totalValue.toFixed(2)} {unitType}
                          </span>
                        </TableCell>
                        
                        {/* Entity columns */}
                        {entities.map(entity => {
                          const entityData = distributionData.find(item => 
                            item.entityId.toString() === entity.id.toString()
                          );
                          
                          return (
                            <TableCell key={entity.id} className="text-center p-2">
                              {entityData ? (
                                <div className={`px-3 py-1.5 rounded ${getRatioTypeColorClass(ratio.ratioType)} whitespace-pre-line text-xs text-center`}>
                                  {entityData.display}
                                </div>
                              ) : (
                                <div className="text-slate-300 text-xs">—</div>
                              )}
                            </TableCell>
                          );
                        })}
                        
                        {/* Actions column */}
                        <TableCell className="text-right">
                          <div className="flex space-x-1 justify-end">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openEditDialog(ratio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteDerivedRatio(ratio.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-md border border-dashed">
            <FilterIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No derived ratios with special area modifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              This section shows only ratios that have special area inclusions or exclusions.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create a new derived ratio with special areas by clicking "Create Derived Ratio" above.
            </p>
          </div>
        )}
        
        {/* Create dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Derived Ratio</DialogTitle>
              <DialogDescription>
                Create a new derived ratio based on an existing combination ratio
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="p-3 border rounded-md bg-slate-50 mb-2">
                <p className="text-sm">
                  Customize your derived ratio with a simplified approach:
                </p>
                <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                  <li>All entities are automatically included in the calculation</li>
                  <li>Special areas can be added to or subtracted from entities as needed</li>
                  <li>You can add or subtract the same special area from different entities</li>
                  <li>Changes will be calculated automatically - no manual entry required</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source-ratio">Select Source Ratio</Label>
                  <Select 
                    value={selectedSourceRatioId?.toString() || ''}
                    onValueChange={(value) => {
                      const id = parseInt(value);
                      setSelectedSourceRatioId(id);
                      
                      // When selecting a source ratio, initialize the entity modifications
                      // with defaults for all entities in the selected ratio
                      const sourceRatio = combinationRatios.find(r => r.id === id);
                      if (sourceRatio) {
                        const entityValues = calculateEntityValues(sourceRatio);
                        const initialModifications: EntityModification[] = sourceRatio.entityIds.map(entityId => ({
                          entityId,
                          action: 'include', // By default, include all entities
                          originalValue: entityValues[entityId]?.value || 0,
                          modifiedValue: entityValues[entityId]?.value || 0
                        }));
                        setEntityModifications(initialModifications);
                        
                        // Auto-generate a name based on source ratio
                        setRatioName(generateRatioName(sourceRatio.name, initialModifications));
                      }
                    }}
                  >
                    <SelectTrigger id="source-ratio">
                      <SelectValue placeholder="Select a ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {combinationRatios.map(ratio => (
                        <SelectItem key={ratio.id} value={ratio.id.toString()}>
                          {ratio.name} - {getRatioTypeDisplayName(ratio.ratioType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ratio-name">Derived Ratio Name</Label>
                  <Input
                    id="ratio-name"
                    value={ratioName}
                    onChange={(e) => setRatioName(e.target.value)}
                    placeholder="Will auto-generate if left blank"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ratio-description">Description (Optional)</Label>
                <Input
                  id="ratio-description"
                  value={ratioDescription}
                  onChange={(e) => setRatioDescription(e.target.value)}
                  placeholder="Add a description of this derived ratio"
                />
              </div>
              
              {selectedSourceRatioId && entityModifications.length > 0 && (
                <div className="border rounded-md p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  <Label className="block mb-4">
                    Entity Area Modifications
                  </Label>
                  
                  {entityModifications.map(mod => (
                    <div key={mod.entityId} className="border-b pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0">
                      <div className="w-full mb-2">
                        <div className="flex justify-between items-baseline">
                          <Label className="font-medium">
                            {getEntityName(mod.entityId)}
                          </Label>
                          <Badge className="text-xs">Required</Badge>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-col gap-1">
                          <div>Base Area: {mod.originalValue.toFixed(2)} {unitType}</div>
                          
                          {/* Show subtracted areas */}
                          {mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0 && (
                            <div className="flex items-center text-red-600">
                              <MinusIcon className="h-3 w-3 mr-1" />
                              <span>
                                Subtracted: {
                                  specialAreas
                                    .filter(a => mod.excludedSpecialAreas?.includes(a.id))
                                    .map(a => `${a.name} (${a.area} ${unitType})`)
                                    .join(', ')
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Show added areas */}
                          {mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0 && (
                            <div className="flex items-center text-green-600">
                              <PlusIcon className="h-3 w-3 mr-1" />
                              <span>
                                Added: {
                                  specialAreas
                                    .filter(a => mod.addedSpecialAreas?.includes(a.id))
                                    .map(a => `${a.name} (${a.area} ${unitType})`)
                                    .join(', ')
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Show modified value */}
                          <div className="flex items-center font-medium mt-1 text-blue-700">
                            <span>Final Area: {mod.modifiedValue.toFixed(2)} {unitType}</span>
                          </div>
                        </div>
                      </div>
                      
                      {specialAreas.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-sm font-medium block mb-2">
                            Special Areas:
                            <p className="text-xs text-slate-600 mb-2 font-normal">
                              Select how each special area should be applied to this entity
                            </p>
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {specialAreas.map(area => (
                              <div key={area.id} className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
                                <div>
                                  <span className="text-sm font-medium">{area.name}</span>
                                  <span className="text-xs text-slate-500 ml-1">
                                    ({area.area} {unitType})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={
                                      mod.addedSpecialAreas?.includes(area.id)
                                        ? 'add'
                                        : mod.excludedSpecialAreas?.includes(area.id)
                                          ? 'subtract'
                                          : 'neutral'
                                    }
                                    onValueChange={(value) => {
                                      // Call updateEntityModification to properly handle the area changes
                                      // This will update the entityModifications state with correct values
                                      updateEntityModification(
                                        mod.entityId,
                                        undefined,
                                        {
                                          specialAreaId: area.id,
                                          action: value as 'add' | 'subtract' | 'neutral'
                                        }
                                      );
                                      
                                      // Auto-update the name with the new modifications
                                      if (selectedSourceRatioId) {
                                        const sourceRatio = findSourceRatio(selectedSourceRatioId);
                                        if (sourceRatio) {
                                          // Only update the name if user hasn't customized it
                                          if (!ratioName || ratioName === generateRatioName(sourceRatio.name, entityModifications)) {
                                            // Let's use the updated entityModifications state after a short delay
                                            // to ensure updateEntityModification has completed
                                            setTimeout(() => {
                                              setRatioName(generateRatioName(sourceRatio.name, entityModifications));
                                            }, 50);
                                          }
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="neutral">Neutral</SelectItem>
                                      <SelectItem value="add">Add</SelectItem>
                                      <SelectItem value="subtract">Subtract</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDerivedRatio}>Create Derived Ratio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Derived Ratio</DialogTitle>
              <DialogDescription>
                Modify an existing derived ratio
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="p-3 border rounded-md bg-slate-50 mb-2">
                <p className="text-sm">
                  Customize your derived ratio with a simplified approach:
                </p>
                <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                  <li>All entities are automatically included in the calculation</li>
                  <li>Special areas can be added to or subtracted from entities as needed</li>
                  <li>You can add or subtract the same special area from different entities</li>
                  <li>Changes will be calculated automatically - no manual entry required</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-source-ratio">Source Ratio</Label>
                  <Input
                    id="edit-source-ratio"
                    value={combinationRatios.find(r => r.id === selectedSourceRatioId)?.name || ''}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ratio-name">Ratio Name</Label>
                  <Input
                    id="edit-ratio-name"
                    value={ratioName}
                    onChange={(e) => setRatioName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-ratio-description">Description (Optional)</Label>
                <Input
                  id="edit-ratio-description"
                  value={ratioDescription}
                  onChange={(e) => setRatioDescription(e.target.value)}
                  placeholder="Add a description of this derived ratio"
                />
              </div>
              
              {selectedSourceRatioId && entityModifications.length > 0 && (
                <div className="border rounded-md p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  <Label className="block mb-4">
                    Entity Area Modifications
                  </Label>
                  
                  {entityModifications.map(mod => (
                    <div key={mod.entityId} className="border-b pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0">
                      <div className="w-full mb-2">
                        <div className="flex justify-between items-baseline">
                          <Label className="font-medium">
                            {getEntityName(mod.entityId)}
                          </Label>
                          <Badge className="text-xs">Required</Badge>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-col gap-1">
                          <div>Base Area: {mod.originalValue.toFixed(2)} {unitType}</div>
                          
                          {/* Show subtracted areas */}
                          {mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0 && (
                            <div className="flex items-center text-red-600">
                              <MinusIcon className="h-3 w-3 mr-1" />
                              <span>
                                Subtracted: {
                                  specialAreas
                                    .filter(a => mod.excludedSpecialAreas?.includes(a.id))
                                    .map(a => `${a.name} (${a.area} ${unitType})`)
                                    .join(', ')
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Show added areas */}
                          {mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0 && (
                            <div className="flex items-center text-green-600">
                              <PlusIcon className="h-3 w-3 mr-1" />
                              <span>
                                Added: {
                                  specialAreas
                                    .filter(a => mod.addedSpecialAreas?.includes(a.id))
                                    .map(a => `${a.name} (${a.area} ${unitType})`)
                                    .join(', ')
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Show modified value */}
                          <div className="flex items-center font-medium mt-1 text-blue-700">
                            <span>Final Area: {mod.modifiedValue.toFixed(2)} {unitType}</span>
                          </div>
                        </div>
                      </div>
                      
                      {specialAreas.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-sm font-medium block mb-2">
                            Special Areas:
                            <p className="text-xs text-slate-600 mb-2 font-normal">
                              Select how each special area should be applied to this entity
                            </p>
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {specialAreas.map(area => (
                              <div key={area.id} className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
                                <div>
                                  <span className="text-sm font-medium">{area.name}</span>
                                  <span className="text-xs text-slate-500 ml-1">
                                    ({area.area} {unitType})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={
                                      mod.addedSpecialAreas?.includes(area.id)
                                        ? 'add'
                                        : mod.excludedSpecialAreas?.includes(area.id)
                                          ? 'subtract'
                                          : 'neutral'
                                    }
                                    onValueChange={(value) => {
                                      // Call updateEntityModification to properly handle the area changes
                                      updateEntityModification(
                                        mod.entityId,
                                        undefined,
                                        {
                                          specialAreaId: area.id,
                                          action: value as 'add' | 'subtract' | 'neutral'
                                        }
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="neutral">Neutral</SelectItem>
                                      <SelectItem value="add">Add</SelectItem>
                                      <SelectItem value="subtract">Subtract</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateDerivedRatio}>Update Ratio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
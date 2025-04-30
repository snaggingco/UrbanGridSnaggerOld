import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, DollarSign, PercentIcon, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Entity, Ratio, AllocationInput } from './BudgetItemAllocationNew';

// Available units for input values
const availableUnits = [
  { value: 'AED', label: 'AED', type: 'currency' },
  { value: 'Each', label: 'Each', type: 'quantity' },
  { value: 'Hours', label: 'Hours', type: 'time' },
  { value: 'Days', label: 'Days', type: 'time' },
  { value: 'Months', label: 'Months', type: 'time' },
  { value: 'Years', label: 'Years', type: 'time' },
  { value: 'Staff', label: 'Staff', type: 'quantity' },
  { value: 'Square Meters', label: 'Square Meters', type: 'area' },
  { value: 'Square Feet', label: 'Square Feet', type: 'area' },
  { value: 'Percentage', label: 'Percentage', type: 'ratio' },
];

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AllocationInput) => void;
  editingInput: AllocationInput | null;
  allRatios: Ratio[];
  entities: Entity[];
  existingUnit?: string;
}

const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingInput,
  allRatios,
  entities,
  existingUnit,
}) => {
  const { toast } = useToast();
  
  // Form state
  const [activeTab, setActiveTab] = useState<string>('details');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [ratioId, setRatioId] = useState<number | null>(null);
  const [entityValues, setEntityValues] = useState<Record<number, string>>({});
  const [totalManualAllocation, setTotalManualAllocation] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState<Ratio | null>(null);
  
  // Helper to generate empty entity values
  const generateEmptyEntityValues = (): Record<number, string> => {
    const values: Record<number, string> = {};
    entities.forEach(entity => {
      values[entity.id] = '0';
    });
    return values;
  };
  
  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (editingInput) {
        // Editing mode - populate form with existing values
        setName(editingInput.name);
        setUnit(editingInput.unit);
        setValue(editingInput.value);
        setDescription(editingInput.description || '');
        setRatioId(editingInput.ratioId || null);
        setEntityValues({...editingInput.entityValues});
        
        // Set selected ratio - with improved debugging
        if (editingInput.ratioId) {
          const ratio = allRatios.find(r => r.id === editingInput.ratioId);
          console.log(`InputDialog - Editing input with ID: ${editingInput.id}, ratio ID: ${editingInput.ratioId}, found ratio:`, ratio ? ratio.name : 'not found');
          
          if (ratio) {
            setSelectedRatio(ratio);
          } else {
            console.warn(`InputDialog - Could not find ratio with ID: ${editingInput.ratioId}, ratioName: ${editingInput.ratioName}`);
            console.log('Available ratios:', allRatios.map(r => `${r.id}: ${r.name}`));
            setSelectedRatio(null);
          }
        } else {
          setSelectedRatio(null);
        }
      } else {
        // Adding new - reset form
        setName('');
        setUnit(existingUnit || '');
        setValue('');
        setDescription('');
        setRatioId(null);
        setEntityValues(generateEmptyEntityValues());
        setSelectedRatio(null);
      }
      // Default to first tab
      setActiveTab('details');
    }
  }, [isOpen, editingInput, existingUnit, allRatios, entities]);
  
  // Calculate total manual allocation
  useEffect(() => {
    if (!ratioId) {
      const total = Object.values(entityValues).reduce(
        (sum, val) => sum + parseFloat(val || '0'), 0
      );
      setTotalManualAllocation(total);
    }
  }, [entityValues, ratioId]);
  
  // Calculate distribution preview based on selected ratio
  const getDistributionPreview = () => {
    if (!selectedRatio || !ratioId) {
      return {};
    }
    
    const inputValueNum = parseFloat(value || '0');
    if (inputValueNum <= 0) return {};
    
    // IMPROVED GENERAL APPROACH FOR ALL RATIOS
    console.log("PREVIEW: Using improved ratio handling");
    
    // CRITICAL DEBUG: Check if the selected ratio has entityValues property 
    console.log("Selected ratio details:", {
      id: selectedRatio.id,
      name: selectedRatio.name,
      isCore: selectedRatio.isCore,
      hasEntityValues: !!selectedRatio.entityValues,
      entityValuesType: selectedRatio.entityValues ? typeof selectedRatio.entityValues : 'undefined',
      totalEntities: entities.length,
      // Log all entities and their values in this ratio
      entityValues: entities.map(entity => ({
        entityId: entity.id,
        entityName: entity.name,
        value: selectedRatio.entityValues?.[entity.id] || 0
      }))
    });
    
    // Step 1: Identify all entities that have non-zero ratios in this ratio
    const entitiesWithRatios = entities.filter(entity => 
      (selectedRatio.entityValues?.[entity.id] || 0) > 0
    );
    
    console.log(`PREVIEW: Found ${entitiesWithRatios.length} entities with non-zero ratios`);
    entitiesWithRatios.forEach(entity => {
      console.log(`- ${entity.name} (ID: ${entity.id}): ${selectedRatio.entityValues?.[entity.id] || 0}`);
    });
    
    // Step 2: Initialize distribution with zeros for all entities
    const distribution: Record<number, number> = {};
    entities.forEach(entity => {
      distribution[entity.id] = 0;
    });
    
    // Handle edge case: If no entities have ratio values, distribute evenly
    if (entitiesWithRatios.length === 0) {
      console.log("PREVIEW: No entities have ratio values, distributing evenly");
      const perEntityValue = inputValueNum / entities.length;
      entities.forEach(entity => {
        distribution[entity.id] = perEntityValue;
      });
      return distribution;
    }
    
    // Step 3: Calculate total ratio value for JUST the entities with ratios
    const totalRatioValue = entitiesWithRatios.reduce(
      (sum, entity) => sum + (selectedRatio.entityValues?.[entity.id] || 0), 
      0
    );
    
    // Step 4: Distribute to each entity with a ratio value based on their percentage of the total
    entitiesWithRatios.forEach(entity => {
      const entityRatioValue = selectedRatio.entityValues?.[entity.id] || 0;
      const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) : 0;
      distribution[entity.id] = percentage * inputValueNum;
      
      console.log(`PREVIEW: ${entity.name} gets ${(percentage * 100).toFixed(2)}% = ${distribution[entity.id].toFixed(2)}`);
    });
    
    // Debug info
    console.log('Distribution calculation:', {
      ratioId,
      ratio: selectedRatio.name,
      totalRatioValue,
      inputValue: inputValueNum,
      distribution
    });
    
    return distribution;
  };
  
  // Handle saving the input
  const handleSave = () => {
    // Validate required fields
    if (!name.trim()) {
      toast({
        title: "Input Name Required",
        description: "Please provide a name for the input.",
        variant: "destructive",
      });
      return;
    }
    
    if (!unit.trim()) {
      toast({
        title: "Unit Required",
        description: "Please provide a unit for the input values.",
        variant: "destructive",
      });
      return;
    }
    
    if (!value.trim() || isNaN(parseFloat(value))) {
      toast({
        title: "Valid Input Value Required",
        description: "Please provide a numeric value for the input.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if manual distribution adds up to total
    if (!ratioId) {
      const totalInputValue = parseFloat(value);
      // Allow some rounding error margin (0.5%)
      if (Math.abs(totalManualAllocation - totalInputValue) / totalInputValue > 0.005) {
        toast({
          title: "Allocation Mismatch",
          description: `Manual allocations (${totalManualAllocation.toFixed(2)}) don't match total value (${totalInputValue.toFixed(2)}).`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Get the selected ratio details - ONLY from derived ratios
    // This is critical - we must not look in allRatios which includes core ratios with duplicate IDs
    const derivedRatios = allRatios.filter(r => r.isCore !== true);
    const ratio = ratioId ? derivedRatios.find(r => r.id === ratioId) : undefined;
    
    // Debug logging to validate we're finding the right ratio
    if (ratioId) {
      console.log(`Looking for ratio with ID ${ratioId} in derivedRatios list with ${derivedRatios.length} items`);
      if (ratio) {
        console.log(`Found derived ratio: ${ratio.name} (${ratio.id}), isCore = ${ratio.isCore}`);
      } else {
        console.warn(`Could not find derived ratio with ID ${ratioId} in derivedRatios list`);
        
        // Check if it exists in the wrong list (core ratios) for debugging
        const coreRatio = allRatios.filter(r => r.isCore === true).find(r => r.id === ratioId);
        if (coreRatio) {
          console.error(`CRITICAL ERROR: Found matching ratio but it's a CORE ratio: ${coreRatio.name} (${coreRatio.id})`);
        }
      }
    }
    
    // Prepare a descriptive ratio name with more context
    const fullRatioName = ratio ? 
      (ratio.description ? 
        `${ratio.name} - ${ratio.description}` : 
        ratio.name) : 
      undefined;
      
    // Enhanced logging for debugging
    console.log('Saving input with ratio:', ratio ? 
      `ID: ${ratio.id}, Name: ${ratio.name}, isCore: ${ratio.isCore}` : 
      'None (manual allocation)');
    
    // If we're using a ratio, calculate the entity values based on the ratio
    let finalEntityValues = entityValues;
    
    // For ratio-based allocation, we'll set the entityValues based on the preview calculation
    if (ratioId && ratio) {
      const distribution = getDistributionPreview();
      const newEntityValues: Record<number, string> = {};
      
      entities.forEach(entity => {
        newEntityValues[entity.id] = (distribution[entity.id] || 0).toFixed(2);
      });
      
      finalEntityValues = newEntityValues;
    }
    
    // Create the input object - ensure the ratioId is the exact same object from allRatios
    const inputData: AllocationInput = {
      id: editingInput?.id || Date.now(),
      name,
      unit,
      value,
      description,
      // Only send a ratioId if we have a proper ratio selected
      ratioId: ratio ? ratio.id : undefined,
      ratioName: fullRatioName,
      entityValues: finalEntityValues
    };
    
    // Log what we're saving
    console.log('Saving input data:', inputData);
    
    // Pass to parent
    onSave(inputData);
    onClose();
  };
  
  // Handle manual entity value changes
  const handleEntityValueChange = (entityId: number, newValue: string) => {
    setEntityValues(prev => ({
      ...prev,
      [entityId]: newValue
    }));
  };
  
  // Calculate percentage from value
  const getPercentage = (entityId: number): number => {
    const totalValue = parseFloat(value || '0');
    if (totalValue <= 0) return 0;
    
    const entityValue = parseFloat(entityValues[entityId] || '0');
    return (entityValue / totalValue) * 100;
  };
  
  // Format percentage for display
  const formatPercentage = (percent: number): string => {
    return `${percent.toFixed(2)}%`;
  };
  
  // Auto-distribute evenly
  const distributeEvenly = () => {
    const totalValue = parseFloat(value || '0');
    if (totalValue <= 0 || entities.length === 0) return;
    
    const perEntityValue = totalValue / entities.length;
    const newValues: Record<number, string> = {};
    
    entities.forEach(entity => {
      newValues[entity.id] = perEntityValue.toFixed(2);
    });
    
    setEntityValues(newValues);
  };
  
  // Auto-distribute proportionally based on a selected ratio
  const distributeProportionally = (targetRatioId: number) => {
    // IMPROVED: Look in ALL ratios, not just derived ones
    const targetRatio = allRatios.find(r => r.id === targetRatioId);
    
    if (!targetRatio) {
      console.warn(`Could not find ratio with ID ${targetRatioId} in allRatios for proportional distribution`);
      return;
    }
    
    console.log("🔄 DISTRIBUTING PROPORTIONALLY using ratio:", {
      id: targetRatio.id,
      name: targetRatio.name, 
      isCore: targetRatio.isCore,
      entityValues: targetRatio.entityValues
    });
    
    const totalValue = parseFloat(value || '0');
    if (totalValue <= 0) {
      console.warn("Cannot distribute - total value is zero or negative");
      return;
    }
    
    // Find entities with non-zero ratio values
    const entitiesWithRatios = entities.filter(entity => 
      (targetRatio.entityValues?.[entity.id] || 0) > 0
    );
    
    console.log(`Found ${entitiesWithRatios.length} entities with non-zero ratios`);
    entitiesWithRatios.forEach(entity => {
      console.log(`- ${entity.name} (ID: ${entity.id}): ${targetRatio.entityValues?.[entity.id] || 0}`);
    });
    
    // Calculate total ratio value of participating entities
    const totalRatioValue = entitiesWithRatios.reduce(
      (sum, entity) => sum + (targetRatio.entityValues?.[entity.id] || 0),
      0
    );
    
    console.log(`Total ratio value: ${totalRatioValue}`);
    
    // Initialize new values with zeros
    const newValues: Record<number, string> = {};
    entities.forEach(entity => {
      newValues[entity.id] = "0.00";
    });
    
    // No special case needed - let's handle distribution consistently based on ratio values
    // If there are no valid ratios, distribute evenly
    if (totalRatioValue <= 0 || entitiesWithRatios.length === 0) {
      console.warn("No valid ratio values found, distributing evenly");
      const perEntityValue = totalValue / entities.length;
      entities.forEach(entity => {
        newValues[entity.id] = perEntityValue.toFixed(2);
      });
    } else {
      // Calculate proportional values for entities with ratio values
      entitiesWithRatios.forEach(entity => {
        const entityRatioValue = targetRatio.entityValues?.[entity.id] || 0;
        const percentage = (entityRatioValue / totalRatioValue);
        const allocatedValue = percentage * totalValue;
        newValues[entity.id] = allocatedValue.toFixed(2);
        
        console.log(`${entity.name}: ${entityRatioValue} / ${totalRatioValue} = ${percentage.toFixed(4)} * ${totalValue} = ${allocatedValue.toFixed(2)}`);
      });
    }
    
    console.log("Setting entity values:", newValues);
    setEntityValues(newValues);
  };
  
  // Group ratios by type for easier selection and log IDs for debugging
  // IMPORTANT: We ONLY work with derived ratios now to avoid ID conflicts
  // Completely filter out core ratios to prevent selection issues
  const derivedRatios = allRatios.filter(r => r.isCore !== true);
  
  // Log derived ratios with their IDs for easier debugging
  console.log("DERIVED RATIOS AVAILABLE FOR SELECTION:");
  derivedRatios.forEach(r => {
    console.log(`  ID: ${r.id}, Name: ${r.name}, Description: ${r.description || 'N/A'}`);
  });
  
  // Debug: Log all ratio IDs to check for duplicates
  console.log("ALL RATIO IDS:");
  const allIds = allRatios.map(r => r.id);
  console.log(allIds);
  
  // Check for duplicate IDs
  const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.error("DUPLICATE RATIO IDs FOUND:", duplicateIds);
    console.error("RATIOS WITH DUPLICATE IDS:");
    duplicateIds.forEach(id => {
      const matches = allRatios.filter(r => r.id === id);
      console.error(`ID ${id} appears in ratios:`, matches.map(r => `${r.name} (isCore: ${r.isCore})`));
    });
  }
  
  // Calculate distribution preview
  const distribution = getDistributionPreview();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingInput ? 'Edit Input' : 'Add New Input'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="details">Input Details</TabsTrigger>
              <TabsTrigger value="allocation">Allocation Method</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="details" className="mt-0 h-full">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-name">Input Name</Label>
                    <Input 
                      id="input-name" 
                      value={name} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      placeholder="e.g., Security Contract, Cleaning Staff"
                    />
                    <p className="text-xs text-gray-500">A descriptive name for this input</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-description">Description (Optional)</Label>
                    <Input 
                      id="input-description" 
                      value={description} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                      placeholder="Brief description of this input"
                    />
                    <p className="text-xs text-gray-500">Additional context about this input</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-value">Total Value</Label>
                    <div className="flex items-center">
                      {unit === 'AED' && <DollarSign className="h-4 w-4 mr-1 text-gray-500" />}
                      <Input 
                        id="input-value" 
                        type="number"
                        value={value} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                        placeholder="e.g., 50000"
                      />
                      {unit === 'Percentage' && <PercentIcon className="h-4 w-4 ml-1 text-gray-500" />}
                    </div>
                    <p className="text-xs text-gray-500">The total value to be allocated</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-unit">Unit</Label>
                    <Select
                      value={unit || ''}
                      onValueChange={setUnit}
                      disabled={!!existingUnit}
                    >
                      <SelectTrigger id="input-unit">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unitOption) => (
                          <SelectItem key={unitOption.value} value={unitOption.value}>
                            {unitOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {existingUnit && (
                      <p className="text-xs text-amber-500">All inputs must use the same unit</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="allocation" className="mt-0 h-full space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Ratio Name</h3>
                  <div>
                    <Select 
                      value={ratioId ? ratioId.toString() : 'manual'} 
                      onValueChange={(value) => {
                        // Enhanced logging for ratio selection debugging
                        console.log('Ratio selection changed to:', value);
                        
                        if (value === 'manual') {
                          console.log('Switching to manual distribution mode');
                          setRatioId(null);
                          setSelectedRatio(null);
                          return;
                        }
                        
                        // Skip headers
                        if (value === 'core_header' || value === 'derived_header') {
                          console.log('Header selected, ignoring');
                          return;
                        }
                        
                        // Parse ratio ID 
                        const newRatioId = parseInt(value);
                        console.log('Parsed ratio ID:', newRatioId, 'Type:', typeof newRatioId);
                        
                        // CRITICAL CHANGE: Only look for the ratio in the derivedRatios array,
                        // NOT in allRatios which includes core ratios with potentially the same IDs
                        const ratio = derivedRatios.find(r => r.id === newRatioId);
                        
                        // Additional debugging
                        console.log('Looking for ratio ONLY in derivedRatios array (not in allRatios)');
                        console.log('Found in derivedRatios?', ratio ? 'YES' : 'NO');
                        
                        if (ratio) {
                          console.log('Found matching ratio:', ratio.name, 'ID:', ratio.id, 'isCore:', ratio.isCore);
                          
                          // Update state with the found ratio
                          setRatioId(newRatioId);
                          setSelectedRatio(ratio);
                          
                          // CRITICAL FIX: After selecting a ratio, call distributeProportionally to update entity values
                          distributeProportionally(newRatioId);
                          
                          // Debug: Log all available ratios to verify the correct one was selected
                          console.log('All available ratios:');
                          allRatios.forEach(r => {
                            console.log(`  ID: ${r.id} (${typeof r.id}), Name: ${r.name}, isCore: ${r.isCore}`);
                          });
                        } else {
                          console.error('Failed to find ratio with ID:', newRatioId);
                          console.error('Available ratios:', allRatios.map(r => `${r.id}: ${r.name}`).join(', '));
                        }
                      }}
                    >
                      <SelectTrigger id="allocation-method" className="min-w-[280px]">
                        <SelectValue placeholder="Select ratio for allocation">
                          {ratioId && selectedRatio ? 
                            `${selectedRatio.name}${selectedRatio.description ? ` - ${selectedRatio.description}` : ''}` : 
                            'Manual Distribution'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectItem value="manual">Manual Distribution</SelectItem>
                        
                        {/* Derived & Custom Ratios Only */}
                        {derivedRatios.length > 0 && (
                          <>
                            {/* Use a div instead of SelectItem for headers to avoid empty string value errors */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              --- Available Ratio Names ---
                            </div>
                            {derivedRatios.map(ratio => (
                              <SelectItem key={`derived_${ratio.id}`} value={ratio.id.toString()}>
                                {ratio.description || ratio.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!ratioId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Manual Entity Distribution</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={Math.abs(totalManualAllocation - parseFloat(value || '0')) < 0.01 ? "success" : "outline"}>
                          {Math.abs(totalManualAllocation - parseFloat(value || '0')) < 0.01 
                            ? <CheckCircle2 className="h-3 w-3 mr-1" /> 
                            : null}
                          {totalManualAllocation.toFixed(2)} / {parseFloat(value || '0').toFixed(2)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={distributeEvenly}
                            disabled={!value || parseFloat(value) <= 0}
                          >
                            Distribute Evenly
                          </Button>
                          {derivedRatios.length > 0 && (
                            <Select
                              onValueChange={(value) => distributeProportionally(parseInt(value))}
                              disabled={!value || parseFloat(value) <= 0}
                            >
                              <SelectTrigger className="h-8 text-xs w-[180px]">
                                <SelectValue placeholder="Distribute by ratio" />
                              </SelectTrigger>
                              <SelectContent>
                                {derivedRatios.map(ratio => (
                                  <SelectItem key={`distrib_${ratio.id}`} value={ratio.id.toString()}>
                                    {ratio.description || ratio.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="grid grid-cols-[1fr,120px,120px,80px] gap-2 py-2 px-4 bg-gray-50 dark:bg-gray-800 border-b">
                        <div className="text-sm font-medium">Entity</div>
                        <div className="text-sm font-medium text-right">Amount</div>
                        <div className="text-sm font-medium text-right">Percentage</div>
                        <div className="text-sm font-medium text-center"></div>
                      </div>
                      <div className="divide-y max-h-[280px] overflow-y-auto">
                        {entities.map(entity => {
                          const percentage = getPercentage(entity.id);
                          
                          return (
                            <div key={entity.id} className="grid grid-cols-[1fr,120px,120px,80px] gap-2 py-2 px-4 items-center">
                              <div className="text-sm font-medium">{entity.name}</div>
                              <div>
                                <Input
                                  type="number"
                                  value={entityValues[entity.id] || '0'}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEntityValueChange(entity.id, e.target.value)}
                                  className="h-8 text-right"
                                />
                              </div>
                              <div className="text-right text-sm">{formatPercentage(percentage)}</div>
                              <div className="flex justify-center">
                                <Slider 
                                  defaultValue={[0]} 
                                  value={[percentage]} 
                                  max={100}
                                  step={0.1}
                                  onValueChange={([val]) => {
                                    const inputVal = parseFloat(value || '0');
                                    if (inputVal > 0) {
                                      const newVal = (val / 100) * inputVal;
                                      handleEntityValueChange(entity.id, newVal.toFixed(2));
                                    }
                                  }}
                                  className="w-16"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Using <strong>{selectedRatio?.description || selectedRatio?.name}</strong> for distribution. Values will be allocated 
                      proportionally based on each entity's ratio value.
                    </p>
                    
                    {selectedRatio && (
                      <div className="border rounded-md bg-white dark:bg-gray-900">
                        <div className="grid grid-cols-[1fr,100px,100px,100px] gap-4 py-2 px-4 bg-gray-50 dark:bg-gray-800 border-b">
                          <div className="text-sm font-medium">Entity</div>
                          <div className="text-sm font-medium text-right">Ratio Value</div>
                          <div className="text-sm font-medium text-right">Percentage</div>
                          <div className="text-sm font-medium text-right">Allocation</div>
                        </div>
                        <div className="divide-y max-h-[280px] overflow-y-auto">
                          {entities.map(entity => {
                            // Get entity ratio value - ensure this is displayed correctly
                            const entityRatioValue = selectedRatio?.entityValues?.[entity.id] || 0;
                            
                            // Explicitly calculate total ratio value from all entities to ensure we have a value
                            let totalRatioValue = 0;
                            entities.forEach(e => {
                              totalRatioValue += (selectedRatio?.entityValues?.[e.id] || 0);
                            });
                            
                            console.log(`Entity ${entity.name} ratio value: ${entityRatioValue}, total ratio value: ${totalRatioValue}`);
                            
                            // Calculate percentage of the total based on entity values
                            let percentage = 0;
                            let allocatedAmount = 0;
                            const inputValueNum = parseFloat(value || '0');
                            
                            // Calculate percentage based on ratio values
                            percentage = totalRatioValue > 0 
                              ? (entityRatioValue / totalRatioValue) * 100 
                              : 0;
                            allocatedAmount = percentage * inputValueNum / 100;
                            
                            // Log for debugging
                            console.log(`Entity ${entity.name} has ${percentage.toFixed(2)}% allocation = ${allocatedAmount.toFixed(2)}`);
                            
                            
                            return (
                              <div key={entity.id} className="grid grid-cols-[1fr,100px,100px,100px] gap-4 py-2 px-4">
                                <div className="text-sm">{entity.name}</div>
                                <div className="text-right text-sm">
                                  {entityRatioValue.toFixed(2)}
                                </div>
                                <div className="text-right text-sm">
                                  {formatPercentage(percentage)}
                                </div>
                                <div className="text-right text-sm font-medium">
                                  {allocatedAmount.toFixed(2)} {unit}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            

          </div>
        </Tabs>
        
        {/* Footer */}
        <div className="flex justify-end items-center gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {editingInput !== null ? 'Update Input' : 'Add Input'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputDialog;
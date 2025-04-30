import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, Plus, Edit, Trash2, Info, DollarSign, PieChart, Layers } from 'lucide-react';
import InputDialog from './InputDialog';

// Types for entities and allocation
export interface Entity {
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

export interface Ratio {
  id: number;
  name: string;
  description?: string;
  ratioType?: string;
  isCore?: boolean;
  unitOfMeasurement?: string;
  entityValues?: Record<number, number>; // Entity ID to ratio value
}

export interface AllocationInput {
  id: number;
  name: string;
  unit: string;
  value: string; // Total value for this input (e.g., "50000" AED for Security Contract)
  description?: string;
  ratioId?: number; // Ratio used for distribution 
  ratioName?: string;
  entityValues: Record<number, string>; // Entity ID to allocated value
  percentages?: Record<number, number>; // Calculated percentages
}

export interface BudgetItemAllocation {
  budgetItemId: number;
  budgetValue?: string;
  allocationInputs: AllocationInput[];
  notes?: string;
}

type BudgetItemAllocationNewProps = {
  projectId: number | null;
  budgetItemId: number | null;
  budgetItem: {
    id: number;
    code: string;
    description: string;
    category: string;
    subCategory: string;
    budgetValue?: string;
  } | null;
  entities: Entity[];
  coreRatios: Ratio[];
  derivedRatios: Ratio[];
  currentAllocation: BudgetItemAllocation | undefined;
  onAllocationChange: (updatedAllocation: BudgetItemAllocation) => void;
};

export const BudgetItemAllocationNew: React.FC<BudgetItemAllocationNewProps> = ({
  projectId,
  budgetItemId,
  budgetItem,
  entities,
  coreRatios,
  derivedRatios,
  currentAllocation,
  onAllocationChange,
}) => {
  const { toast } = useToast();
  
  // Local state for allocation
  const [allocation, setAllocation] = useState<BudgetItemAllocation>(
    currentAllocation || { 
      budgetItemId: budgetItemId || 0, 
      allocationInputs: [],
      budgetValue: budgetItem?.budgetValue || ''
    }
  );
  
  // Input dialog state
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [editingInputId, setEditingInputId] = useState<number | null>(null);
  
  // Input form state
  const [inputName, setInputName] = useState('');
  const [inputUnit, setInputUnit] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputRatioId, setInputRatioId] = useState<number | null>(null);
  const [inputEntityValues, setInputEntityValues] = useState<Record<number, string>>({});
  
  // Utility function to ensure each ratio has a stable, unique ID
  const ensureRatioIds = (ratios: Ratio[]): Ratio[] => {
    // Create a copy of ratios with guaranteed unique IDs
    return ratios.map((ratio, index) => {
      // If ratio already has an ID, use it; otherwise generate one based on index
      // We use a large number as base to avoid collisions with real IDs
      const stableId = ratio.id || (1000000 + index);
      return {
        ...ratio,
        id: stableId,
        // Ensure the entityValues object exists
        entityValues: ratio.entityValues || {}
      };
    });
  };
  
  // All available ratios (core + derived) with guaranteed unique IDs
  const processedCoreRatios = ensureRatioIds(coreRatios);
  const processedDerivedRatios = ensureRatioIds(derivedRatios);
  const allRatios = [...processedCoreRatios, ...processedDerivedRatios];
  
  // Initialize or update local state when props change
  useEffect(() => {
    if (currentAllocation) {
      setAllocation(currentAllocation);
    } else if (budgetItemId && budgetItem) {
      // Initialize with empty allocation
      setAllocation({
        budgetItemId: budgetItemId,
        budgetValue: budgetItem.budgetValue || '',
        allocationInputs: []
      });
    }
  }, [currentAllocation, budgetItemId, budgetItem]);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Predefined list of units
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
  
  // Format value based on unit
  const formatValueWithUnit = (amount: number, unit: string): string => {
    if (unit.toLowerCase() === 'aed') {
      return formatCurrency(amount);
    } else {
      return `${amount.toFixed(2)} ${unit}`;
    }
  };
  
  // Helper to get the total amount of all inputs
  const getTotalInputsAmount = (): number => {
    return allocation.allocationInputs.reduce((sum, input) => {
      return sum + parseFloat(input.value || '0');
    }, 0);
  };
  
  // Get the total budget value
  const getBudgetValue = (): number => {
    return parseFloat(allocation.budgetValue || budgetItem?.budgetValue || '0');
  };
  
  // Calculate the distribution of an input value to each entity based on the input's ratio
  const calculateEntityDistribution = (input: AllocationInput): Record<number, number> => {
    const distribution: Record<number, number> = {};
    const inputValue = parseFloat(input.value || '0');
    
    // Initialize all entities to zero
    entities.forEach(entity => {
      distribution[entity.id] = 0;
    });
    
    // If this input uses a ratio for distribution
    if (input.ratioId) {
      console.log(`🔍 Distribution for input: "${input.name}" (${inputValue} ${input.unit}) using ratio ID: ${input.ratioId}`);
      
      // Look in ALL ratios to find the matching one
      const ratio = allRatios.find(r => r.id === input.ratioId);
      
      // If we found the ratio and it has entity values
      if (ratio && ratio.entityValues) {
        console.log(`Found ratio: "${ratio.name}" with ${Object.keys(ratio.entityValues).length} entity values`);
        
        // Identify entities that have non-zero values in this ratio
        const entitiesWithRatios = entities.filter(entity => 
          (ratio.entityValues?.[entity.id] || 0) > 0
        );
        
        // If no entities have ratio values, distribute evenly
        if (entitiesWithRatios.length === 0) {
          console.log("No entities have ratio values, distributing evenly");
          const perEntityValue = inputValue / entities.length;
          entities.forEach(entity => {
            distribution[entity.id] = Math.round(perEntityValue * 100) / 100;
          });
        } 
        // If we have entities with ratio values, distribute proportionally
        else {
          // Calculate total ratio value across participating entities
          const totalRatioValue = entitiesWithRatios.reduce(
            (sum, entity) => sum + (ratio.entityValues?.[entity.id] || 0), 
            0
          );
          
          // Two-pass distribution to handle rounding errors
          let totalDistributed = 0;
          
          // First pass - distribute to all but last entity
          for (let i = 0; i < entitiesWithRatios.length - 1; i++) {
            const entity = entitiesWithRatios[i];
            const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
            const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) : 0;
            const value = Math.round((percentage * inputValue) * 100) / 100;
            
            distribution[entity.id] = value;
            totalDistributed += value;
            
            console.log(`${entity.name}: ${(percentage * 100).toFixed(2)}% = ${value}`);
          }
          
          // Last entity gets remainder to ensure total matches input exactly
          if (entitiesWithRatios.length > 0) {
            const lastEntity = entitiesWithRatios[entitiesWithRatios.length - 1];
            const lastValue = Math.round((inputValue - totalDistributed) * 100) / 100;
            distribution[lastEntity.id] = lastValue;
            
            // For logging
            const entityRatioValue = ratio.entityValues?.[lastEntity.id] || 0;
            const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) : 0;
            console.log(`${lastEntity.name}: ${(percentage * 100).toFixed(2)}% = ${lastValue} (adjusted)`);
          }
        }
      } 
      // If ratio not found or has no entity values, fall back to suit area 
      else {
        console.warn(`⚠️ Ratio not found or missing entity values, falling back to Suit Area`);
        const totalArea = entities.reduce((sum, entity) => sum + parseFloat(entity.suitArea || '0'), 0);
        
        // Two-pass calculation for suit area
        let distributed = 0;
        
        // First pass for all but last entity
        for (let i = 0; i < entities.length - 1; i++) {
          const entity = entities[i];
          const entityArea = parseFloat(entity.suitArea || '0');
          const percentage = totalArea > 0 ? (entityArea / totalArea) : 0;
          const value = Math.round((percentage * inputValue) * 100) / 100;
          
          distribution[entity.id] = value;
          distributed += value;
        }
        
        // Last entity gets remainder 
        if (entities.length > 0) {
          const lastEntity = entities[entities.length - 1];
          distribution[lastEntity.id] = Math.round((inputValue - distributed) * 100) / 100;
        }
      }
    } 
    // If no ratio specified, use the manually entered entity values
    else {
      console.log('Using manually entered values for distribution');
      
      // Calculate total of manually entered values
      let totalManual = 0;
      entities.forEach(entity => {
        totalManual += parseFloat(input.entityValues[entity.id] || '0');
      });
      
      // If manual values need scaling to match input value
      if (Math.abs(totalManual - inputValue) > 0.01 && totalManual > 0) {
        const scaleFactor = inputValue / totalManual;
        console.log(`Scaling manual values by ${scaleFactor.toFixed(4)}`);
        
        // Two-pass calculation 
        let totalDistributed = 0;
        
        // First pass for all but last entity
        for (let i = 0; i < entities.length - 1; i++) {
          const entity = entities[i];
          const origValue = parseFloat(input.entityValues[entity.id] || '0');
          const value = Math.round((origValue * scaleFactor) * 100) / 100;
          
          distribution[entity.id] = value;
          totalDistributed += value;
        }
        
        // Last entity gets remainder
        if (entities.length > 0) {
          const lastEntity = entities[entities.length - 1];
          distribution[lastEntity.id] = Math.round((inputValue - totalDistributed) * 100) / 100;
        }
      } 
      // If manual values already match input, use them directly
      else {
        entities.forEach(entity => {
          distribution[entity.id] = parseFloat(input.entityValues[entity.id] || '0');
        });
      }
    }
    
    // Verify the total matches the input value
    const totalAllocated = Object.values(distribution).reduce((sum, value) => sum + value, 0);
    if (Math.abs(totalAllocated - inputValue) > 0.01) {
      console.warn(`⚠️ Distribution total (${totalAllocated}) doesn't match input (${inputValue})`);
    }
    
    return distribution;
  };
  
  // Calculate percentage of total budget for each entity
  const calculateEntityPercentages = (entityDistribution: Record<number, number>, totalValue: number): Record<number, number> => {
    const percentages: Record<number, number> = {};
    
    // Calculate the total of all entity values first
    const totalEntityValues = Object.values(entityDistribution).reduce((sum, value) => sum + value, 0);
    
    Object.entries(entityDistribution).forEach(([entityId, value]) => {
      const numericId = parseInt(entityId);
      // If we have a total value, use that, otherwise calculate percentage from entity distribution
      percentages[numericId] = totalValue > 0 
        ? (value / totalValue) * 100 
        : totalEntityValues > 0 
          ? (value / totalEntityValues) * 100 
          : 0;
    });
    
    return percentages;
  };
  
  // Calculate total allocation for each entity across all inputs
  const calculateTotalEntityAllocation = (entityId: number): { 
    amount: number; 
    percentage: number; 
    distributionPercentage: number;
    budgetAmount: number;
    // Track allocations by unit for proper display
    amountsByUnit: Record<string, number>;
  } => {
    let totalAmount = 0;
    const totalBudget = getBudgetValue();
    const amountsByUnit: Record<string, number> = {};
    
    allocation.allocationInputs.forEach(input => {
      const distribution = calculateEntityDistribution(input);
      const entityValue = distribution[entityId] || 0;
      totalAmount += entityValue;
      
      // Track values by unit for display purposes
      const unit = input.unit || 'AED';
      if (!amountsByUnit[unit]) {
        amountsByUnit[unit] = 0;
      }
      amountsByUnit[unit] += entityValue;
    });
    
    // Get the total amount for all entities to calculate percentages
    let totalForAllEntities = 0;
    entities.forEach(entity => {
      let entityTotal = 0;
      allocation.allocationInputs.forEach(input => {
        const distribution = calculateEntityDistribution(input);
        entityTotal += distribution[entity.id] || 0;
      });
      totalForAllEntities += entityTotal;
    });
    
    // Calculate distribution percentage based on total allocated amount
    const distributionPercentage = totalForAllEntities > 0 
      ? (totalAmount / totalForAllEntities) * 100 
      : 0;
      
    // Calculate percentage of budget (which may be different from distribution percentage)
    const percentage = totalBudget > 0 
      ? (totalAmount / totalBudget) * 100 
      : distributionPercentage;
    
    // Calculate what this would be in terms of budget amount
    const budgetAmount = totalBudget > 0 
      ? (distributionPercentage / 100) * totalBudget 
      : totalAmount;
    
    return { 
      amount: totalAmount, 
      percentage, 
      distributionPercentage,
      budgetAmount,
      amountsByUnit
    };
  };
  
  // Handle editing an input
  const handleEditInput = (input: AllocationInput) => {
    setEditingInputId(input.id);
    setInputName(input.name);
    setInputUnit(input.unit);
    setInputValue(input.value);
    setInputDescription(input.description || '');
    
    // Clear logs to see what ratio we're setting
    console.log('Editing input with ratio ID:', input.ratioId, 'Ratio name:', input.ratioName);
    
    // Set the ratio ID and check if we can find the corresponding ratio
    const ratioId = input.ratioId || null;
    setInputRatioId(ratioId);
    
    if (ratioId) {
      // IMPORTANT: Only consider derived ratios for matching
      const derivedRatios = allRatios.filter(r => r.isCore !== true);
      const selectedRatio = derivedRatios.find(r => r.id === ratioId);
      console.log('Found ratio for editing in derived ratios:', selectedRatio);
      
      // If we can't find it in derived ratios, check for a core ratio with the same ID
      // (just for debugging - we won't use core ratios)
      if (!selectedRatio) {
        const coreRatios = allRatios.filter(r => r.isCore === true);
        const coreRatio = coreRatios.find(r => r.id === ratioId);
        
        if (coreRatio) {
          console.warn(`WARNING: Found a CORE ratio "${coreRatio.name}" with matching ID ${ratioId} - will not be used`);
        } else if (input.ratioName) {
          console.warn(`Could not find any ratio with ID ${ratioId} for name ${input.ratioName}`);
        }
      }
    }
    
    setInputEntityValues({...input.entityValues});
    setInputDialogOpen(true);
  };
  
  // Handle deleting an input
  const handleDeleteInput = (inputId: number) => {
    const updatedInputs = allocation.allocationInputs.filter(input => input.id !== inputId);
    
    const updatedAllocation = {
      ...allocation,
      allocationInputs: updatedInputs
    };
    
    setAllocation(updatedAllocation);
    onAllocationChange(updatedAllocation);
    
    toast({
      title: "Input Removed",
      description: "The input has been removed from the allocation.",
    });
  };
  
  // Handle saving an input with our new InputDialog component
  const handleSaveInput = (input: AllocationInput) => {
    // Create updated inputs list
    let updatedInputs: AllocationInput[];
    
    if (editingInputId !== null) {
      updatedInputs = allocation.allocationInputs.map(existingInput => 
        existingInput.id === editingInputId ? input : existingInput
      );
    } else {
      updatedInputs = [...allocation.allocationInputs, input];
    }
    
    // Update allocation
    const updatedAllocation = {
      ...allocation,
      allocationInputs: updatedInputs
    };
    
    // Update state and notify parent
    setAllocation(updatedAllocation);
    onAllocationChange(updatedAllocation);
    
    // Reset editing state
    setEditingInputId(null);
    
    // Show success toast
    toast({
      title: editingInputId !== null ? "Input Updated" : "Input Added",
      description: `${input.name} has been ${editingInputId !== null ? "updated" : "added"} successfully.`,
    });
  };
  
  // Update notes
  const handleNotesChange = (notes: string) => {
    const updatedAllocation = {
      ...allocation,
      notes
    };
    
    setAllocation(updatedAllocation);
    onAllocationChange(updatedAllocation);
  };
  
  // Update budget value
  const handleBudgetValueChange = (budgetValue: string) => {
    if (budgetValue && isNaN(parseFloat(budgetValue))) {
      return;
    }
    
    const updatedAllocation = {
      ...allocation,
      budgetValue
    };
    
    setAllocation(updatedAllocation);
    onAllocationChange(updatedAllocation);
  };
  
  // Check if allocation is complete
  const isAllocationComplete = (): boolean => {
    if (!allocation.allocationInputs || allocation.allocationInputs.length === 0) {
      return false;
    }
    
    const totalInputsAmount = getTotalInputsAmount();
    const budgetValue = getBudgetValue();
    
    // If no budget value is set, consider it complete if we have valid inputs
    if (budgetValue <= 0) {
      return allocation.allocationInputs.length > 0 && totalInputsAmount > 0;
    }
    
    // Otherwise, consider it complete if total inputs are within 2% of the budget value
    return Math.abs(totalInputsAmount - budgetValue) / budgetValue < 0.02;
  };
  
  // Get the total entity percentages to ensure they sum to 100%
  const getTotalEntityPercentage = (): number => {
    if (!entities.length) return 0;
    
    return entities.reduce((sum, entity) => {
      const { percentage } = calculateTotalEntityAllocation(entity.id);
      return sum + percentage;
    }, 0);
  };
  
  // Generate empty entity values for all entities
  const generateEmptyEntityValues = (): Record<number, string> => {
    const values: Record<number, string> = {};
    entities.forEach(entity => {
      values[entity.id] = '0';
    });
    return values;
  };
  
  if (!budgetItem) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Select a budget item to manage allocation.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Budget Item Details */}
      <Card className="w-full max-w-none overflow-visible">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{budgetItem.code}</span>
                <Badge variant="outline" className="ml-2">
                  {budgetItem.category}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">{budgetItem.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm text-gray-500">Budget Value</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <Input
                    type="text"
                    value={allocation.budgetValue || ''}
                    onChange={(e) => handleBudgetValueChange(e.target.value)}
                    className="w-32 h-8 text-green-600 font-medium"
                    placeholder="Enter value"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Input Management */}
      <Card className="w-full max-w-none overflow-visible">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Allocation Inputs</CardTitle>
            <Button 
              onClick={() => {
                setEditingInputId(null);
                setInputDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Input
            </Button>
            
            {/* Use our rebuilt InputDialog component with consistently processed ratios */}
            <InputDialog 
              isOpen={inputDialogOpen}
              onClose={() => setInputDialogOpen(false)}
              onSave={handleSaveInput}
              editingInput={editingInputId !== null ? 
                allocation.allocationInputs.find(input => input.id === editingInputId) || null : 
                null
              }
              allRatios={allRatios}
              entities={entities}
              existingUnit={allocation.allocationInputs.length > 0 ? allocation.allocationInputs[0].unit : undefined}
            />
          </div>
        </CardHeader>
        <CardContent>
          {allocation.allocationInputs.length === 0 ? (
            <div className="border rounded-md p-6 text-center">
              <p className="text-sm text-gray-500">No inputs added yet. Click "Add Input" to begin allocating costs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allocation.allocationInputs.map(input => {
                // Find the ratio used for distribution, but ONLY from derived ratios
                const derivedRatios = allRatios.filter(r => r.isCore !== true);
                
                // CRITICAL DEBUG: Log all available derived ratios 
                console.log("AVAILABLE DERIVED RATIOS:", derivedRatios.map(r => ({
                  id: r.id,
                  name: r.name,
                  isCore: r.isCore,
                  entityValues: r.entityValues ? Object.keys(r.entityValues).length : 'None',
                  entityValuesExample: r.entityValues ? Object.entries(r.entityValues).slice(0, 2) : 'None'
                })));
                console.log(`Looking for ratio with ID ${input.ratioId} from input: ${input.name}`);
                
                const selectedRatio = input.ratioId ? derivedRatios.find(r => r.id === input.ratioId) : undefined;
                
                // Enhanced debugging for ratio lookup
                if (input.ratioId) {
                  if (selectedRatio) {
                    console.log("FOUND RATIO:", {
                      id: selectedRatio.id,
                      name: selectedRatio.name,
                      isCore: selectedRatio.isCore,
                      description: selectedRatio.description,
                      hasEntityValues: !!selectedRatio.entityValues,
                      entityValuesType: selectedRatio.entityValues ? typeof selectedRatio.entityValues : 'undefined',
                      entityValues: selectedRatio.entityValues ? 
                        Object.entries(selectedRatio.entityValues).map(([entityId, value]) => 
                          `Entity ${entityId}: ${value}`
                        ) : 'No entity values'
                    });
                    
                    // Check if any entity has a non-zero value
                    if (selectedRatio.entityValues) {
                      const hasNonZeroValues = Object.values(selectedRatio.entityValues).some(val => (val as number) > 0);
                      if (!hasNonZeroValues) {
                        console.error("❌ CRITICAL ERROR: Ratio has all zero values for entities!");
                      }
                    } else {
                      console.error("❌ CRITICAL ERROR: Ratio has no entityValues property!");
                    }
                  } else {
                    console.warn(`Could not find ratio with ID: ${input.ratioId} - using fallback to ratio name: ${input.ratioName}`);
                    
                    // Check ALL ratios, not just derived ones
                    const anyRatio = allRatios.find(r => r.id === input.ratioId);
                    if (anyRatio) {
                      console.error(`❌ Found ratio but it was filtered out: ID ${anyRatio.id}, Name: ${anyRatio.name}, isCore: ${anyRatio.isCore}`);
                    }
                  }
                }
                
                // Calculate distribution for this input
                const entityDistribution = calculateEntityDistribution(input);
                const totalInputValue = Object.values(entityDistribution).reduce((sum, value) => sum + value, 0);
                
                return (
                  <Card key={input.id} className="overflow-hidden w-full max-w-none">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base">{input.name}</CardTitle>
                          {input.description && (
                            <CardDescription>{input.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                Visualize
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Budget Item Allocation Visualization</DialogTitle>
                                <DialogDescription>
                                  Visual representation of how the budget item is allocated across entities.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="relative h-[300px] w-full p-4">
                                {/* Simple SVG-based visualization */}
                                <svg width="100%" height="100%" viewBox="0 0 400 300">
                                  {/* Create circles representing each entity's share */}
                                  {entities.map((entity, index) => {
                                    const { percentage } = calculateTotalEntityAllocation(entity.id);
                                    
                                    // Calculate circle size based on percentage
                                    const radius = Math.max(20, Math.sqrt(percentage) * 10);
                                    
                                    // Position circles in a ring
                                    const totalEntities = entities.length;
                                    const angle = (2 * Math.PI * index) / totalEntities;
                                    const centerX = 200;
                                    const centerY = 150;
                                    const orbitRadius = 80; // Distance from center
                                    
                                    const x = centerX + orbitRadius * Math.cos(angle);
                                    const y = centerY + orbitRadius * Math.sin(angle);
                                    
                                    return (
                                      <g key={entity.id}>
                                        <circle
                                          cx={x}
                                          cy={y}
                                          r={radius}
                                          fill={entity.color || `hsl(${(index * 360) / totalEntities}, 70%, 80%)`}
                                          stroke={entity.color ? `darken(${entity.color}, 20%)` : `hsl(${(index * 360) / totalEntities}, 70%, 60%)`}
                                          strokeWidth="2"
                                          opacity="0.8"
                                        />
                                        <text
                                          x={x}
                                          y={y}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                          fontSize="10"
                                          fontWeight="bold"
                                        >
                                          {entity.name}
                                        </text>
                                        <text
                                          x={x}
                                          y={y + 15}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                          fontSize="9"
                                          fill="#444"
                                        >
                                          {percentage.toFixed(1)}%
                                        </text>
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                              
                              <div className="mt-4 text-sm">
                                <h4 className="font-medium mb-2">Allocation Breakdown</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {entities.map(entity => {
                                    const { percentage, amountsByUnit } = calculateTotalEntityAllocation(entity.id);
                                    
                                    return (
                                      <div key={entity.id} className="p-2 border rounded-md">
                                        <div className="font-medium">{entity.name}</div>
                                        <div className="text-sm text-gray-500">
                                          {Object.entries(amountsByUnit).length > 0 && 
                                            <div>
                                              {formatValueWithUnit(
                                                Number(Object.values(amountsByUnit)[0]), 
                                                Object.keys(amountsByUnit)[0]
                                              )} · {percentage.toFixed(1)}%
                                            </div>
                                          }
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleEditInput(input)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleDeleteInput(input.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-0 py-0">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">Input Value</th>
                              <th className="p-2 text-center font-medium text-gray-500">Unit</th>
                              <th className="p-2 text-center font-medium text-gray-500">Distribution Ratio</th>
                              {entities.map(entity => (
                                <th key={entity.id} className="p-2 text-center font-medium text-gray-500">{entity.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-4 py-3 font-medium">
                                {totalInputValue.toFixed(2)}
                              </td>
                              <td className="p-2 text-center">{input.unit}</td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className={`px-2 py-1 rounded-full text-xs ${
                                    input.ratioId && selectedRatio 
                                      ? selectedRatio.isCore === false
                                        ? 'bg-indigo-100 text-indigo-800' // Derived ratios: indigo
                                        : 'bg-blue-100 text-blue-800'     // Standard ratios: blue
                                      : 'bg-gray-100 text-gray-800'       // Manual: gray
                                  }`}>
                                    {input.ratioId && selectedRatio ? 
                                      // Display the stored ratioName (which now includes description) or fallback to ratio.name
                                      (input.ratioName || selectedRatio.name) : 
                                      'Manual'}
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditInput(input)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              {entities.map(entity => {
                                const value = entityDistribution[entity.id] || 0;
                                const percentage = totalInputValue > 0 
                                  ? (value / totalInputValue) * 100 
                                  : 0;
                                
                                return (
                                  <td key={entity.id} className="p-2 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-medium">{value.toFixed(2)} {input.unit}</span>
                                      <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Allocation Summary */}
              <Card className="w-full max-w-none overflow-visible">
                <CardHeader>
                  <CardTitle className="text-base">Input Allocation Summary</CardTitle>
                  <CardDescription>
                    Distribution of actual input values across entities
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 py-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Entity</th>
                          <th className="p-2 text-center font-medium text-gray-500">Allocated Value</th>
                          <th className="p-2 text-center font-medium text-gray-500">Distribution %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entities.map(entity => {
                          const { distributionPercentage, amountsByUnit } = calculateTotalEntityAllocation(entity.id);
                          
                          return (
                            <tr key={entity.id} className="border-t">
                              <td className="px-4 py-3 font-medium">{entity.name}</td>
                              <td className="p-2 text-center">
                                {/* Since we enforce a single unit, we can use the first unit key */}
                                {Object.entries(amountsByUnit).length > 0 && 
                                  formatValueWithUnit(
                                    Number(Object.values(amountsByUnit)[0]), 
                                    Object.keys(amountsByUnit)[0]
                                  )
                                }
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Progress value={distributionPercentage} className="h-2 w-20" />
                                  <span>{distributionPercentage.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t bg-gray-50">
                          <td className="px-4 py-3 font-medium">Total</td>
                          <td className="p-2 text-center font-medium">
                            {/* Display total in the single unit being used */}
                            {allocation.allocationInputs.length > 0 && 
                              formatValueWithUnit(
                                getTotalInputsAmount(),
                                allocation.allocationInputs[0].unit || 'AED'
                              )
                            }
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Progress 
                                value={getTotalEntityPercentage()} 
                                className="h-2 w-20" 
                              />
                              <span>{getTotalEntityPercentage().toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="border-t mt-2 flex justify-between">
                  <div className="flex items-center">
                    <div className={`flex items-center gap-1 ${
                      isAllocationComplete() ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {isAllocationComplete() ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {isAllocationComplete() 
                          ? 'Allocation complete' 
                          : allocation.allocationInputs.length === 0
                            ? 'Add inputs to start allocation'
                            : 'Allocation in progress'}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Budget Split Card - Only shown when budget is available */}
              {getBudgetValue() > 0 && (
                <Card className="w-full max-w-none overflow-visible">
                  <CardHeader>
                    <CardTitle className="text-base">Budget Split</CardTitle>
                    <CardDescription>
                      Budget allocation based on distribution percentages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 py-0">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-sm min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Entity</th>
                            <th className="p-2 text-center font-medium text-gray-500">Distribution %</th>
                            <th className="p-2 text-center font-medium text-gray-500">Budget Allocation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entities.map(entity => {
                            const { distributionPercentage, budgetAmount } = calculateTotalEntityAllocation(entity.id);
                            
                            return (
                              <tr key={entity.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{entity.name}</td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Progress value={distributionPercentage} className="h-2 w-20" />
                                    <span>{distributionPercentage.toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td className="p-2 text-center font-medium">{formatCurrency(budgetAmount)}</td>
                              </tr>
                            );
                          })}
                          <tr className="border-t bg-gray-50">
                            <td className="px-4 py-3 font-medium">Total</td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Progress 
                                  value={getTotalEntityPercentage()} 
                                  className="h-2 w-20" 
                                />
                                <span>{getTotalEntityPercentage().toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-medium">{formatCurrency(getBudgetValue())}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Notes Section */}
              <Card className="w-full max-w-none overflow-visible">
                <CardHeader>
                  <CardTitle className="text-base">Allocation Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Add notes about this allocation (optional)" 
                    value={allocation.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
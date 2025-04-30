import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FileText, 
  CheckCircle,
  PieChart, 
  Plus,
  Keyboard,
  Settings,
  Save,
  Calculator,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { Entity, Ratio, BudgetItemAllocation, SelectedBudgetItem } from '@shared/ratio-types';
import { useToast } from '@/hooks/use-toast';

interface CostAllocationTabProps {
  entities: Entity[];
  allRatios: Ratio[];
  coreRatios?: any[];
  derivedRatios?: any[];
  combinationRatios?: any[];
  projectId?: number;
  unitType?: string;
  selectedBudgetItems: Record<number, SelectedBudgetItem>;
  onAllocationUpdate?: (allocations: Record<number, BudgetItemAllocation>) => void;
}

export default function CostAllocationTab({
  entities,
  allRatios,
  coreRatios = [],
  derivedRatios = [],
  combinationRatios = [],
  projectId,
  unitType = 'sqm',
  selectedBudgetItems,
  onAllocationUpdate
}: CostAllocationTabProps) {
  // Initialize an empty allocations object to store all budget item allocations
  const [allocations, setAllocations] = useState<Record<number, BudgetItemAllocation>>({});
  
  // Update local allocations when callback is triggered
  const updateAllocations = useCallback((updatedAllocations: Record<number, BudgetItemAllocation>) => {
    setAllocations(updatedAllocations);
    if (onAllocationUpdate) {
      onAllocationUpdate(updatedAllocations);
    }
  }, [onAllocationUpdate]);
  const { toast } = useToast();
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<SelectedBudgetItem | null>(null);
  const [currentAllocation, setCurrentAllocation] = useState<BudgetItemAllocation | null>(null);
  
  // Select a budget item from the external tab
  // Function to select a specific budget item
  const selectBudgetItem = useCallback((itemId: number, item: SelectedBudgetItem) => {
    setSelectedBudgetItem(item);
    
    // Make sure allocations exists before accessing it
    if (allocations) {
      // Get current allocation for this item
      const allocation = allocations[itemId];
      if (allocation) {
        setCurrentAllocation(allocation);
      } else {
        // Create a new allocation for this item
        const newAllocation: BudgetItemAllocation = {
          budgetItemId: itemId,
          allocationInputs: [],
          allocationMethod: 'ratio_based',
          budgetValue: item.budgetValue || '0'
        };
        
        setCurrentAllocation(newAllocation);
        
        // Update the overall allocations
        const updatedAllocations = {
          ...(allocations || {}),
          [itemId]: newAllocation
        };
        
        // Call the update allocations function
        updateAllocations(updatedAllocations);
      }
    } else {
      // If allocations doesn't exist yet, create a new one
      const newAllocation: BudgetItemAllocation = {
        budgetItemId: itemId,
        allocationInputs: [],
        allocationMethod: 'ratio_based',
        budgetValue: item.budgetValue || '0'
      };
      
      setCurrentAllocation(newAllocation);
      
      // Create a new allocations object
      const updatedAllocations = {
        [itemId]: newAllocation
      };
      
      // Call the update allocations function
      updateAllocations(updatedAllocations);
    }
  }, [allocations, onAllocationUpdate]);

  // Add a dropdown for selecting budget items
  const selectDifferentBudgetItem = useCallback((itemIdStr: string) => {
    const itemId = parseInt(itemIdStr);
    const item = selectedBudgetItems[itemId];
    if (item && item.isSelected) {
      selectBudgetItem(itemId, item);
    }
  }, [selectedBudgetItems, selectBudgetItem]);

  useEffect(() => {
    // Check if there's a selected budget item from the parent component
    const selectedItems = Object.entries(selectedBudgetItems)
      .filter(([_, item]) => item.isSelected);
    
    if (selectedItems.length > 0 && !selectedBudgetItem) {
      // If we have selected items but no current selection, select the first one
      const [itemIdStr, item] = selectedItems[0];
      const itemId = parseInt(itemIdStr);
      selectBudgetItem(itemId, item);
    }
  }, [selectedBudgetItems, allocations, selectedBudgetItem, selectBudgetItem]);
  
  // Calculate distribution based on allocationInputs (for all allocation methods)
  const calculateDistribution = useMemo(() => {
    if (!currentAllocation || !selectedBudgetItem) {
      return {};
    }
    
    const distribution: Record<number, { amount: number, percentage: number }> = {};
    const budgetValue = parseFloat(selectedBudgetItem.budgetValue || '0');
    
    // Initialize with zero values for all entities
    entities.forEach(entity => {
      distribution[entity.id] = { amount: 0, percentage: 0 };
    });
    
    // Process based on allocation method
    if (currentAllocation.allocationMethod === 'ratio_based') {
      if (!currentAllocation.allocatedRatioId) return distribution;
      
      // Find the selected ratio
      const selectedRatio = allRatios.find(ratio => ratio.id === currentAllocation.allocatedRatioId);
      if (!selectedRatio || !selectedRatio.entityValues) {
        return distribution;
      }
      
      if (isNaN(budgetValue) || budgetValue <= 0) {
        return distribution;
      }
      
      // Calculate total ratio value
      const totalRatioValue = Object.values(selectedRatio.entityValues).reduce((sum, value) => sum + value, 0);
      if (totalRatioValue <= 0) {
        return distribution;
      }
      
      // Calculate distribution for ratio-based allocation
      entities.forEach(entity => {
        const ratioValue = selectedRatio.entityValues?.[entity.id] || 0;
        const percentage = (ratioValue / totalRatioValue) * 100;
        const amount = (budgetValue * percentage) / 100;
        
        distribution[entity.id] = {
          amount,
          percentage
        };
      });
    } 
    else if (currentAllocation.allocationMethod === 'input_based') {
      // For manual input-based allocation
      // We'll implement this when we handle the input fields
      // Currently, distribution remains zero until user inputs values
    }
    else if (currentAllocation.allocationMethod === 'hybrid') {
      // Process allocationInputs for hybrid (multi-ratio) allocation
      // Each allocation input can have its own ratio and portion of the budget
      
      // Check if there are allocation inputs defined
      if (currentAllocation.allocationInputs && currentAllocation.allocationInputs.length > 0) {
        let totalInputValue = 0;
        
        // Calculate total input value across all allocation inputs
        currentAllocation.allocationInputs.forEach(input => {
          const inputValue = parseFloat(input.value);
          if (!isNaN(inputValue)) {
            totalInputValue += inputValue;
          }
        });
        
        if (totalInputValue > 0) {
          // Process each allocation input
          currentAllocation.allocationInputs.forEach(input => {
            const inputValue = parseFloat(input.value);
            
            if (!isNaN(inputValue) && input.ratioId) {
              // Find the ratio for this input
              const ratio = allRatios.find(r => r.id === input.ratioId);
              
              if (ratio && ratio.entityValues) {
                // Calculate ratio total
                const ratioTotal = Object.values(ratio.entityValues).reduce((sum, val) => sum + val, 0);
                
                if (ratioTotal > 0) {
                  // Calculate the budget portion for this input
                  const inputBudgetPortion = (inputValue / totalInputValue) * budgetValue;
                  
                  // Distribute this portion according to the ratio
                  entities.forEach(entity => {
                    const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
                    const entityPortion = (entityRatioValue / ratioTotal) * inputBudgetPortion;
                    
                    // Add to the entity's total
                    distribution[entity.id].amount += entityPortion;
                  });
                }
              }
            }
          });
          
          // Calculate percentages based on final amounts
          const totalDistributedAmount = Object.values(distribution).reduce((sum, item) => sum + item.amount, 0);
          
          if (totalDistributedAmount > 0) {
            entities.forEach(entity => {
              distribution[entity.id].percentage = (distribution[entity.id].amount / totalDistributedAmount) * 100;
            });
          }
        }
      }
    }
    else if (currentAllocation.allocationMethod === 'ratio_input') {
      // Multi-Input with Ratio allocation method
      // Each input applies a selected ratio to distribute its value
      
      // Check if there are allocation inputs defined
      if (currentAllocation.allocationInputs && currentAllocation.allocationInputs.length > 0) {
        // Process each allocation input
        currentAllocation.allocationInputs.forEach(input => {
          const inputValue = parseFloat(input.value);
          
          if (!isNaN(inputValue) && input.ratioId) {
            // Find the ratio for this input
            const ratio = allRatios.find(r => r.id === input.ratioId);
            
            if (ratio && ratio.entityValues) {
              // Calculate ratio total
              const ratioTotal = Object.values(ratio.entityValues).reduce((sum, val) => sum + val, 0);
              
              if (ratioTotal > 0) {
                // Distribute this input according to the ratio
                entities.forEach(entity => {
                  const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
                  const entityInputValue = (entityRatioValue / ratioTotal) * inputValue;
                  
                  // Add to the entity's total
                  distribution[entity.id].amount += entityInputValue;
                });
              }
            }
          }
        });
        
        // Calculate percentages based on final amounts
        const totalDistributedAmount = Object.values(distribution).reduce((sum, item) => sum + item.amount, 0);
        
        if (totalDistributedAmount > 0) {
          entities.forEach(entity => {
            distribution[entity.id].percentage = (distribution[entity.id].amount / totalDistributedAmount) * 100;
          });
        }
      }
    }
    
    return distribution;
  }, [currentAllocation, selectedBudgetItem, allRatios, entities]);

  // Add a new allocation input
  const addAllocationInput = (ratioIdStr?: string) => {
    if (!currentAllocation || !selectedBudgetItem?.budgetItemId) {
      toast({
        title: "No budget item selected",
        description: "Please select a budget item first."
      });
      return;
    }
    
    // Check if we have ratios available
    if (allRatios.length === 0) {
      toast({
        title: "No ratios available",
        description: "Please create ratios in the ratio management tab first."
      });
      return;
    }
    
    // Find the selected ratio by ID if provided
    let selectedRatio;
    
    if (ratioIdStr) {
      // Find the ratio with the given ID
      selectedRatio = allRatios.find(r => r.id.toString() === ratioIdStr);
      if (!selectedRatio) {
        toast({
          title: "Ratio not found",
          description: "The selected ratio was not found in the available ratios."
        });
        return;
      }
    } else {
      // We require a ratio to be selected via the dropdown
      toast({
        title: "Please select a ratio",
        description: "You need to select a ratio from the dropdown to add an input.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentAllocation.allocationMethod === 'ratio_based') {
      // For single ratio-based allocation, we set the allocatedRatioId
      const updatedAllocation: BudgetItemAllocation = {
        ...currentAllocation,
        allocatedRatioId: selectedRatio.id,
        allocatedRatioName: selectedRatio.name
      };
      
      setCurrentAllocation(updatedAllocation);
      
      // Update the overall allocations
      if (onAllocationUpdate) {
        onAllocationUpdate({
          ...(allocations || {}),
          [selectedBudgetItem.budgetItemId]: updatedAllocation
        });
      }
      
      toast({
        title: "Ratio selected",
        description: `Using "${selectedRatio.name}" for cost distribution`,
        variant: "default"
      });
    } 
    else if (currentAllocation.allocationMethod === 'hybrid' || currentAllocation.allocationMethod === 'ratio_input') {
      // For both hybrid (multi-ratio) and ratio_input allocation, we add a new allocation input
      // with a different default unit based on the allocation method
      const defaultUnit = currentAllocation.allocationMethod === 'hybrid' 
        ? 'percentage' 
        : 'aed'; // For ratio_input, default to AED but user can change this
      
      const newInput = {
        id: Date.now(), // Generate a temporary ID
        name: `Input ${(currentAllocation.allocationInputs?.length || 0) + 1}`,
        ratioId: selectedRatio.id,
        ratioName: selectedRatio.name,
        value: '1', // Default value
        unit: defaultUnit as 'percentage' | 'aed' | 'sqm' | 'hours' | 'staff',
        entityId: 0, // 0 means this applies to all entities through the ratio
        entityValues: {}, // Empty object for now, will be filled when calculating distribution
        percentages: {}, // Empty object for now, will be filled when calculating distribution
        description: `Allocation based on ${selectedRatio.name}`
      };
      
      const updatedAllocation: BudgetItemAllocation = {
        ...currentAllocation,
        allocationInputs: [...(currentAllocation.allocationInputs || []), newInput]
      };
      
      setCurrentAllocation(updatedAllocation);
      
      // Update the overall allocations
      if (onAllocationUpdate) {
        onAllocationUpdate({
          ...(allocations || {}),
          [selectedBudgetItem.budgetItemId]: updatedAllocation
        });
      }
      
      const allocationTypeText = currentAllocation.allocationMethod === 'hybrid' 
        ? "multi-ratio allocation" 
        : "multi-input allocation";
      
      toast({
        title: "Ratio added",
        description: `Added "${selectedRatio.name}" to ${allocationTypeText}`,
        variant: "default"
      });
    }
    else {
      toast({
        title: "Select a ratio",
        description: "Please select a ratio from your ratio management to allocate costs."
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
            <CardTitle>Cost Allocation Setup</CardTitle>
          </div>
          <CardDescription>
            Step 3: Choose an allocation method and distribute costs to entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
            <div className="space-y-4">
              <div className="mb-4">
                {selectedBudgetItem ? (
                  <div className="space-y-3">
                    <label className="text-sm font-medium leading-none">Budget Item</label>
                    <Select 
                      value={selectedBudgetItem.budgetItemId?.toString() || ''} 
                      onValueChange={selectDifferentBudgetItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget item">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase">{selectedBudgetItem.code}</Badge>
                            <span className="truncate">{selectedBudgetItem.description}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(selectedBudgetItems)
                          .filter(([_, item]) => item.isSelected)
                          .map(([itemIdStr, item]) => (
                            <SelectItem key={itemIdStr} value={itemIdStr}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="uppercase">{item.code}</Badge>
                                <span className="truncate">{item.description}</span>
                              </div>
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Budget Item Selected</h3>
                    <p className="text-muted-foreground text-center mt-1">
                      Select a budget item to start allocation
                    </p>
                  </div>
                )}
              </div>
              
              {selectedBudgetItem && (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium leading-none">Allocation Method</label>
                    <Select 
                      value={currentAllocation?.allocationMethod || "ratio_based"} 
                      onValueChange={(value) => {
                        if (currentAllocation && selectedBudgetItem) {
                          const newAllocation = {
                            ...currentAllocation,
                            allocationMethod: value as "ratio_based" | "input_based" | "hybrid" | "ratio_input"
                          };
                          setCurrentAllocation(newAllocation);
                          
                          if (onAllocationUpdate && selectedBudgetItem.budgetItemId) {
                            onAllocationUpdate({
                              ...allocations,
                              [selectedBudgetItem.budgetItemId]: newAllocation
                            });
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Allocation Method">
                          {currentAllocation?.allocationMethod === 'ratio_based' && (
                            <div className="flex items-center gap-2">
                              <PieChart className="h-4 w-4 text-primary" />
                              <span>Single Ratio Based</span>
                            </div>
                          )}
                          {currentAllocation?.allocationMethod === 'input_based' && (
                            <div className="flex items-center gap-2">
                              <Keyboard className="h-4 w-4 text-primary" />
                              <span>Manual Input Based</span>
                            </div>
                          )}
                          {currentAllocation?.allocationMethod === 'hybrid' && (
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-primary" />
                              <span>Multi-Ratio Based</span>
                            </div>
                          )}
                          {currentAllocation?.allocationMethod === 'ratio_input' && (
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-primary" />
                              <span>Multi-Input with Ratio</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ratio_based">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <PieChart className="h-4 w-4 text-primary" />
                              <span>Single Ratio Based</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6">Apply one predefined ratio to distribute inputs uniformly across all entities</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="input_based" disabled>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Keyboard className="h-4 w-4 text-muted-foreground" />
                              <span className="line-through text-muted-foreground">Manual Input Based (Deprecated)</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6">This method is deprecated. Please use Multi-Ratio or Multi-Input instead.</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hybrid">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-primary" />
                              <span>Multi-Ratio Based</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6">Combine multiple predefined ratios with weighted importance for complex distributions</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ratio_input">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-primary" />
                              <span>Multi-Input with Ratio</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6">Define multiple input types (staff, hours, area) with different ratios for varied measurements</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              
                  {/* Content based on the allocation method */}
                  {currentAllocation?.allocationMethod === 'ratio_based' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          <span className="text-lg font-medium">
                            Single Ratio Based Allocation
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="text-sm font-medium leading-none mb-2 block">Select Allocation Ratio</label>
                        <Select 
                          value={currentAllocation.allocatedRatioId?.toString() || ""} 
                          onValueChange={(value) => {
                            if (value && currentAllocation && selectedBudgetItem?.budgetItemId) {
                              const selectedRatio = allRatios.find(r => r.id.toString() === value);
                              if (selectedRatio) {
                                const newAllocation = {
                                  ...currentAllocation,
                                  allocatedRatioId: selectedRatio.id,
                                  allocatedRatioName: selectedRatio.name
                                };
                                
                                // Update both the current allocation and the overall allocations
                                setCurrentAllocation(newAllocation);
                                
                                // Immediately update the allocations in both local state and parent component
                                const updatedAllocations = {
                                  ...allocations,
                                  [selectedBudgetItem.budgetItemId]: newAllocation
                                };
                                
                                setAllocations(updatedAllocations);
                                
                                if (onAllocationUpdate) {
                                  onAllocationUpdate(updatedAllocations);
                                }
                                
                                toast({
                                  title: "Ratio assigned",
                                  description: `"${selectedRatio.name}" ratio has been assigned to this budget item.`,
                                  variant: "default"
                                });
                              }
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a ratio for allocation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select a ratio...</SelectItem>
                            
                            {coreRatios && coreRatios.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Core Ratios</SelectLabel>
                                {coreRatios.map(ratio => (
                                  <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                    {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}

                            {derivedRatios && derivedRatios.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Derived Ratios</SelectLabel>
                                {derivedRatios.map(ratio => (
                                  <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                    {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                            
                            {combinationRatios && combinationRatios.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Special Area Ratios</SelectLabel>
                                {combinationRatios.map(ratio => (
                                  <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                    {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {!currentAllocation.allocatedRatioId ? (
                        <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                          <p>No ratio selected yet</p>
                          <p className="text-sm mt-1">Please select a ratio from the dropdown above</p>
                        </div>
                      ) : (
                        <div>
                          <div className="p-3 border rounded-md mb-3">
                            <div className="flex justify-between mb-2">
                              <div className="text-sm font-medium">Budget Value</div>
                              <div className="font-semibold">{selectedBudgetItem?.budgetValue || 0} AED</div>
                            </div>
                            <div className="text-xs text-muted-foreground mb-3">Distribution based on "{currentAllocation.allocatedRatioName}"</div>
                            
                            <div className="space-y-2 mt-4">
                              {entities.map(entity => {
                                const distribution = calculateDistribution[entity.id] || { amount: 0, percentage: 0 };
                                return (
                                  <div key={entity.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="h-3 w-3 rounded-full" 
                                        style={{ backgroundColor: entity.color || 'var(--primary)' }}
                                      ></div>
                                      <span className="text-sm">{entity.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {distribution.amount.toFixed(2)} AED
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {distribution.percentage.toFixed(2)}%
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Button to save allocation */}
                            <div className="mt-4 flex justify-end">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => {
                                  // Save the current allocation data
                                  if (currentAllocation && selectedBudgetItem?.budgetItemId) {
                                    // Update the allocations state
                                    const updatedAllocations = {
                                      ...allocations,
                                      [selectedBudgetItem.budgetItemId]: currentAllocation
                                    };
                                    
                                    // Update both local state and parent component
                                    setAllocations(updatedAllocations);
                                    if (onAllocationUpdate) {
                                      onAllocationUpdate(updatedAllocations);
                                    }
                                    
                                    toast({
                                      title: "Allocation saved",
                                      description: "The allocation has been saved successfully.",
                                      variant: "default"
                                    });
                                  }
                                }}
                              >
                                <Save className="h-4 w-4 mr-1" /> Save Allocation
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {currentAllocation?.allocationMethod === 'input_based' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Keyboard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="text-lg font-medium line-through text-muted-foreground">
                              Manual Input Allocation
                            </span>
                            <Badge variant="outline" className="ml-2">Deprecated</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md mb-3 bg-muted/20">
                        <Alert variant="destructive" className="mb-3">
                          <AlertCircleIcon className="h-4 w-4" />
                          <AlertTitle>Deprecated Allocation Method</AlertTitle>
                          <AlertDescription className="text-xs">
                            This allocation method is being phased out. Please switch to Multi-Ratio Based or Multi-Input with Ratio for better consistency.
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm font-medium">Budget Value</div>
                          <div className="font-semibold">{selectedBudgetItem?.budgetValue || 0} AED</div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">Enter values manually for each entity</div>
                        
                        <div className="space-y-3 mt-4">
                          {entities.map(entity => {
                            // Find or initialize the input for this entity
                            const inputIndex = currentAllocation?.allocationInputs?.findIndex(
                              input => input.entityId === entity.id
                            ) || -1;
                            
                            const inputValue = inputIndex >= 0 && currentAllocation?.allocationInputs 
                              ? currentAllocation.allocationInputs[inputIndex]?.value || ''
                              : '';
                              
                            // Calculate percentage for display
                            const totalInputValue = currentAllocation?.allocationInputs?.reduce((sum, input) => {
                              const val = parseFloat(input.value || '0');
                              return sum + (isNaN(val) ? 0 : val);
                            }, 0) || 0;
                            
                            const thisValue = parseFloat(inputValue || '0');
                            const percentage = totalInputValue > 0 ? (thisValue / totalInputValue) * 100 : 0;
                            
                            return (
                              <div key={entity.id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: entity.color || 'var(--primary)' }}
                                  ></div>
                                  <span className="text-sm">{entity.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    className="w-24 h-8 px-2 border rounded text-sm"
                                    placeholder="0.00"
                                    value={inputValue}
                                    onChange={(e) => {
                                      if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                      
                                      const value = e.target.value;
                                      let newAllocationInputs = [...(currentAllocation.allocationInputs || [])];
                                      
                                      if (inputIndex >= 0) {
                                        // Update existing input
                                        newAllocationInputs[inputIndex] = {
                                          ...newAllocationInputs[inputIndex],
                                          value
                                        };
                                      } else {
                                        // Create new input
                                        newAllocationInputs.push({
                                          id: Date.now() + entity.id, // Generate a unique ID
                                          name: `Input for ${entity.name}`,
                                          ratioId: null,
                                          ratioName: null,
                                          entityId: entity.id,
                                          value,
                                          unit: 'aed', // Default unit
                                          entityValues: {}, // Required empty object
                                          percentages: {}, // Required empty object
                                          description: `Manual input for ${entity.name}`
                                        });
                                      }
                                      
                                      // Update the allocation
                                      const updatedAllocation: BudgetItemAllocation = {
                                        ...currentAllocation,
                                        allocationInputs: newAllocationInputs
                                      };
                                      
                                      setCurrentAllocation(updatedAllocation);
                                      
                                      if (onAllocationUpdate) {
                                        onAllocationUpdate({
                                          ...(allocations || {}),
                                          [selectedBudgetItem.budgetItemId]: updatedAllocation
                                        });
                                      }
                                    }}
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {percentage.toFixed(2)}%
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Button to save allocation */}
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              // Save the current allocation data
                              if (currentAllocation && selectedBudgetItem?.budgetItemId) {
                                // Update the allocations state
                                const updatedAllocations = {
                                  ...allocations,
                                  [selectedBudgetItem.budgetItemId]: currentAllocation
                                };
                                
                                // Update both local state and parent component
                                setAllocations(updatedAllocations);
                                if (onAllocationUpdate) {
                                  onAllocationUpdate(updatedAllocations);
                                }
                                
                                toast({
                                  title: "Manual allocation saved",
                                  description: "The manual allocation has been saved successfully.",
                                  variant: "default"
                                });
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save Allocation
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {currentAllocation?.allocationMethod === 'ratio_input' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-primary" />
                          <span className="text-lg font-medium">
                            Multi-Input with Ratio Allocation
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(value) => {
                              if (value) {
                                addAllocationInput(value);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[200px] h-9">
                              <SelectValue placeholder="Select ratio..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select a ratio...</SelectItem>
                              
                              {coreRatios && coreRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Core Ratios</SelectLabel>
                                  {coreRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}

                              {derivedRatios && derivedRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Derived Ratios</SelectLabel>
                                  {derivedRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                              
                              {combinationRatios && combinationRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Special Area Ratios</SelectLabel>
                                  {combinationRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md mb-3">
                        <div className="text-xs text-muted-foreground mb-3">
                          Define multiple inputs with different measurement units (staff, hours, area) 
                          and apply appropriate ratios to each for precise distribution
                        </div>
                        
                        {currentAllocation.allocationInputs?.length === 0 ? (
                          <div className="text-center text-muted-foreground py-4">
                            <p>No inputs added yet</p>
                            <p className="text-sm mt-1">Select a ratio from the dropdown above to add an input</p>
                          </div>
                        ) : (
                          <div className="space-y-4 mt-4">
                            {currentAllocation.allocationInputs?.map((input, index) => {
                              const ratio = allRatios.find(r => r.id === input.ratioId);
                              
                              return (
                                <div key={input.id || index} className="border rounded-md p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Calculator className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">Input {index + 1}</span>
                                    </div>
                                    
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                        
                                        // Remove this input
                                        const newInputs = currentAllocation.allocationInputs?.filter((_, i) => i !== index) || [];
                                        
                                        const updatedAllocation: BudgetItemAllocation = {
                                          ...currentAllocation,
                                          allocationInputs: newInputs
                                        };
                                        
                                        setCurrentAllocation(updatedAllocation);
                                        
                                        if (onAllocationUpdate) {
                                          onAllocationUpdate({
                                            ...(allocations || {}),
                                            [selectedBudgetItem.budgetItemId]: updatedAllocation
                                          });
                                        }
                                      }}
                                      className="h-8 w-8 p-0 rounded-full"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
                                    {/* Input Value */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs text-muted-foreground">Input Value</label>
                                      <input 
                                        type="number"
                                        className="w-full h-8 px-2 border rounded text-sm"
                                        placeholder="0.00"
                                        value={input.value}
                                        onChange={(e) => {
                                          if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                          
                                          const newInputs = [...(currentAllocation.allocationInputs || [])];
                                          // Make sure to maintain the AllocationInput structure
                                          newInputs[index] = {
                                            ...newInputs[index],
                                            value: e.target.value
                                          };
                                          
                                          const updatedAllocation: BudgetItemAllocation = {
                                            ...currentAllocation,
                                            allocationInputs: newInputs
                                          };
                                          
                                          setCurrentAllocation(updatedAllocation);
                                          
                                          if (onAllocationUpdate) {
                                            onAllocationUpdate({
                                              ...(allocations || {}),
                                              [selectedBudgetItem.budgetItemId]: updatedAllocation
                                            });
                                          }
                                        }}
                                      />
                                    </div>
                                    
                                    {/* Input Unit */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs text-muted-foreground">Unit</label>
                                      <Select 
                                        value={input.unit}
                                        onValueChange={(value) => {
                                          if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                          
                                          const newInputs = [...(currentAllocation.allocationInputs || [])];
                                          // Make sure to maintain the AllocationInput structure
                                          newInputs[index] = {
                                            ...newInputs[index],
                                            unit: value
                                          };
                                          
                                          const updatedAllocation: BudgetItemAllocation = {
                                            ...currentAllocation,
                                            allocationInputs: newInputs
                                          };
                                          
                                          setCurrentAllocation(updatedAllocation);
                                          
                                          if (onAllocationUpdate) {
                                            onAllocationUpdate({
                                              ...(allocations || {}),
                                              [selectedBudgetItem.budgetItemId]: updatedAllocation
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {/* Currency units */}
                                          <SelectItem value="aed">AED (Currency)</SelectItem>
                                          <SelectItem value="usd">USD (Currency)</SelectItem>
                                          <SelectItem value="eur">EUR (Currency)</SelectItem>
                                          
                                          {/* Area measurements */}
                                          <SelectItem value="sqm">SQM (Area)</SelectItem>
                                          <SelectItem value="sqft">SQFT (Area)</SelectItem>
                                          
                                          {/* Time units */}
                                          <SelectItem value="hours">Hours (Time)</SelectItem>
                                          <SelectItem value="days">Days (Time)</SelectItem>
                                          <SelectItem value="months">Months (Time)</SelectItem>
                                          
                                          {/* Staff units */}
                                          <SelectItem value="staff">Staff (Headcount)</SelectItem>
                                          <SelectItem value="fte">FTE (Full-time Equivalent)</SelectItem>
                                          
                                          {/* Volume measurements */}
                                          <SelectItem value="cubicm">Cubic Meters (Volume)</SelectItem>
                                          <SelectItem value="liters">Liters (Volume)</SelectItem>
                                          
                                          {/* Quantity units */}
                                          <SelectItem value="pieces">Pieces (Quantity)</SelectItem>
                                          <SelectItem value="units">Units (Quantity)</SelectItem>
                                          
                                          {/* Other units */}
                                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                                          <SelectItem value="frequency_day">Times per Day</SelectItem>
                                          <SelectItem value="frequency_week">Times per Week</SelectItem>
                                          <SelectItem value="frequency_month">Times per Month</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Ratio Selection */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs text-muted-foreground">Applied Ratio</label>
                                      <Select 
                                        value={input.ratioId?.toString() || ''}
                                        onValueChange={(value) => {
                                          if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                          
                                          const selectedRatio = allRatios.find(r => r.id === parseInt(value));
                                          if (!selectedRatio) return;
                                          
                                          const newInputs = [...(currentAllocation.allocationInputs || [])];
                                          // Make sure to maintain the AllocationInput structure
                                          newInputs[index] = {
                                            ...newInputs[index],
                                            ratioId: selectedRatio.id,
                                            ratioName: selectedRatio.name
                                          };
                                          
                                          const updatedAllocation: BudgetItemAllocation = {
                                            ...currentAllocation,
                                            allocationInputs: newInputs
                                          };
                                          
                                          setCurrentAllocation(updatedAllocation);
                                          
                                          if (onAllocationUpdate) {
                                            onAllocationUpdate({
                                              ...(allocations || {}),
                                              [selectedBudgetItem.budgetItemId]: updatedAllocation
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select ratio">
                                            {ratio?.name || "Select ratio"}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {allRatios.map((r) => (
                                            <SelectItem key={r.id} value={r.id.toString()}>
                                              {r.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  {/* Distribution Preview */}
                                  <div className="mt-2">
                                    <div className="text-xs text-muted-foreground mb-1">Distribution Preview</div>
                                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                                      {ratio && ratio.entityValues && Object.entries(ratio.entityValues).map(([entityIdStr, value]) => {
                                        const entityId = parseInt(entityIdStr);
                                        const entity = entities.find(e => e.id === entityId);
                                        if (!entity) return null;
                                        
                                        const totalRatioValue = Object.values(ratio.entityValues || {}).reduce((sum, val) => sum + val, 0);
                                        const percentage = totalRatioValue > 0 ? (value / totalRatioValue) * 100 : 0;
                                        const inputValue = parseFloat(input.value || '0');
                                        const distributedValue = !isNaN(inputValue) ? (inputValue * percentage) / 100 : 0;
                                        
                                        return (
                                          <div key={entityId} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1">
                                              <div 
                                                className="h-2 w-2 rounded-full" 
                                                style={{ backgroundColor: entity.color || 'var(--primary)' }}
                                              ></div>
                                              <span>{entity.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span>{distributedValue.toFixed(2)} {input.unit}</span>
                                              <span className="text-muted-foreground">({percentage.toFixed(2)}%)</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Final Distribution Display */}
                        {currentAllocation.allocationInputs?.length > 0 && (
                          <>
                            <div className="border-t my-4 pt-4">
                              <div className="text-sm font-medium mb-2">Final Distribution</div>
                              <div className="space-y-2">
                                {entities.map(entity => {
                                  const distribution = calculateDistribution[entity.id] || { amount: 0, percentage: 0 };
                                  return (
                                    <div key={entity.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="h-3 w-3 rounded-full" 
                                          style={{ backgroundColor: entity.color || 'var(--primary)' }}
                                        ></div>
                                        <span className="text-sm">{entity.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {distribution.amount.toFixed(2)}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {distribution.percentage.toFixed(2)}%
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Button to save allocation */}
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              // Save the current allocation data
                              if (currentAllocation && selectedBudgetItem?.budgetItemId) {
                                // Update the allocations state
                                const updatedAllocations = {
                                  ...allocations,
                                  [selectedBudgetItem.budgetItemId]: currentAllocation
                                };
                                
                                // Update both local state and parent component
                                setAllocations(updatedAllocations);
                                if (onAllocationUpdate) {
                                  onAllocationUpdate(updatedAllocations);
                                }
                                
                                toast({
                                  title: "Multi-input allocation saved",
                                  description: "The multi-input allocation has been saved successfully.",
                                  variant: "default"
                                });
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save Allocation
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {currentAllocation?.allocationMethod === 'hybrid' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <span className="text-lg font-medium">
                            Multi-Ratio Allocation
                          </span>
                        </div>
                        
                        {/* Add ratio dropdown and button */}
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(value) => {
                              if (value) {
                                addAllocationInput(value);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[200px] h-9">
                              <SelectValue placeholder="Select ratio..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select a ratio...</SelectItem>
                              
                              {coreRatios && coreRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Core Ratios</SelectLabel>
                                  {coreRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}

                              {derivedRatios && derivedRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Derived Ratios</SelectLabel>
                                  {derivedRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                              
                              {combinationRatios && combinationRatios.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Special Area Ratios</SelectLabel>
                                  {combinationRatios.map(ratio => (
                                    <SelectItem key={ratio.id} value={ratio.id.toString()}>
                                      {ratio.name} {ratio.description ? `- ${ratio.description}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md mb-3">
                        <div className="text-xs text-muted-foreground mb-3">
                          Distribute costs by combining multiple ratios for complex allocations
                        </div>
                        
                        {!currentAllocation?.allocationInputs || currentAllocation.allocationInputs.length === 0 ? (
                          <div className="text-center text-muted-foreground py-4">
                            <p>No ratios assigned yet</p>
                            <p className="text-sm mt-1">Select a ratio from the dropdown above to add it to the allocation</p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4 mb-4">
                              {currentAllocation.allocationInputs.map((input, index) => {
                                const ratio = allRatios.find(r => r.id === input.ratioId);
                                return (
                                  <div key={index} className="border-b pb-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                                        <span className="text-sm font-medium">{ratio?.name || 'Unknown Ratio'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="number"
                                          className="w-24 h-8 px-2 border rounded text-sm"
                                          placeholder="0.00"
                                          value={input.value || ''}
                                          onChange={(e) => {
                                            if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                            
                                            const value = e.target.value;
                                            const newAllocationInputs = [...currentAllocation.allocationInputs];
                                            
                                            newAllocationInputs[index] = {
                                              ...newAllocationInputs[index],
                                              value
                                            };
                                            
                                            // Update the allocation
                                            const updatedAllocation: BudgetItemAllocation = {
                                              ...currentAllocation,
                                              allocationInputs: newAllocationInputs
                                            };
                                            
                                            setCurrentAllocation(updatedAllocation);
                                            
                                            if (onAllocationUpdate) {
                                              onAllocationUpdate({
                                                ...(allocations || {}),
                                                [selectedBudgetItem.budgetItemId]: updatedAllocation
                                              });
                                            }
                                          }}
                                        />
                                        <select
                                          className="h-8 border rounded text-sm px-1"
                                          value={input.unit || 'percentage'}
                                          onChange={(e) => {
                                            if (!currentAllocation || !selectedBudgetItem?.budgetItemId) return;
                                            
                                            const unit = e.target.value;
                                            const newAllocationInputs = [...currentAllocation.allocationInputs];
                                            
                                            newAllocationInputs[index] = {
                                              ...newAllocationInputs[index],
                                              unit: unit as 'percentage' | 'aed' | 'sqm' | 'hours' | 'staff'
                                            };
                                            
                                            // Update the allocation
                                            const updatedAllocation: BudgetItemAllocation = {
                                              ...currentAllocation,
                                              allocationInputs: newAllocationInputs
                                            };
                                            
                                            setCurrentAllocation(updatedAllocation);
                                            
                                            if (onAllocationUpdate) {
                                              onAllocationUpdate({
                                                ...(allocations || {}),
                                                [selectedBudgetItem.budgetItemId]: updatedAllocation
                                              });
                                            }
                                          }}
                                        >
                                          <option value="percentage">%</option>
                                          <option value="aed">AED</option>
                                          <option value="sqm">m²</option>
                                          <option value="hours">hr</option>
                                          <option value="staff">staff</option>
                                        </select>
                                      </div>
                                    </div>
                                    
                                    {/* Entity distribution for this ratio */}
                                    <div className="mt-2 pl-4 text-xs space-y-1 text-muted-foreground">
                                      {ratio && ratio.entityValues && entities.map(entity => {
                                        const totalRatioValue = Object.values(ratio.entityValues || {}).reduce((sum, val) => sum + val, 0);
                                        const entityValue = ratio.entityValues?.[entity.id] || 0;
                                        const percentage = totalRatioValue > 0 ? (entityValue / totalRatioValue) * 100 : 0;
                                        
                                        return (
                                          <div key={entity.id} className="flex justify-between">
                                            <span>{entity.name}</span>
                                            <span>{percentage.toFixed(2)}%</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-3 p-3 border rounded-md bg-muted/10">
                              <div className="text-sm font-medium mb-2">Distribution Summary</div>
                              <div className="space-y-1">
                                {entities.map(entity => {
                                  const distribution = calculateDistribution[entity.id] || { amount: 0, percentage: 0 };
                                  return (
                                    <div key={entity.id} className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="h-2 w-2 rounded-full" 
                                          style={{ backgroundColor: entity.color || 'var(--primary)' }}
                                        ></div>
                                        <span className="text-sm">{entity.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs">{distribution.amount.toFixed(2)} AED</span>
                                        <span className="text-xs font-medium">({distribution.percentage.toFixed(2)}%)</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Button to save allocation */}
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="sm" 
                            variant="default"
                            disabled={!currentAllocation?.allocationInputs || currentAllocation.allocationInputs.length === 0}
                            onClick={() => {
                              // Save the current allocation data
                              if (currentAllocation && selectedBudgetItem?.budgetItemId) {
                                // Update the allocations state
                                const updatedAllocations = {
                                  ...allocations,
                                  [selectedBudgetItem.budgetItemId]: currentAllocation
                                };
                                
                                // Update both local state and parent component
                                setAllocations(updatedAllocations);
                                if (onAllocationUpdate) {
                                  onAllocationUpdate(updatedAllocations);
                                }
                                
                                toast({
                                  title: "Multi-ratio allocation saved",
                                  description: "The multi-ratio allocation has been saved successfully.",
                                  variant: "default"
                                });
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save Allocation
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
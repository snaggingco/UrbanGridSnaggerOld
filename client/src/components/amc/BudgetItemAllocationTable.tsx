import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EditIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PercentIcon,
  DollarSignIcon,
  CalculatorIcon,
  PlusIcon,
  Trash2Icon,
  ArrowRightIcon,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
// Helper to format currency values
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Import types
import { 
  BudgetItem, 
  BudgetItemAllocation, 
  BudgetItemInput,
  CombinationRatio, 
  DerivedRatio,
  Entity
} from '@shared/ratio-types';

interface BudgetItemAllocationTableProps {
  budgetItems: BudgetItem[];
  allocations: BudgetItemAllocation[];
  allRatios: (CombinationRatio | DerivedRatio)[];
  entities: Entity[];
  unitType: 'sqm' | 'sqft';
  onSaveAllocation: (allocation: BudgetItemAllocation) => void;
  onUpdateBudgetItemDescription: (itemId: string, description: string) => void;
}

export function BudgetItemAllocationTable({
  budgetItems,
  allocations,
  allRatios,
  entities,
  unitType,
  onSaveAllocation,
  onUpdateBudgetItemDescription,
}: BudgetItemAllocationTableProps) {
  const { toast } = useToast();
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<BudgetItem | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<BudgetItemAllocation | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Allocation form state
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRatioId, setSelectedRatioId] = useState<number | null>(null);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<string>('area');
  const [allocationInputs, setAllocationInputs] = useState<{
    id: number;
    value: string;
    ratioId: number | null;
    unit: string;
  }[]>([]);
  
  // Open the allocation dialog for a budget item
  const openAllocationDialog = (budgetItem: BudgetItem) => {
    setSelectedBudgetItem(budgetItem);
    
    // Find existing allocation for this budget item
    const existingAllocation = allocations.find(a => a.budgetItemId === budgetItem.id);
    setSelectedAllocation(existingAllocation || null);
    
    // Initialize form with existing data if available
    if (existingAllocation) {
      if (existingAllocation.inputs && existingAllocation.inputs.length > 0) {
        setAllocationInputs(existingAllocation.inputs.map(input => ({
          id: input.id || Date.now() + Math.floor(Math.random() * 1000),
          value: input.value.toString(),
          ratioId: input.ratioId,
          unit: input.unit || 'area'
        })));
      } else {
        // Legacy allocation with single input
        setInputValue(existingAllocation.inputValue?.toString() || '');
        setSelectedRatioId(existingAllocation.ratioId || null);
        setUnitOfMeasurement(existingAllocation.unit || 'area');
        
        // Convert to new format
        setAllocationInputs([{
          id: Date.now(),
          value: existingAllocation.inputValue?.toString() || '',
          ratioId: existingAllocation.ratioId || null,
          unit: existingAllocation.unit || 'area'
        }]);
      }
    } else {
      // New allocation, start with one empty input
      setAllocationInputs([{
        id: Date.now(),
        value: '',
        ratioId: null,
        unit: 'area'
      }]);
      setInputValue('');
      setSelectedRatioId(null);
      setUnitOfMeasurement('area');
    }
    
    setIsAllocationDialogOpen(true);
  };
  
  // Add a new input field to the allocation
  const addAllocationInput = () => {
    setAllocationInputs([
      ...allocationInputs,
      {
        id: Date.now(),
        value: '',
        ratioId: null,
        unit: unitOfMeasurement // Use the current unit of measurement as default
      }
    ]);
  };
  
  // Remove an input field from the allocation
  const removeAllocationInput = (id: number) => {
    if (allocationInputs.length <= 1) {
      toast({
        title: "Error",
        description: "You must have at least one input for allocation",
        variant: "destructive"
      });
      return;
    }
    
    setAllocationInputs(allocationInputs.filter(input => input.id !== id));
  };
  
  // Update an input field
  const updateAllocationInput = (
    id: number, 
    field: 'value' | 'ratioId' | 'unit', 
    value: string | number
  ) => {
    setAllocationInputs(allocationInputs.map(input => {
      if (input.id === id) {
        return { ...input, [field]: value };
      }
      return input;
    }));
  };
  
  // Save the allocation
  const saveAllocation = () => {
    if (!selectedBudgetItem) return;
    
    // Validate inputs
    for (const input of allocationInputs) {
      if (!input.value || isNaN(parseFloat(input.value))) {
        toast({
          title: "Invalid Input",
          description: "Please enter a valid number for all input values",
          variant: "destructive"
        });
        return;
      }
      
      if (!input.ratioId) {
        toast({
          title: "Missing Ratio",
          description: "Please select a ratio for all inputs",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Create the allocation object
    const newAllocation: BudgetItemAllocation = {
      id: selectedAllocation?.id || Date.now(),
      budgetItemId: selectedBudgetItem.id,
      budgetItemCode: selectedBudgetItem.code,
      budgetItemDescription: selectedBudgetItem.description,
      // Keep legacy fields for backward compatibility
      inputValue: parseFloat(allocationInputs[0].value),
      ratioId: allocationInputs[0].ratioId || null,
      unit: allocationInputs[0].unit,
      // New multi-input format
      inputs: allocationInputs.map(input => ({
        id: input.id,
        value: parseFloat(input.value),
        ratioId: input.ratioId || null,
        unit: input.unit
      }))
    };
    
    // Save the allocation
    onSaveAllocation(newAllocation);
    
    // Close the dialog
    setIsAllocationDialogOpen(false);
    toast({
      title: "Allocation Saved",
      description: `Allocation for ${selectedBudgetItem.code} has been saved successfully.`
    });
  };
  
  // Get unit display label
  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'area':
        return unitType;
      case 'labor':
        return 'hours';
      case 'time':
        return 'days';
      case 'load':
        return 'units';
      default:
        return unit;
    }
  };
  
  // Get the ratio name by ID
  const getRatioNameById = (ratioId: number | null) => {
    if (!ratioId) return 'Not selected';
    
    const ratio = allRatios.find(r => r.id === ratioId);
    return ratio ? (ratio.description || ratio.name) : 'Unknown Ratio';
  };
  
  // Get allocation status
  const getAllocationStatus = (budgetItemId: string) => {
    const allocation = allocations.find(a => a.budgetItemId === budgetItemId);
    if (!allocation) return 'Not allocated';
    
    if (allocation.inputs && allocation.inputs.length > 0) {
      return `${allocation.inputs.length} allocation${allocation.inputs.length !== 1 ? 's' : ''}`;
    }
    
    return 'Allocated';
  };
  
  // Update a budget item description
  const handleDescriptionUpdate = (itemId: string) => {
    if (!editingDescription) return;
    
    onUpdateBudgetItemDescription(itemId, editingDescription);
    setEditingItemId(null);
    setEditingDescription(null);
    
    toast({
      title: "Description Updated",
      description: "The budget item description has been updated."
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead className="w-[350px]">Description</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetItems.map(item => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell>
                  {editingItemId === item.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingDescription || ''}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleDescriptionUpdate(item.id)}
                        className="shrink-0"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{item.description}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditingDescription(item.description);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getAllocationStatus(item.id) === 'Not allocated' ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                      Not allocated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50">
                      {getAllocationStatus(item.id)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAllocationDialog(item);
                    }}
                  >
                    {getAllocationStatus(item.id) === 'Not allocated'
                      ? 'Allocate'
                      : 'Edit Allocation'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {budgetItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <p className="text-muted-foreground">
                    No budget items selected. Please select budget items from the Budget Item Selection tab.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBudgetItem && 
                `Allocate Budget Item: ${selectedBudgetItem.code} - ${selectedBudgetItem.description}`}
            </DialogTitle>
            <DialogDescription>
              Configure how this budget item's cost will be distributed among entities
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-2">Allocation Inputs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add one or more allocation inputs, each with its own value and ratio distribution.
              </p>
              
              {allocationInputs.map((input, index) => (
                <div 
                  key={input.id} 
                  className="grid grid-cols-12 gap-4 items-end mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0"
                >
                  <div className="col-span-12 flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Input #{index + 1}</h4>
                    
                    {allocationInputs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllocationInput(input.id)}
                        className="text-destructive h-8 px-2"
                      >
                        <Trash2Icon className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="col-span-3">
                    <Label htmlFor={`input-value-${input.id}`}>Input Value</Label>
                    <div className="flex">
                      <Input
                        id={`input-value-${input.id}`}
                        type="number"
                        value={input.value}
                        onChange={(e) => updateAllocationInput(input.id, 'value', e.target.value)}
                        placeholder="Enter value"
                        className="rounded-r-none"
                      />
                      <Select
                        value={input.unit}
                        onValueChange={(value) => updateAllocationInput(input.id, 'unit', value)}
                      >
                        <SelectTrigger className="w-20 rounded-l-none border-l-0">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="area">{unitType}</SelectItem>
                          <SelectItem value="labor">hours</SelectItem>
                          <SelectItem value="time">days</SelectItem>
                          <SelectItem value="load">units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="col-span-4">
                    <Label htmlFor={`input-ratio-${input.id}`}>Distribution Ratio</Label>
                    <Select
                      value={input.ratioId?.toString() || ''}
                      onValueChange={(value) => updateAllocationInput(input.id, 'ratioId', parseInt(value))}
                    >
                      <SelectTrigger id={`input-ratio-${input.id}`}>
                        <SelectValue placeholder="Select a ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {allRatios.map(ratio => (
                          <SelectItem key={ratio.id} value={ratio.id.toString()}>
                            {ratio.description || ratio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-5 flex items-center">
                    <div className="text-muted-foreground text-sm flex items-center">
                      <ArrowRightIcon className="h-4 w-4 mx-2" />
                      {input.ratioId ? (
                        <span>
                          Distributes according to <span className="font-medium">{getRatioNameById(input.ratioId)}</span>
                        </span>
                      ) : (
                        <span>Select a ratio to see distribution</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={addAllocationInput}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Another Input
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Distribution Preview</h3>
              
              {allocationInputs.some(input => input.ratioId !== null) ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        {allocationInputs.filter(input => input.ratioId).map((input, index) => (
                          <TableHead key={input.id} className="text-right">
                            Input #{index + 1}
                          </TableHead>
                        ))}
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Calculation preview would go here */}
                      <TableRow>
                        <TableCell colSpan={allocationInputs.filter(input => input.ratioId).length + 2} className="text-center py-4">
                          <p className="text-muted-foreground">
                            Distribution preview will be available when allocation is saved
                          </p>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Select ratios for your inputs to see the distribution preview
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAllocation}>
              Save Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
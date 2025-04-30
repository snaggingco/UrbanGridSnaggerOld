import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash, 
  ArrowRight, 
  Percent, 
  DollarSign,
  Users,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Entity, Ratio, AllocationInput } from '@shared/ratio-types';

interface AllocationInputManagerProps {
  entities: Entity[];
  ratios: Ratio[];
  budgetItemName: string;
  budgetItemCode: string;
  budgetValue: string;
  onInputsChange: (inputs: AllocationInput[]) => void;
  initialInputs?: AllocationInput[];
}

export function AllocationInputManager({
  entities,
  ratios,
  budgetItemName,
  budgetItemCode,
  budgetValue,
  onInputsChange,
  initialInputs = []
}: AllocationInputManagerProps) {
  const [inputs, setInputs] = useState<AllocationInput[]>(initialInputs.length > 0 ? initialInputs : [
    createNewInput(1)
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentInputId, setCurrentInputId] = useState<number | null>(null);
  const [ratioSelection, setRatioSelection] = useState<{
    ratioId: number | null;
    entityId: number | null;
    allocationMethod: 'ratio' | 'exclusive' | null;
  }>({
    ratioId: null,
    entityId: null,
    allocationMethod: null
  });
  
  // Default unit options
  const unitOptions = [
    'Staffs',
    'Hours',
    'Persons',
    'Units',
    'Points',
    'AED',
    'Sqm',
    'Sqft',
    'Custom'
  ];
  
  // Function to create a new input
  function createNewInput(id: number): AllocationInput {
    return {
      id,
      name: `Input ${id}`,
      value: '',
      unit: 'Staffs',
      ratioId: null,
      ratioName: null,
      entityId: null,
      entityValues: {},
      percentages: {}
    };
  }
  
  // Add a new input
  const addInput = () => {
    const newId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;
    const newInput = createNewInput(newId);
    const updatedInputs = [...inputs, newInput];
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
  };
  
  // Remove an input
  const removeInput = (id: number) => {
    const updatedInputs = inputs.filter(input => input.id !== id);
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
  };
  
  // Update input value
  const updateInputValue = (id: number, value: string) => {
    const updatedInputs = inputs.map(input => {
      if (input.id === id) {
        const updatedInput = { ...input, value };
        // Recalculate entity values based on the new input value
        if (updatedInput.ratioId) {
          // Ratio-based allocation
          const ratio = ratios.find(r => r.id === updatedInput.ratioId);
          if (ratio && ratio.entityValues) {
            const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, val) => sum + (val as number), 0);
            
            // Calculate entity values based on ratio
            entities.forEach(entity => {
              const ratioValue = ratio.entityValues?.[entity.id] || 0;
              const percentage = totalRatioValue > 0 ? (ratioValue / totalRatioValue) * 100 : 0;
              const entityValue = (percentage / 100) * parseFloat(updatedInput.value || '0');
              
              updatedInput.entityValues[entity.id] = entityValue.toFixed(2);
              updatedInput.percentages[entity.id] = percentage;
            });
          }
        } else if (updatedInput.entityId) {
          // Exclusive entity allocation
          entities.forEach(entity => {
            const entityValue = entity.id === updatedInput.entityId ? parseFloat(updatedInput.value || '0') : 0;
            const percentage = entity.id === updatedInput.entityId ? 100 : 0;
            
            updatedInput.entityValues[entity.id] = entityValue.toFixed(2);
            updatedInput.percentages[entity.id] = percentage;
          });
        }
        
        return updatedInput;
      }
      return input;
    });
    
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
  };
  
  // Update input unit
  const updateInputUnit = (id: number, unit: string) => {
    const updatedInputs = inputs.map(input => 
      input.id === id ? { ...input, unit } : input
    );
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
  };
  
  // Open ratio selection dialog
  const openRatioDialog = (inputId: number) => {
    setCurrentInputId(inputId);
    const input = inputs.find(i => i.id === inputId);
    
    if (input) {
      setRatioSelection({
        ratioId: input.ratioId,
        entityId: input.entityId,
        allocationMethod: input.ratioId ? 'ratio' : (input.entityId ? 'exclusive' : null)
      });
    } else {
      setRatioSelection({
        ratioId: null,
        entityId: null,
        allocationMethod: null
      });
    }
    
    setDialogOpen(true);
  };
  
  // Apply ratio selection to input
  const applyRatioSelection = () => {
    if (currentInputId === null) return;
    
    const updatedInputs = inputs.map(input => {
      if (input.id === currentInputId) {
        let updatedInput = { 
          ...input, 
          ratioId: null, 
          ratioName: null, 
          entityId: null,
          entityValues: {},
          percentages: {}
        };
        
        if (ratioSelection.allocationMethod === 'ratio' && ratioSelection.ratioId) {
          // Ratio-based allocation
          const ratio = ratios.find(r => r.id === ratioSelection.ratioId);
          if (ratio && ratio.entityValues) {
            updatedInput.ratioId = ratio.id;
            updatedInput.ratioName = ratio.name;
            
            const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, val) => sum + (val as number), 0);
            
            // Calculate entity values based on ratio
            entities.forEach(entity => {
              const ratioValue = ratio.entityValues?.[entity.id] || 0;
              const percentage = totalRatioValue > 0 ? (ratioValue / totalRatioValue) * 100 : 0;
              const entityValue = (percentage / 100) * parseFloat(updatedInput.value || '0');
              
              updatedInput.entityValues[entity.id] = entityValue.toFixed(2);
              updatedInput.percentages[entity.id] = percentage;
            });
          }
        } else if (ratioSelection.allocationMethod === 'exclusive' && ratioSelection.entityId) {
          // Exclusive entity allocation
          const entity = entities.find(e => e.id === ratioSelection.entityId);
          if (entity) {
            updatedInput.entityId = entity.id;
            updatedInput.ratioName = `Exclusive to ${entity.name}`;
            
            // Allocate 100% to selected entity, 0% to others
            entities.forEach(e => {
              const entityValue = e.id === entity.id ? parseFloat(updatedInput.value || '0') : 0;
              const percentage = e.id === entity.id ? 100 : 0;
              
              updatedInput.entityValues[e.id] = entityValue.toFixed(2);
              updatedInput.percentages[e.id] = percentage;
            });
          }
        }
        
        return updatedInput;
      }
      return input;
    });
    
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
    setDialogOpen(false);
  };
  
  // Calculate totals for each entity
  const calculateTotals = () => {
    const totals: Record<number, number> = {};
    const percentages: Record<number, number> = {};
    let grandTotal = 0;
    
    // Initialize totals
    entities.forEach(entity => {
      totals[entity.id] = 0;
    });
    
    // Sum up values from all inputs
    inputs.forEach(input => {
      entities.forEach(entity => {
        const value = parseFloat(input.entityValues[entity.id] || '0');
        totals[entity.id] += value;
        grandTotal += value;
      });
    });
    
    // Calculate percentages
    if (grandTotal > 0) {
      entities.forEach(entity => {
        percentages[entity.id] = (totals[entity.id] / grandTotal) * 100;
      });
    }
    
    return { totals, percentages, grandTotal };
  };
  
  const { totals, percentages, grandTotal } = calculateTotals();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDownRight className="mr-2 h-5 w-5 text-muted-foreground" />
            Input Allocation Manager
          </CardTitle>
          <CardDescription>
            Create and manage inputs directly, then distribute them across entities based on ratios. 
            Focus on allocating input values rather than budget splitting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Input Management */}
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Input</TableHead>
                    <TableHead className="w-[180px]">Value & Unit</TableHead>
                    <TableHead className="w-[250px]">Allocation Method</TableHead>
                    {entities.map(entity => (
                      <TableHead key={entity.id} className="text-center">
                        {entity.name}
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inputs.map(input => (
                    <TableRow key={input.id}>
                      <TableCell className="font-medium">
                        Input {input.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={input.value}
                            onChange={(e) => updateInputValue(input.id, e.target.value)}
                            className="w-20"
                          />
                          <Select
                            value={input.unit}
                            onValueChange={(value) => updateInputUnit(input.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitOptions.map(unit => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => openRatioDialog(input.id)}
                        >
                          {input.ratioName ? (
                            <span>{input.ratioName}</span>
                          ) : (
                            <span className="text-muted-foreground">Select allocation method</span>
                          )}
                        </Button>
                      </TableCell>
                      
                      {/* Entity allocation values */}
                      {entities.map(entity => {
                        const value = parseFloat(input.entityValues[entity.id] || '0');
                        const percentage = input.percentages[entity.id] || 0;
                        
                        return (
                          <TableCell key={entity.id} className="text-center">
                            <div className="flex flex-col">
                              <span>{value.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}
                      
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInput(input.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Add new input button */}
                  <TableRow>
                    <TableCell colSpan={4 + entities.length} className="text-center py-4">
                      <Button variant="outline" onClick={addInput}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Input
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Totals row */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Totals</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{inputs.reduce((sum, input) => sum + parseFloat(input.value || '0'), 0)}</span>
                        <span className="text-muted-foreground">{inputs[0]?.unit || ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Percent className="h-3 w-3 mr-1" />
                        Allocation Results
                      </Badge>
                    </TableCell>
                    
                    {/* Entity totals */}
                    {entities.map(entity => (
                      <TableCell key={entity.id} className="text-center">
                        <div className="flex flex-col">
                          <span className="font-bold">{totals[entity.id].toFixed(2)}</span>
                          <span className="text-xs font-medium text-green-600">
                            ({percentages[entity.id].toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                    ))}
                    
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ratio Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Allocation Method</DialogTitle>
            <DialogDescription>
              Choose how to allocate the input across entities
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer hover:border-primary",
                  ratioSelection.allocationMethod === 'ratio' ? "border-primary bg-primary/5" : ""
                )}
                onClick={() => setRatioSelection(prev => ({
                  ...prev,
                  allocationMethod: 'ratio',
                  entityId: null
                }))}
              >
                <h3 className="font-medium mb-2">Ratio-Based Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Distribute using a predefined ratio from your ratio management system
                </p>
              </div>
              
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer hover:border-primary",
                  ratioSelection.allocationMethod === 'exclusive' ? "border-primary bg-primary/5" : ""
                )}
                onClick={() => setRatioSelection(prev => ({
                  ...prev,
                  allocationMethod: 'exclusive',
                  ratioId: null
                }))}
              >
                <h3 className="font-medium mb-2">Exclusive Entity Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Assign 100% of the input to a single entity
                </p>
              </div>
            </div>
            
            {ratioSelection.allocationMethod === 'ratio' && (
              <div className="space-y-4">
                <Label>Select Ratio</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {ratios.map(ratio => (
                    <div
                      key={ratio.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:border-primary flex justify-between items-center",
                        ratioSelection.ratioId === ratio.id ? "border-primary bg-primary/5" : ""
                      )}
                      onClick={() => setRatioSelection(prev => ({
                        ...prev,
                        ratioId: ratio.id
                      }))}
                    >
                      <div>
                        <h4 className="font-medium">{ratio.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {ratio.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {ratio.ratioType || 'Custom'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {ratioSelection.allocationMethod === 'exclusive' && (
              <div className="space-y-4">
                <Label>Select Entity</Label>
                <div className="grid grid-cols-1 gap-2">
                  {entities.map(entity => (
                    <div
                      key={entity.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:border-primary",
                        ratioSelection.entityId === entity.id ? "border-primary bg-primary/5" : ""
                      )}
                      onClick={() => setRatioSelection(prev => ({
                        ...prev,
                        entityId: entity.id
                      }))}
                    >
                      <h4 className="font-medium">{entity.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        100% allocation to this entity
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyRatioSelection}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
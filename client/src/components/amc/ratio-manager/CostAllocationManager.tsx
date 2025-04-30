import React, { useState } from 'react';
import { Plus, Save, Trash, Calculator } from 'lucide-react';
import { RatioManagerProvider, RatioManagerContext } from './RatioManagerProvider';
import { Ratio, useRatioManager } from './RatioManagerProvider';
import { RatioTable } from './RatioTable';
import { RatioVisualizer } from './RatioVisualizer';
import RatioSelect from './RatioSelect'; // Import the new RatioSelect component
import useAllocationEngine from './useAllocationEngine';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

/**
 * Component for managing cost allocations for a budget item
 * This component handles the full allocation lifecycle:
 * 1. Create inputs (values to allocate)
 * 2. Assign ratios to inputs (how to distribute)
 * 3. View and save the allocation
 */

export interface CostAllocationManagerProps {
  contractId: string;
  entities: any[];
  budgetItem: any;
  existingAllocation?: any;
  onSaveAllocation: (allocationData: any) => Promise<void>;
  ratios?: Ratio[]; // Optional prop to directly pass ratios
}

export const CostAllocationManager: React.FC<CostAllocationManagerProps> = ({
  contractId,
  entities,
  budgetItem,
  existingAllocation,
  onSaveAllocation,
  ratios = [] // Default to empty array if not provided
}) => {
  console.log('CostAllocationManager received ratios:', ratios);
  
  // Create a custom RatioManagerProvider that uses the provided ratios
  const CustomRatioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // If ratios are provided directly, use a simplified provider
    if (ratios && ratios.length > 0) {
      console.log(`Using ${ratios.length} provided ratios instead of fetching from API`);
      return (
        <RatioManagerContext.Provider 
          value={{
            ratios,
            loading: false,
            error: null,
            createRatio: async (ratio: Omit<Ratio, 'id'>) => {
              console.log('Create ratio called but using static data');
              return { ...ratio, id: `static-${Date.now()}` } as Ratio;
            },
            updateRatio: async (id: string, update: Partial<Ratio>) => {
              console.log('Update ratio called but using static data');
              return { id, ...update } as Ratio;
            }, 
            deleteRatio: async () => {
              console.log('Delete ratio called but using static data');
            },
            getCoreRatios: () => ratios.filter(r => r.isCore),
            getDerivedRatios: () => ratios.filter(r => !r.isCore && r.ratioType === 'derived'),
            getCombinedRatios: () => ratios.filter(r => !r.isCore && ['combined', 'exclusive'].includes(r.ratioType as string)),
            calculateAllocation: () => ({}),
            combineRatios: () => ({})
          }}
        >
          {children}
        </RatioManagerContext.Provider>
      );
    }
    
    // Otherwise, use the normal provider with API fetching
    return (
      <RatioManagerProvider contractId={contractId}>
        {children}
      </RatioManagerProvider>
    );
  };

  return (
    <CustomRatioProvider>
      <CostAllocationContent 
        contractId={contractId}
        entities={entities}
        budgetItem={budgetItem}
        existingAllocation={existingAllocation}
        onSaveAllocation={onSaveAllocation}
      />
    </CustomRatioProvider>
  );
};

// Internal component that uses the RatioManager context
const CostAllocationContent: React.FC<CostAllocationManagerProps> = ({
  contractId,
  entities,
  budgetItem,
  existingAllocation,
  onSaveAllocation
}) => {
  const { toast } = useToast();
  const { ratios } = useRatioManager();
  const [activeTab, setActiveTab] = useState('inputs');
  const [selectedRatio, setSelectedRatio] = useState<Ratio | null>(null);
  
  // Initialize the allocation engine with ratios from context
  const {
    inputs,
    distributions,
    totals,
    addInput,
    updateInput,
    removeInput,
    getTotalForEntity,
    getPercentageForEntity,
    getAllInputsTotal,
    getInputDistribution,
    getAllocationData
  } = useAllocationEngine({ entities, ratios });

  // Add new input
  const handleAddInput = () => {
    // Allow creating an input without selecting a ratio first
    const newInput = {
      name: `Input ${inputs.length + 1}`,
      value: 0,
      unit: 'AED',
      description: '',
      ratioId: '' // Empty ratio ID initially
    };
    
    const inputId = addInput(newInput);
    
    // Focus the new input
    setTimeout(() => {
      const element = document.getElementById(`input-value-${inputId}`);
      if (element) {
        element.focus();
      }
    }, 100);
  };

  // Handle input update
  const handleInputChange = (id: string, field: string, value: any) => {
    updateInput(id, { [field]: value });
  };

  // Save the entire allocation directly without requiring a contract ID
  const handleSave = async () => {
    try {
      // Check for inputs with missing ratios
      const inputsWithoutRatio = inputs.filter(input => !input.ratioId || input.ratioId === '' || input.ratioId === 'none');
      if (inputsWithoutRatio.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing ratios",
          description: `Please select a ratio for all inputs before saving. ${inputsWithoutRatio.length} input(s) need a ratio.`
        });
        return;
      }

      // Check if there are any inputs
      if (inputs.length === 0) {
        toast({
          variant: "destructive",
          title: "No inputs",
          description: "Please add at least one input before saving."
        });
        return;
      }

      // Format allocation data
      const allocationData = {
        budgetItemId: budgetItem.id,
        budgetValue: budgetItem.budgetValue,
        allocationInputs: inputs.map(input => {
          const distribution = distributions[input.id];
          return {
            ...input,
            entityValues: Object.entries(distribution.entityAllocations).reduce(
              (values, [entityId, allocation]) => {
                values[entityId] = allocation.value.toFixed(2);
                return values;
              }, 
              {} as Record<string, string>
            )
          };
        }),
        notes: budgetItem.notes || ''
      };
      
      // Pass the data to the parent component for saving
      await onSaveAllocation(allocationData);
      
      toast({
        title: "Allocation saved",
        description: "The allocation has been successfully saved."
      });
    } catch (error: any) {
      console.error('Error saving allocation:', error);
      toast({
        variant: "destructive",
        title: "Failed to save allocation",
        description: "There was an error saving the allocation. Please try again."
      });
    }
  };

  // Load existing allocation data
  React.useEffect(() => {
    if (existingAllocation && existingAllocation.allocationInputs) {
      // Clear existing inputs first
      inputs.forEach(input => removeInput(input.id));
      
      // Add each input from existing allocation
      existingAllocation.allocationInputs.forEach((input: any) => {
        addInput({
          name: input.name,
          value: parseFloat(input.value),
          unit: input.unit,
          description: input.description || '',
          ratioId: input.ratioId
        });
      });
    }
  }, [existingAllocation]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* Simplified header without redundant budget item details */}
        <h2 className="text-2xl font-bold">
          Cost Allocation Manager
        </h2>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Allocation
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="inputs">Allocation Inputs</TabsTrigger>
          <TabsTrigger value="ratios">Ratio Management</TabsTrigger>
          <TabsTrigger value="summary">Allocation Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inputs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Input Values</span>
                <Button onClick={handleAddInput}>
                  <Plus className="mr-2 h-4 w-4" /> Add Input
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inputs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No inputs added yet. Click "Add Input" to create a new input.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Ratio</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inputs.map(input => {
                      const distribution = distributions[input.id];
                      return (
                        <TableRow key={input.id}>
                          <TableCell>
                            <Input
                              value={input.name}
                              onChange={(e) => handleInputChange(input.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`input-value-${input.id}`}
                              type="number"
                              value={input.value}
                              onChange={(e) => handleInputChange(
                                input.id, 
                                'value', 
                                parseFloat(e.target.value) || 0
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={input.unit}
                              onValueChange={(value) => handleInputChange(input.id, 'unit', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AED">AED</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="sqm">m²</SelectItem>
                                <SelectItem value="sqft">ft²</SelectItem>
                                <SelectItem value="hrs">Hours</SelectItem>
                                <SelectItem value="qty">Quantity</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <RatioSelect 
                              value={input.ratioId ? parseInt(input.ratioId.toString()) : null} 
                              onChange={(value) => handleInputChange(input.id, 'ratioId', value)}
                              setSelectedRatio={setSelectedRatio}
                              setActiveTab={setActiveTab}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => removeInput(input.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => setActiveTab('distribution')}
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {inputs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Input Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      {inputs.map(input => (
                        <TableHead key={input.id}>{input.name}</TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map(entity => (
                      <TableRow key={entity.id}>
                        <TableCell className="font-medium">{entity.name}</TableCell>
                        {inputs.map(input => {
                          const distribution = distributions[input.id];
                          const allocation = distribution?.entityAllocations[entity.id];
                          return (
                            <TableCell key={`${entity.id}-${input.id}`}>
                              {allocation ? allocation.value.toFixed(2) : '0.00'}
                            </TableCell>
                          );
                        })}
                        <TableCell className="font-semibold">
                          {getTotalForEntity(entity.id).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getPercentageForEntity(entity.id).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {inputs.map(input => {
                        const distribution = distributions[input.id];
                        return (
                          <TableCell key={`total-${input.id}`} className="font-bold">
                            {distribution ? distribution.totalAllocated.toFixed(2) : '0.00'}
                          </TableCell>
                        );
                      })}
                      <TableCell className="font-bold">
                        {Object.values(totals).reduce((sum, val) => sum + val, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold">100.00%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="ratios">
          <RatioTable 
            contractId={contractId} 
            entities={entities} 
            onRatioSelect={setSelectedRatio} 
            selectable
          />
          
          {selectedRatio && (
            <div className="mt-6">
              <RatioVisualizer ratio={selectedRatio} entities={entities} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Allocation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Budget Item</Label>
                  <div className="font-semibold">{budgetItem?.code} - {budgetItem?.description}</div>
                </div>
                
                {/* Removed redundant Total Budget Value section */}
                
                <div>
                  <Label>Total Allocated</Label>
                  <div className="font-semibold">
                    {Object.values(totals).reduce((sum, val) => sum + val, 0).toFixed(2)} AED
                  </div>
                </div>
                
                <div>
                  <Label>Number of Inputs</Label>
                  <div className="font-semibold">{inputs.length}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Entity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Allocated Amount</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map(entity => (
                      <TableRow key={entity.id}>
                        <TableCell className="font-medium">{entity.name}</TableCell>
                        <TableCell>{getTotalForEntity(entity.id).toFixed(2)} AED</TableCell>
                        <TableCell>{getPercentageForEntity(entity.id).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Internal component for ratio management and visualization

export default CostAllocationManager;
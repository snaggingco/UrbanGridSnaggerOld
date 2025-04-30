import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from "@/components/ui/alert-dialog"
import { AreaChart, BarChart, ChartContainer, LineChart, PieChart } from '@/components/ui/charts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, RefreshCw, Calculator } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import AllocationVennDiagram from './AllocationVennDiagram';

// Types
type AmcContract = {
  id: number;
  name: string;
  description: string | null;
  notes: string | null;
  budgetValue: string;
  primaryUomType: string;
  secondaryUomType: string | null;
  secondaryUomWeight: string | null;
  startDate: string;
  endDate: string;
  coverageArea: string | null;
  projectId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  reraBudgetItemId: number | null;
};

type ProjectEntity = {
  id: number;
  name: string;
  type: 'residential' | 'retail' | 'office' | 'hotel' | 'other';
  suitArea: string;
  totalComponentArea: string | null;
  proportionalShare: string | null;
  unitCount: string | null;
  projectId: number;
};

type SharedArea = {
  id: number;
  name: string;
  type: string;
  area: string;
  description: string | null;
  projectId: number;
};

type Beneficiary = {
  id: number;
  sharedAreaId: number;
  entityId: number;
  allocationPercentage: string;
};

type UomValue = {
  id: number;
  entityId: number;
  amcContractId: number;
  value: string;
  unit: string;
  uomType: string;
  notes: string | null;
  isExcluded: boolean;
};

type Allocation = {
  id: number;
  entityId: number;
  amcContractId: number;
  allocationPercentage: string;
  allocatedAmount: string | null;
  calculationNotes: string | null;
};

type BudgetItem = {
  id: number;
  code: string;
  description: string;
  category: string;
  subCategory: string;
  notes: string | null;
};

type AmcSharedAllocation = {
  entityIds: number[];
  percentage: number;
  label?: string;
  color?: string;
};

// Form schemas
const contractFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  budgetValue: z.string().min(1, 'Budget value is required'),
  primaryUomType: z.string().min(1, 'Primary UOM type is required'),
  secondaryUomType: z.string().optional().nullable(),
  secondaryUomWeight: z.string().optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  coverageArea: z.string().optional().nullable(),
  reraBudgetItemId: z.number().optional().nullable(),
  projectId: z.number(),
});

const entityFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['residential', 'retail', 'office', 'hotel', 'other']),
  suitArea: z.string().min(1, 'Suit area is required'),
  totalComponentArea: z.string().optional().nullable(),
  proportionalShare: z.string().optional().nullable(),
  unitCount: z.string().optional().nullable(),
  projectId: z.number(),
});

const sharedAreaFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  area: z.string().min(1, 'Area is required'),
  description: z.string().optional().nullable(),
  projectId: z.number(),
});

const beneficiaryFormSchema = z.object({
  sharedAreaId: z.number(),
  entityId: z.number(),
  allocationPercentage: z.string().min(1, 'Allocation percentage is required'),
});

const uomValueFormSchema = z.object({
  entityId: z.number(),
  amcContractId: z.number(),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  uomType: z.string().min(1, 'UOM type is required'),
  notes: z.string().optional().nullable(),
  isExcluded: z.boolean().optional().default(false),
});

// Main component
const AmcContractManager: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContract, setSelectedContract] = useState<AmcContract | null>(null);
  const [showNewContractForm, setShowNewContractForm] = useState(false);
  const [showNewEntityForm, setShowNewEntityForm] = useState(false);
  const [showNewSharedAreaForm, setShowNewSharedAreaForm] = useState(false);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [showNewUomValueForm, setShowNewUomValueForm] = useState(false);
  const [selectedSharedArea, setSelectedSharedArea] = useState<SharedArea | null>(null);
  const [allocationData, setAllocationData] = useState<AmcSharedAllocation[]>([]);
  
  // Queries
  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['/api/amc/contracts'],
    enabled: !!projectId,
  });
  
  const { data: entities = [], isLoading: isLoadingEntities } = useQuery({
    queryKey: ['/api/amc/contracts', selectedContract?.id, 'entities'],
    queryFn: () => apiRequest(`/api/amc/contracts/${selectedContract?.id}/entities`),
    enabled: !!selectedContract,
  });
  
  const { data: sharedAreas = [], isLoading: isLoadingSharedAreas } = useQuery({
    queryKey: ['/api/amc/contracts', selectedContract?.id, 'shared-areas'],
    queryFn: () => apiRequest(`/api/amc/contracts/${selectedContract?.id}/shared-areas`),
    enabled: !!selectedContract,
  });
  
  const { data: budgetItems = [], isLoading: isLoadingBudgetItems } = useQuery({
    queryKey: ['/api/amc/budget-items'],
    enabled: showNewContractForm,
  });
  
  const { data: uomValues = [], isLoading: isLoadingUomValues } = useQuery({
    queryKey: ['/api/amc/contracts', selectedContract?.id, 'uom-values'],
    queryFn: () => apiRequest(`/api/amc/contracts/${selectedContract?.id}/uom-values`),
    enabled: !!selectedContract,
  });
  
  const { data: allocations = [], isLoading: isLoadingAllocations } = useQuery({
    queryKey: ['/api/amc/contracts', selectedContract?.id, 'allocations'],
    queryFn: () => apiRequest(`/api/amc/contracts/${selectedContract?.id}/allocations`),
    enabled: !!selectedContract,
  });
  
  // Forms
  const contractForm = useForm<z.infer<typeof contractFormSchema>>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      name: '',
      description: '',
      notes: '',
      budgetValue: '',
      primaryUomType: 'area_based',
      secondaryUomType: null,
      secondaryUomWeight: null,
      startDate: null,
      endDate: null,
      coverageArea: '',
      reraBudgetItemId: null,
      projectId,
    },
  });

  const entityForm = useForm<z.infer<typeof entityFormSchema>>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      name: '',
      type: 'residential',
      suitArea: '',
      totalComponentArea: '',
      proportionalShare: '',
      unitCount: '',
      projectId,
    },
  });

  const sharedAreaForm = useForm<z.infer<typeof sharedAreaFormSchema>>({
    resolver: zodResolver(sharedAreaFormSchema),
    defaultValues: {
      name: '',
      type: 'common_element',
      area: '',
      description: '',
      projectId,
    },
  });

  const beneficiaryForm = useForm<z.infer<typeof beneficiaryFormSchema>>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      sharedAreaId: 0,
      entityId: 0,
      allocationPercentage: '',
    },
  });

  const uomValueForm = useForm<z.infer<typeof uomValueFormSchema>>({
    resolver: zodResolver(uomValueFormSchema),
    defaultValues: {
      entityId: 0,
      amcContractId: 0,
      value: '',
      unit: 'sqm',
      uomType: 'area_based',
      notes: '',
      isExcluded: false,
    },
  });

  // Mutations
  const createContractMutation = useMutation({
    mutationFn: (data: z.infer<typeof contractFormSchema>) => 
      apiRequest('/api/amc/contracts', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The AMC contract has been successfully created.',
      });
      setShowNewContractForm(false);
      contractForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/amc/contracts'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create contract.',
        variant: 'destructive',
      });
    },
  });

  const createEntityMutation = useMutation({
    mutationFn: (data: z.infer<typeof entityFormSchema>) => 
      apiRequest(`/api/amc/contracts/${selectedContract?.id}/entities`, {
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      toast({
        title: 'Entity created',
        description: 'The project entity has been successfully created.',
      });
      setShowNewEntityForm(false);
      entityForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/amc/contracts', selectedContract?.id, 'entities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create entity.',
        variant: 'destructive',
      });
    },
  });

  const createSharedAreaMutation = useMutation({
    mutationFn: (data: z.infer<typeof sharedAreaFormSchema>) => 
      apiRequest(`/api/amc/contracts/${selectedContract?.id}/shared-areas`, {
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      toast({
        title: 'Shared area created',
        description: 'The shared area has been successfully created.',
      });
      setShowNewSharedAreaForm(false);
      sharedAreaForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/amc/contracts', selectedContract?.id, 'shared-areas'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create shared area.',
        variant: 'destructive',
      });
    },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: z.infer<typeof beneficiaryFormSchema>) => 
      apiRequest(`/api/amc/shared-areas/${data.sharedAreaId}/beneficiaries`, {
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      toast({
        title: 'Beneficiary added',
        description: 'The beneficiary has been successfully added to the shared area.',
      });
      setShowNewBeneficiaryForm(false);
      beneficiaryForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/amc/shared-areas', selectedSharedArea?.id, 'beneficiaries'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add beneficiary.',
        variant: 'destructive',
      });
    },
  });

  const createUomValueMutation = useMutation({
    mutationFn: (data: z.infer<typeof uomValueFormSchema>) => 
      apiRequest(`/api/amc/contracts/${selectedContract?.id}/uom-values`, {
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      toast({
        title: 'UOM value added',
        description: 'The UOM value has been successfully added.',
      });
      setShowNewUomValueForm(false);
      uomValueForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/amc/contracts', selectedContract?.id, 'uom-values'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add UOM value.',
        variant: 'destructive',
      });
    },
  });

  const calculateAllocationsMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/amc/contracts/${selectedContract?.id}/calculate`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast({
        title: 'Allocations calculated',
        description: 'The allocations have been successfully calculated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/amc/contracts', selectedContract?.id, 'allocations'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to calculate allocations.',
        variant: 'destructive',
      });
    },
  });

  // Effects
  useEffect(() => {
    if (selectedContract) {
      // Set the default value for UOM form
      uomValueForm.setValue('amcContractId', selectedContract.id);
    }
  }, [selectedContract, uomValueForm]);

  useEffect(() => {
    if (selectedSharedArea) {
      // Set the default value for beneficiary form
      beneficiaryForm.setValue('sharedAreaId', selectedSharedArea.id);
    }
  }, [selectedSharedArea, beneficiaryForm]);

  // Convert allocations to the format required by the allocation visualization
  useEffect(() => {
    if (entities.length > 0 && allocations.length > 0) {
      const allocationVennData: AmcSharedAllocation[] = [];
      
      // Direct allocations (one entity per allocation)
      for (const entity of entities) {
        const entityAllocation = allocations.find(a => a.entityId === entity.id);
        if (entityAllocation) {
          allocationVennData.push({
            entityIds: [entity.id],
            percentage: parseFloat(entityAllocation.allocationPercentage),
            label: entity.name,
          });
        }
      }
      
      setAllocationData(allocationVennData);
    }
  }, [entities, allocations]);

  // Handlers
  const handleCreateContract = (data: z.infer<typeof contractFormSchema>) => {
    createContractMutation.mutate(data);
  };

  const handleCreateEntity = (data: z.infer<typeof entityFormSchema>) => {
    createEntityMutation.mutate(data);
  };

  const handleCreateSharedArea = (data: z.infer<typeof sharedAreaFormSchema>) => {
    createSharedAreaMutation.mutate(data);
  };

  const handleCreateBeneficiary = (data: z.infer<typeof beneficiaryFormSchema>) => {
    createBeneficiaryMutation.mutate(data);
  };

  const handleCreateUomValue = (data: z.infer<typeof uomValueFormSchema>) => {
    createUomValueMutation.mutate(data);
  };

  const handleCalculateAllocations = () => {
    calculateAllocationsMutation.mutate();
  };

  const handleContractSelect = (contract: AmcContract) => {
    setSelectedContract(contract);
    setActiveTab('overview');
  };

  const handleAllocationChange = (newAllocations: AmcSharedAllocation[]) => {
    setAllocationData(newAllocations);
    // TODO: Save allocation changes to the backend if needed
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>AMC Contracts</CardTitle>
              <CardDescription>Annual Maintenance Contracts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingContracts ? (
                <div className="py-4 text-center">Loading contracts...</div>
              ) : contracts.length === 0 ? (
                <div className="py-4 text-center text-gray-500">No contracts found</div>
              ) : (
                <div className="space-y-2">
                  {contracts.map((contract: AmcContract) => (
                    <div
                      key={contract.id}
                      className={`p-2 rounded cursor-pointer hover:bg-slate-100 ${
                        selectedContract?.id === contract.id ? 'bg-slate-100 font-medium' : ''
                      }`}
                      onClick={() => handleContractSelect(contract)}
                    >
                      {contract.name}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowNewContractForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New Contract
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          {selectedContract ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedContract.name}</h2>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="shared-areas">Shared Areas</TabsTrigger>
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="allocations">Allocations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Details</CardTitle>
                      <CardDescription>AMC contract information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium">Description</h3>
                          <p className="text-gray-600">{selectedContract.description || 'No description'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Budget Value</h3>
                          <p className="text-gray-600">AED {selectedContract.budgetValue}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Primary UOM Type</h3>
                          <p className="text-gray-600">{selectedContract.primaryUomType}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Secondary UOM Type</h3>
                          <p className="text-gray-600">{selectedContract.secondaryUomType || 'None'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Start Date</h3>
                          <p className="text-gray-600">
                            {selectedContract.startDate ? format(new Date(selectedContract.startDate), 'PPP') : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">End Date</h3>
                          <p className="text-gray-600">
                            {selectedContract.endDate ? format(new Date(selectedContract.endDate), 'PPP') : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Coverage Area</h3>
                          <p className="text-gray-600">{selectedContract.coverageArea || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Notes</h3>
                          <p className="text-gray-600">{selectedContract.notes || 'No notes'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="entities">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Project Entities</CardTitle>
                          <CardDescription>Entities in this development</CardDescription>
                        </div>
                        <Button onClick={() => setShowNewEntityForm(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Entity
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingEntities ? (
                        <div className="py-4 text-center">Loading entities...</div>
                      ) : entities.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">No entities found</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Suit Area</TableHead>
                              <TableHead>Proportional Share</TableHead>
                              <TableHead>Unit Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entities.map((entity: ProjectEntity) => (
                              <TableRow key={entity.id}>
                                <TableCell className="font-medium">{entity.name}</TableCell>
                                <TableCell>{entity.type}</TableCell>
                                <TableCell>{entity.suitArea}</TableCell>
                                <TableCell>{entity.proportionalShare || 'N/A'}</TableCell>
                                <TableCell>{entity.unitCount || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shared-areas">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Shared Areas</CardTitle>
                          <CardDescription>Common areas shared between entities</CardDescription>
                        </div>
                        <Button onClick={() => setShowNewSharedAreaForm(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Shared Area
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSharedAreas ? (
                        <div className="py-4 text-center">Loading shared areas...</div>
                      ) : sharedAreas.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">No shared areas found</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Area</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sharedAreas.map((area: SharedArea) => (
                              <TableRow key={area.id}>
                                <TableCell className="font-medium">{area.name}</TableCell>
                                <TableCell>{area.type}</TableCell>
                                <TableCell>{area.area}</TableCell>
                                <TableCell>{area.description || 'N/A'}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSharedArea(area);
                                      setShowNewBeneficiaryForm(true);
                                    }}
                                  >
                                    Add Beneficiary
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="measurements">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>UOM Values</CardTitle>
                          <CardDescription>Unit of measurement values</CardDescription>
                        </div>
                        <Button onClick={() => setShowNewUomValueForm(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add UOM Value
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUomValues ? (
                        <div className="py-4 text-center">Loading UOM values...</div>
                      ) : uomValues.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">No UOM values found</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Entity</TableHead>
                              <TableHead>UOM Type</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Notes</TableHead>
                              <TableHead>Excluded</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uomValues.map((uomValue: UomValue) => (
                              <TableRow key={uomValue.id}>
                                <TableCell>
                                  {entities.find(e => e.id === uomValue.entityId)?.name || `Entity ${uomValue.entityId}`}
                                </TableCell>
                                <TableCell>{uomValue.uomType}</TableCell>
                                <TableCell>{uomValue.value}</TableCell>
                                <TableCell>{uomValue.unit}</TableCell>
                                <TableCell>{uomValue.notes || 'N/A'}</TableCell>
                                <TableCell>{uomValue.isExcluded ? 'Yes' : 'No'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="allocations">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Cost Allocations</CardTitle>
                          <CardDescription>AMC cost allocation results</CardDescription>
                        </div>
                        <Button onClick={handleCalculateAllocations}>
                          <Calculator className="mr-2 h-4 w-4" /> Calculate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAllocations ? (
                        <div className="py-4 text-center">Loading allocations...</div>
                      ) : allocations.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">
                          No allocations found. Click "Calculate" to generate allocations.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Entity</TableHead>
                                <TableHead>Allocation %</TableHead>
                                <TableHead>Allocated Amount</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allocations.map((allocation: Allocation) => (
                                <TableRow key={allocation.id}>
                                  <TableCell>
                                    {entities.find(e => e.id === allocation.entityId)?.name || `Entity ${allocation.entityId}`}
                                  </TableCell>
                                  <TableCell>{parseFloat(allocation.allocationPercentage).toFixed(2)}%</TableCell>
                                  <TableCell>
                                    {allocation.allocatedAmount 
                                      ? `AED ${parseFloat(allocation.allocatedAmount).toFixed(2)}` 
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>{allocation.calculationNotes || 'N/A'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          
                          {allocations.length > 0 && entities.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-medium mb-4">Allocation Chart</h3>
                                <div className="h-80">
                                  <ChartContainer>
                                    <PieChart
                                      data={allocations.map(a => ({
                                        name: entities.find(e => e.id === a.entityId)?.name || `Entity ${a.entityId}`,
                                        value: parseFloat(a.allocationPercentage)
                                      }))}
                                    />
                                  </ChartContainer>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-medium mb-4">Allocation Distribution</h3>
                                <div className="h-80">
                                  <ChartContainer>
                                    <BarChart
                                      data={allocations.map(a => ({
                                        name: entities.find(e => e.id === a.entityId)?.name || `Entity ${a.entityId}`,
                                        value: parseFloat(a.allocationPercentage)
                                      }))}
                                    />
                                  </ChartContainer>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {allocations.length > 0 && entities.length > 0 && (
                            <div className="mt-8">
                              <h3 className="text-lg font-medium mb-4">Visual Allocation Model</h3>
                              <AllocationVennDiagram
                                entities={entities}
                                initialAllocations={allocationData}
                                onAllocationChange={handleAllocationChange}
                                readOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No Contract Selected</h3>
                  <p className="text-gray-500 mb-6">Select a contract from the list or create a new one.</p>
                  <Button onClick={() => setShowNewContractForm(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create AMC Contract
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Contract Dialog */}
      {showNewContractForm && (
        <AlertDialog open={showNewContractForm} onOpenChange={setShowNewContractForm}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Create New AMC Contract</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the details for the new Annual Maintenance Contract.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...contractForm}>
              <form onSubmit={contractForm.handleSubmit(handleCreateContract)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={contractForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contract name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="budgetValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Value (AED)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter budget value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="primaryUomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary UOM Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select UOM type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="area_based">Area Based</SelectItem>
                            <SelectItem value="headcount_based">Headcount Based</SelectItem>
                            <SelectItem value="asset_based">Asset Based</SelectItem>
                            <SelectItem value="load_based">Load Based</SelectItem>
                            <SelectItem value="consumption_based">Consumption Based</SelectItem>
                            <SelectItem value="time_based">Time Based</SelectItem>
                            <SelectItem value="parking_based">Parking Based</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="secondaryUomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary UOM Type (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select secondary UOM type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="area_based">Area Based</SelectItem>
                            <SelectItem value="headcount_based">Headcount Based</SelectItem>
                            <SelectItem value="asset_based">Asset Based</SelectItem>
                            <SelectItem value="load_based">Load Based</SelectItem>
                            <SelectItem value="consumption_based">Consumption Based</SelectItem>
                            <SelectItem value="time_based">Time Based</SelectItem>
                            <SelectItem value="parking_based">Parking Based</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={contractForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter contract description" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter additional notes" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={createContractMutation.isPending}>
                      {createContractMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : 'Create Contract'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Create Entity Dialog */}
      {showNewEntityForm && (
        <AlertDialog open={showNewEntityForm} onOpenChange={setShowNewEntityForm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Project Entity</AlertDialogTitle>
              <AlertDialogDescription>
                Add a new entity to the project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...entityForm}>
              <form onSubmit={entityForm.handleSubmit(handleCreateEntity)} className="space-y-4">
                <FormField
                  control={entityForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter entity name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={entityForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={entityForm.control}
                  name="suitArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suit Area (sqm)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter suit area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={entityForm.control}
                  name="totalComponentArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Component Area (sqm)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter total component area" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={entityForm.control}
                  name="proportionalShare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proportional Share (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter proportional share" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={entityForm.control}
                  name="unitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Count</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter unit count" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={createEntityMutation.isPending}>
                      {createEntityMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : 'Add Entity'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Create Shared Area Dialog */}
      {showNewSharedAreaForm && (
        <AlertDialog open={showNewSharedAreaForm} onOpenChange={setShowNewSharedAreaForm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Shared Area</AlertDialogTitle>
              <AlertDialogDescription>
                Add a new shared area to the project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...sharedAreaForm}>
              <form onSubmit={sharedAreaForm.handleSubmit(handleCreateSharedArea)} className="space-y-4">
                <FormField
                  control={sharedAreaForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter area name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sharedAreaForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="principal_common">Principal Common Element</SelectItem>
                          <SelectItem value="common_element">Common Element</SelectItem>
                          <SelectItem value="limited_common">Limited Common Element</SelectItem>
                          <SelectItem value="exclusive_use">Exclusive Use Area</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sharedAreaForm.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Size (sqm)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter area size" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sharedAreaForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter area description" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={createSharedAreaMutation.isPending}>
                      {createSharedAreaMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : 'Add Shared Area'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Create Beneficiary Dialog */}
      {showNewBeneficiaryForm && selectedSharedArea && (
        <AlertDialog open={showNewBeneficiaryForm} onOpenChange={setShowNewBeneficiaryForm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Beneficiary</AlertDialogTitle>
              <AlertDialogDescription>
                Add a beneficiary to {selectedSharedArea.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...beneficiaryForm}>
              <form onSubmit={beneficiaryForm.handleSubmit(handleCreateBeneficiary)} className="space-y-4">
                <FormField
                  control={beneficiaryForm.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entities.map((entity: ProjectEntity) => (
                            <SelectItem key={entity.id} value={entity.id.toString()}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={beneficiaryForm.control}
                  name="allocationPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocation Percentage (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter allocation percentage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={createBeneficiaryMutation.isPending}>
                      {createBeneficiaryMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : 'Add Beneficiary'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Create UOM Value Dialog */}
      {showNewUomValueForm && (
        <AlertDialog open={showNewUomValueForm} onOpenChange={setShowNewUomValueForm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add UOM Value</AlertDialogTitle>
              <AlertDialogDescription>
                Add a unit of measurement value.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...uomValueForm}>
              <form onSubmit={uomValueForm.handleSubmit(handleCreateUomValue)} className="space-y-4">
                <FormField
                  control={uomValueForm.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entities.map((entity: ProjectEntity) => (
                            <SelectItem key={entity.id} value={entity.id.toString()}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uomValueForm.control}
                  name="uomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UOM Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="area_based">Area Based</SelectItem>
                          <SelectItem value="headcount_based">Headcount Based</SelectItem>
                          <SelectItem value="asset_based">Asset Based</SelectItem>
                          <SelectItem value="load_based">Load Based</SelectItem>
                          <SelectItem value="consumption_based">Consumption Based</SelectItem>
                          <SelectItem value="time_based">Time Based</SelectItem>
                          <SelectItem value="parking_based">Parking Based</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uomValueForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uomValueForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter unit (e.g., sqm, persons)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uomValueForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter notes" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Use 'direct' for direct allocation, 'shared:X' for shared area allocation, or 'global' for global shared resources.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uomValueForm.control}
                  name="isExcluded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 focus:ring-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Exclude from Allocations</FormLabel>
                        <FormDescription>
                          If checked, this entity will be excluded from allocation calculations.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={createUomValueMutation.isPending}>
                      {createUomValueMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : 'Add UOM Value'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AmcContractManager;
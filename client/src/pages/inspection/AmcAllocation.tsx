import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'wouter';
import InspectionLayout from '@/components/layouts/InspectionLayout';
import {
  Entity,
  SharedArea,
  SharedAllocation,
  AllocationInput,
  BudgetItemAllocation,
  SelectedBudgetItem,
  Ratio,
  DerivedRatio,
  CombinationRatio,
  standardizeRatio
} from '@shared/ratio-types';

// Define the EntityBeneficiary interface
interface EntityBeneficiary {
  entityId: number;
  allocationPercentage?: string;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  InfoIcon,
  HomeIcon,
  SettingsIcon,
  ArrowRightIcon,
  Building2Icon,
  ListChecksIcon,
  PercentSquareIcon,
  PieChart,
  ClipboardListIcon,
  LandmarkIcon,
  BuildingIcon,
  Scale3dIcon as Scale3Icon,
  ScaleIcon as Scale,
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon as TrashIcon,
  AlertCircle,
  DollarSign,
  BarChart4,
  Table2,
  FileBarChart,
  FileDownIcon,
  CheckCircle2Icon,
  XCircleIcon,
  SearchIcon,
  ArrowUpDownIcon,
  BarChart3Icon as BarChartHorizontalIcon,
  FileTextIcon
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import AmcContractManager from '@/components/amc/AmcContractManager';
import AllocationVennDiagram from '@/components/amc/AllocationVennDiagram';
import EntityAllocationRatioVisualizer from '@/components/amc/EntityAllocationRatioVisualizer';
import EntityManagementForm from '@/components/amc/EntityManagementForm';
import SharedAreaManagementForm from '@/components/amc/SharedAreaManagementForm';
import CoreRatiosDisplay from '@/components/amc/CoreRatiosDisplay';
import { UnifiedRatioDisplay } from '../../components/amc/UnifiedRatioDisplay';

import RatioManagement from '@/components/amc/RatioManagement';
import BudgetItemSelection from '@/components/amc/BudgetItemSelection';
import CostAllocationTab from './CostAllocationTab';
import { RatioMatrix } from '@/components/amc/RatioMatrix';
import ReportGenerator from '@/components/amc/ReportGenerator';
import { apiRequest } from '@/lib/queryClient';

// Types for RERA budget items and entity management
type ReraBudgetItem = {
  id: number;
  code: string;
  description: string;
  category: string;
  subCategory: string;
  isExcludable: boolean;
  notes: string | null;
};

const AmcAllocation: React.FC = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState('project-setup');
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<Record<number, SelectedBudgetItem>>({});
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sharedAreas, setSharedAreas] = useState<SharedArea[]>([]);
  const [selectedBudgetItemId, setSelectedBudgetItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allocations, setAllocations] = useState<SharedAllocation[]>([]);
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [sharedAreaDialogOpen, setSharedAreaDialogOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [editSharedArea, setEditSharedArea] = useState<SharedArea | null>(null);
  const [unitType, setUnitType] = useState<'sqm' | 'sqft'>('sqm');
  const [derivedRatios, setDerivedRatios] = useState<any[]>([]);
  const [combinationRatios, setCombinationRatios] = useState<any[]>(() => {
    console.log("Initializing combinationRatios state");
    return [];
  });
  const [coreRatios, setCoreRatios] = useState<any[]>([]);
  // Project contract state - this will store contract details for the current project
  const [projectContract, setProjectContract] = useState<{id: number} | null>(null);
  
  // State variables for managing dialogs that are shared between components
  const [isManageSpecialAreasDialogOpen, setIsManageSpecialAreasDialogOpen] = useState(false);
  const [isCreateDerivedRatioDialogOpen, setIsCreateDerivedRatioDialogOpen] = useState(false);
  const [selectedRatioForDerived, setSelectedRatioForDerived] = useState<any>(null);
  
  // Helper functions for cost allocation
  const isAllocationComplete = (allocation: BudgetItemAllocation): boolean => {
    if (!allocation) return false;
    
    // Check if allocation has inputs
    if (allocation.allocationInputs && allocation.allocationInputs.length > 0) {
      // Check if there's a budget value to compare against
      const budgetValue = getBudgetValue(allocation);
      if (budgetValue <= 0) return false;
      
      // Calculate total input values
      const totalInputValue = allocation.allocationInputs.reduce(
        (sum: number, input: AllocationInput) => sum + parseFloat(input.value || '0'), 0
      );
      
      // Consider it complete if total inputs are within 2% of the budget value
      return Math.abs(totalInputValue - budgetValue) / budgetValue < 0.02;
    }
    
    return false;
  };
  
  const getBudgetValue = (allocation: BudgetItemAllocation): number => {
    if (!allocation || !allocation.budgetValue) return 0;
    return parseFloat(allocation.budgetValue);
  };
  
  // Calculate distribution for an input
  const calculateEntityDistribution = (input: AllocationInput, allRatios: any[]): Record<number, number> => {
    const distribution: Record<number, number> = {};
    
    // If using a ratio for distribution
    if (input.ratioId) {
      // Find the selected ratio
      const ratio = allRatios.find(r => r.id === input.ratioId);
      
      if (ratio && ratio.entityValues) {
        // Use actual ratio values for distribution
        const totalRatioValue = Object.values(ratio.entityValues).reduce((sum: number, value) => sum + (value as number), 0);
        
        entities.forEach(entity => {
          const entityRatio = ratio.entityValues?.[entity.id] || 0;
          const percentage = totalRatioValue > 0 ? (entityRatio / totalRatioValue) * 100 : 0;
          const value = (percentage / 100) * parseFloat(input.value || '0');
          distribution[entity.id] = value;
        });
      } else {
        // Fallback to simple distribution if ratio details not available
        const totalArea = entities.reduce((sum, entity) => sum + parseFloat(entity.suitArea || '0'), 0);
        
        entities.forEach(entity => {
          const entityArea = parseFloat(entity.suitArea || '0');
          const percentage = totalArea > 0 ? (entityArea / totalArea) * 100 : 0;
          const value = (percentage / 100) * parseFloat(input.value || '0');
          distribution[entity.id] = value;
        });
      }
    } 
    // Otherwise use the directly entered entity values
    else {
      entities.forEach(entity => {
        distribution[entity.id] = parseFloat(input.entityValues[entity.id] || '0');
      });
    }
    
    return distribution;
  };
  
  const getTotalAllocatedPercentage = (allocation: BudgetItemAllocation): number => {
    if (!allocation || !allocation.allocationInputs || allocation.allocationInputs.length === 0) return 0;
    
    const budgetValue = getBudgetValue(allocation);
    if (budgetValue <= 0) return 0;
    
    const totalInputValue = allocation.allocationInputs.reduce(
      (sum: number, input: AllocationInput) => sum + parseFloat(input.value || '0'), 0
    );
    
    return (totalInputValue / budgetValue) * 100;
  };
  
  const getEntityAllocationPercentage = (item: SelectedBudgetItem, entityId: number): number => {
    if (!item || !item.allocation || !item.allocation.allocationInputs || item.allocation.allocationInputs.length === 0) return 0;
    
    const allRatios = [...coreRatios, ...derivedRatios];
    let entityTotal = 0;
    
    item.allocation.allocationInputs.forEach((input: AllocationInput) => {
      const distribution = calculateEntityDistribution(input, allRatios);
      entityTotal += distribution[entityId] || 0;
    });
    
    const budgetValue = parseFloat(item.budgetValue || '0');
    return budgetValue > 0 ? (entityTotal / budgetValue) * 100 : 0;
  };
  
  // Calculate entity allocation amount
  const getEntityAllocationAmount = (item: SelectedBudgetItem, entityId: number): number => {
    if (!item || !item.allocation || !item.allocation.allocationInputs || item.allocation.allocationInputs.length === 0) return 0;
    
    const allRatios = [...coreRatios, ...derivedRatios];
    let entityTotal = 0;
    
    item.allocation.allocationInputs.forEach((input: AllocationInput) => {
      const distribution = calculateEntityDistribution(input, allRatios);
      entityTotal += distribution[entityId] || 0;
    });
    
    return entityTotal;
  };
  
  // Fetch projects for dropdown (if no project ID in URL)
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    enabled: !projectId,
  });
  
  // Fetch current project details if ID is in URL
  const { data: project, isLoading: isLoadingProject } = useQuery<any>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });
  
  // Fetch RERA budget items
  const { data: budgetItems = [], isLoading: isLoadingBudgetItems } = useQuery<ReraBudgetItem[]>({
    queryKey: ['/api/amc/budget-items'],
    enabled: !!projectId && activeTab === 'budget-selection',
  });
  
  // Filter budget items based on search
  const filteredBudgetItems: ReraBudgetItem[] = searchQuery 
    ? budgetItems.filter(item => 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : budgetItems;
  
  // Check if any budget items are selected
  const hasBudgetItemsSelected = Object.values(selectedBudgetItems).some(item => item.isSelected);
  
  // Effects
  
  // Fetch project contract when project ID changes
  useEffect(() => {
    if (projectId) {
      // Fetch project contract
      const fetchContract = async () => {
        try {
          const response = await fetch(`/api/amc/contracts?projectId=${projectId}`);
          if (response.ok) {
            const contracts = await response.json();
            console.log("Fetched contracts for project:", contracts);
            
            if (contracts && contracts.length > 0) {
              // Use the first contract for this project
              setProjectContract(contracts[0]);
            } else {
              // No contract exists yet, user needs to create one
              setProjectContract(null);
              
              // Clear entities and shared areas if no contract exists
              setEntities([]);
              setSharedAreas([]);
              setCoreRatios([]);
              setDerivedRatios([]);
            }
          } else {
            console.error("Failed to fetch project contract");
            setProjectContract(null);
          }
        } catch (error) {
          console.error("Error fetching project contract:", error);
          setProjectContract(null);
        }
      };
      
      fetchContract();
    }
  }, [projectId]);
  
  // Initialize entities and budget items when project changes
  useEffect(() => {
    if (projectId) {
      // Fetch entities from API if contract exists
      const fetchEntities = async () => {
        try {
          // If we have a contractId, use contract entities API
          if (projectContract && projectContract.id) {
            const response = await fetch(`/api/amc/contracts/${projectContract.id}/entities`);
            if (response.ok) {
              const fetchedEntities = await response.json();
              console.log("Fetched entities:", fetchedEntities);
              
              if (fetchedEntities && fetchedEntities.length > 0) {
                setEntities(fetchedEntities);
                
                // Initialize with empty allocations
                setAllocations(fetchedEntities.map((entity: Entity) => ({
                  entityIds: [entity.id],
                  percentage: 100 / fetchedEntities.length,
                  label: entity.name
                })));
              } else {
                // No entities yet - leave empty
                setEntities([]);
                setAllocations([]);
              }
            } else {
              console.error("Failed to fetch entities");
              setEntities([]);
              setAllocations([]);
            }
          } else {
            // No contract exists yet - leave empty
            setEntities([]);
            setAllocations([]);
          }
        } catch (error) {
          console.error("Error fetching entities:", error);
          setEntities([]);
          setAllocations([]);
        }
      };
      
      fetchEntities();
    }
  }, [projectId, projectContract]);
  
  // Helper function to populate core ratio entity values based on entity data
  const updateCoreRatioEntityValues = (ratios: any[], currentEntities: Entity[]): any[] => {
    return ratios.map(ratio => {
      const updatedEntityValues: Record<number, number> = {};
      
      // Populate entity values based on ratio type
      currentEntities.forEach(entity => {
        switch (ratio.ratioType) {
          case 'sellable_area':
            // Use sellable area if available, otherwise fall back to suit area
            updatedEntityValues[entity.id] = parseFloat(entity.sellableArea || entity.suitArea || '0');
            break;
          case 'applicable_area':
            // Calculate applicable area: suit area + 25% of balcony area
            const suitArea = parseFloat(entity.suitArea || '0');
            const balconyArea = parseFloat(entity.balconyArea || '0');
            updatedEntityValues[entity.id] = suitArea + (balconyArea * 0.25);
            break;
          case 'parking_bay_area':
            updatedEntityValues[entity.id] = parseFloat(entity.parkingBayArea || '0');
            break;
          case 'dedicated_common_area':
            updatedEntityValues[entity.id] = parseFloat(entity.dedicatedCommonArea || '0');
            break;
          case 'total_component_area': {
            // Calculate Total Component Area directly as the sum of all components
            const sellableAreaValue = parseFloat(entity.sellableArea || entity.suitArea || '0');
            const parkingBayAreaValue = parseFloat(entity.parkingBayArea || '0');
            const dedicatedCommonAreaValue = parseFloat(entity.dedicatedCommonArea || '0');
            
            // Calculate Principal Common Area allocation
            const pcaSellableAreaSum = currentEntities.reduce((sum, e) => 
              sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
            const pcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
            const pcaEntityProportion = pcaSellableAreaSum > 0 ? 
              pcaEntitySellableArea / pcaSellableAreaSum : 0;
            
            // Calculate Principal Common Area share
            const pcaTotalArea = sharedAreas && sharedAreas.length > 0 ?
              sharedAreas
                .filter(area => area.type === 'principal_common')
                .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
              : 0;
            
            const pcaShare = pcaTotalArea * pcaEntityProportion;
            
            // Calculate Common Element Area allocation
            let ceShare = 0;
            
            // Get all common element areas
            const ceAreaList = sharedAreas ? sharedAreas.filter(area => area.type === 'common_element') : [];
            
            // For each common element area, calculate this entity's share
            ceAreaList.forEach(commonElementArea => {
              // If this area has beneficiaries defined
              if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
                // Check if this entity is a beneficiary of this area
                const beneficiary = commonElementArea.beneficiaries.find(
                  (b) => b.entityId === entity.id
                );
                
                if (beneficiary) {
                  // If entity is explicitly defined as a beneficiary, use its allocation percentage
                  const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
                  ceShare += parseFloat(commonElementArea.area || '0') * allocationPercentage;
                }
              } else {
                // If no beneficiaries are defined, distribute to all entities based on sellable area
                const entitySellableAreaForCE = parseFloat(entity.sellableArea || entity.suitArea || '0');
                
                // Only calculate against the total of entities that should receive an allocation
                const totalSellableAreaForThisCE = currentEntities.reduce((sum, e) => {
                  return sum + parseFloat(e.sellableArea || e.suitArea || '0');
                }, 0);
                
                const ratioCE = totalSellableAreaForThisCE > 0 ? 
                  entitySellableAreaForCE / totalSellableAreaForThisCE : 0;
                  
                ceShare += parseFloat(commonElementArea.area || '0') * ratioCE;
              }
            });
            
            // Sum all components
            updatedEntityValues[entity.id] = sellableAreaValue + parkingBayAreaValue + dedicatedCommonAreaValue + pcaShare + ceShare;
            break;
          }
          case 'principal_common_area': {
            // Calculate entity's proportional share of principal common areas
            // The share is based on the entity's sellable area proportion
            const pcaSellableAreaSum = currentEntities.reduce((sum, e) => 
              sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
            
            const pcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
            const pcaEntityProportion = pcaSellableAreaSum > 0 ? 
              pcaEntitySellableArea / pcaSellableAreaSum : 0;
              
            // Get total principal common areas
            const pcaTotalArea = sharedAreas && sharedAreas.length > 0 ?
              sharedAreas
                .filter(area => area.type === 'principal_common')
                .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
              : 0;
              
            // Return entity's share of principal common areas
            updatedEntityValues[entity.id] = pcaTotalArea * pcaEntityProportion;
            break;
          }
          case 'common_element_area': {
            // Calculate entity's share of all common element areas
            // Process each common element area separately based on its beneficiaries
            let totalCeAllocation = 0;
            
            // Get all common element areas
            const ceAreaList = sharedAreas && sharedAreas.length > 0 ?
              sharedAreas.filter(area => area.type === 'common_element') : [];
            
            // For each common element area, calculate this entity's share
            ceAreaList.forEach(commonElementArea => {
              // If this area has beneficiaries defined
              if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
                // Check if this entity is a beneficiary of this area
                const beneficiary = commonElementArea.beneficiaries.find(
                  (b) => b.entityId === entity.id
                );
                
                if (beneficiary) {
                  // If entity is explicitly defined as a beneficiary, use its allocation percentage
                  const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
                  totalCeAllocation += parseFloat(commonElementArea.area || '0') * allocationPercentage;
                }
              } else {
                // If no beneficiaries are defined, distribute to all entities based on sellable area
                const entitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
                
                // Only calculate against the total of entities that should receive an allocation
                const totalSellableAreaForThisElement = currentEntities.reduce((sum, e) => {
                  return sum + parseFloat(e.sellableArea || e.suitArea || '0');
                }, 0);
                
                const ratio = totalSellableAreaForThisElement > 0 ? 
                  entitySellableArea / totalSellableAreaForThisElement : 0;
                  
                totalCeAllocation += parseFloat(commonElementArea.area || '0') * ratio;
              }
            });
            
            updatedEntityValues[entity.id] = totalCeAllocation;
            break;
          }
          case 'total_common_area': {
            // Get entity's direct dedicated common area
            const dedicatedArea = parseFloat(entity.dedicatedCommonArea || '0');
            
            // Calculate entity's proportional share of principal common areas
            // The share is based on the entity's sellable area proportion
            const tcaSellableAreaSum = currentEntities.reduce((sum, e) => 
              sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
            
            const tcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
            const tcaEntityProportion = tcaSellableAreaSum > 0 ? 
              tcaEntitySellableArea / tcaSellableAreaSum : 0;
              
            // Get principal common areas
            const tcaPrincipalArea = sharedAreas && sharedAreas.length > 0 ?
              sharedAreas
                .filter(area => area.type === 'principal_common')
                .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
              : 0;
            
            // Calculate entity's share of principal common areas
            const tcaPrincipalShare = tcaPrincipalArea * tcaEntityProportion;
            
            // Calculate entity's share of all common element areas
            let tcaCeShare = 0;
            
            // Get all common element areas for total common area
            const tcaCeAreaList = sharedAreas && sharedAreas.length > 0 ?
              sharedAreas.filter(area => area.type === 'common_element') : [];
            
            // For each common element area, calculate this entity's share
            tcaCeAreaList.forEach(commonElementArea => {
              // If this area has beneficiaries defined
              if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
                // Check if this entity is a beneficiary of this area
                const beneficiary = commonElementArea.beneficiaries.find(
                  (b) => b.entityId === entity.id
                );
                
                if (beneficiary) {
                  // If entity is explicitly defined as a beneficiary, use its allocation percentage
                  const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
                  tcaCeShare += parseFloat(commonElementArea.area || '0') * allocationPercentage;
                }
              } else {
                // If no beneficiaries are defined, distribute to all entities based on sellable area
                // Only calculate against the total of entities that should receive an allocation
                const totalSellableAreaForThisElement = currentEntities.reduce((sum, e) => {
                  return sum + parseFloat(e.sellableArea || e.suitArea || '0');
                }, 0);
                
                const ratio = totalSellableAreaForThisElement > 0 ? 
                  tcaEntitySellableArea / totalSellableAreaForThisElement : 0;
                  
                tcaCeShare += parseFloat(commonElementArea.area || '0') * ratio;
              }
            });
            
            // Sum all components
            updatedEntityValues[entity.id] = dedicatedArea + tcaPrincipalShare + tcaCeShare;
            break;
          }
          default:
            updatedEntityValues[entity.id] = 0;
        }
      });
      
      return {
        ...ratio,
        entityValues: updatedEntityValues,
        unitOfMeasurement: unitType // Ensure unit type is always up to date
      };
    });
  };

  // Initialize shared areas
  useEffect(() => {
    if (projectId && entities.length > 0 && projectContract && projectContract.id) {
      // Fetch shared areas
      const fetchSharedAreas = async () => {
        try {
          const response = await fetch(`/api/amc/contracts/${projectContract.id}/shared-areas`);
          if (response.ok) {
            const fetchedAreas = await response.json();
            console.log("Fetched shared areas:", fetchedAreas);
            
            if (fetchedAreas && fetchedAreas.length > 0) {
              setSharedAreas(fetchedAreas);
            } else {
              // No shared areas defined yet
              setSharedAreas([]);
            }
          } else {
            console.error("Failed to fetch shared areas");
            setSharedAreas([]);
          }
        } catch (error) {
          console.error("Error fetching shared areas:", error);
          setSharedAreas([]);
        }
      };
      
      fetchSharedAreas();
      
      // Initialize empty core ratios if none exist yet
      // Core ratios will be created based on user input rather than hardcoded
      if (coreRatios.length === 0) {
        // Initialize with all core ratio types, but with empty values
        // Values will be filled in by user input
        const initialCoreRatios = [
          {
            id: 1,
            name: 'Sellable Area',
            description: 'Total sellable area for each entity', 
            ratioType: 'sellable_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            // Entity values will be populated by user input
            entityValues: {}
          },
          {
            id: 2,
            name: 'Applicable Area',
            description: 'Suit area + 0.25x balcony area', 
            ratioType: 'applicable_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 3,
            name: 'Parking Bay Area',
            description: 'Total parking bay area', 
            ratioType: 'parking_bay_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 4,
            name: 'Dedicated Common Area',
            description: 'Dedicated common areas for entities', 
            ratioType: 'dedicated_common_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 5,
            name: 'Total Component Area',
            description: 'Sum of sellable, parking, dedicated common and shared common areas', 
            ratioType: 'total_component_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 6,
            name: 'Principal Common Area',
            description: 'Entity\'s share of principal common areas', 
            ratioType: 'principal_common_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 7,
            name: 'Common Element Area',
            description: 'Entity\'s share of common element areas', 
            ratioType: 'common_element_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          },
          {
            id: 8,
            name: 'Total Common Area',
            description: 'Sum of dedicated common area and shared common areas', 
            ratioType: 'total_common_area',
            isCore: true, 
            unitOfMeasurement: unitType,
            entityValues: {}
          }
        ];
        
        // Initialize with updated entity values instead of empty objects
        if (entities.length > 0) {
          const populatedRatios = updateCoreRatioEntityValues(initialCoreRatios, entities);
          setCoreRatios(populatedRatios);
        } else {
          setCoreRatios(initialCoreRatios);
        }
      } else if (entities.length > 0) {
        // Update existing core ratios when entities change
        setCoreRatios(prev => updateCoreRatioEntityValues(prev, entities));
      }
      
      // Derived ratios will be created by the user
      // Start with an empty array instead of hardcoded values
      if (derivedRatios.length === 0) {
        setDerivedRatios([]);
      }
    }
  }, [projectId, entities, unitType, projectContract, coreRatios.length, derivedRatios.length]);
  
  // Navigate to ratio management when project setup is complete
  const completeProjectSetup = () => {
    if (entities.length === 0) {
      toast({
        title: "No entities defined",
        description: "Please define at least one entity before proceeding",
        variant: "destructive"
      });
      return;
    }
    
    setActiveTab('ratio-management');
  };
  
  // Navigate to allocation when budget selection is complete
  const completeBudgetSelection = () => {
    if (!hasBudgetItemsSelected) {
      toast({
        title: "No budget items selected",
        description: "Please select at least one budget item before proceeding",
        variant: "destructive"
      });
      return;
    }
    
    // Initialize allocations for selected budget items if not already set
    const updatedBudgetItems = { ...selectedBudgetItems };
    
    Object.keys(updatedBudgetItems).forEach(idStr => {
      const id = parseInt(idStr);
      if (updatedBudgetItems[id].isSelected && (!updatedBudgetItems[id].allocation || !updatedBudgetItems[id].allocation.allocationInputs || updatedBudgetItems[id].allocation.allocationInputs.length === 0)) {
        // Set default even allocation for each budget item
        updatedBudgetItems[id].allocation = {
          allocationMethod: 'ratio_based',
          allocationInputs: entities.map(entity => ({
            entityId: entity.id,
            value: (100 / entities.length).toString(),
            unit: 'percentage',
            ratioId: coreRatios.length > 0 ? coreRatios[0].id : 0,
            ratioName: coreRatios.length > 0 ? coreRatios[0].name : '',
            entityValues: {},
            percentages: {}
          }))
        };
      }
    });
    
    setSelectedBudgetItems(updatedBudgetItems);
    setActiveTab('allocation');
    
    // Set the first selected budget item as active
    const firstSelectedId = Object.keys(updatedBudgetItems)
      .find(id => updatedBudgetItems[parseInt(id)].isSelected);
    
    if (firstSelectedId) {
      setSelectedBudgetItemId(parseInt(firstSelectedId));
    }
  };
  
  // Handle selecting/deselecting budget items
  const toggleBudgetItem = (item: ReraBudgetItem) => {
    setSelectedBudgetItems(prev => {
      const existingItem = prev[item.id];
      
      if (existingItem) {
        // Toggle selected state
        return {
          ...prev,
          [item.id]: {
            ...existingItem,
            isSelected: !existingItem.isSelected
          }
        };
      } else {
        // Initialize new item
        return {
          ...prev,
          [item.id]: {
            budgetItemId: item.id,
            allocationMethod: 'ratio_based', // Changed from 'area_based' to match BudgetItemAllocationManager component
            allocations: [],
            isSelected: true,
            customRatios: {},
            allocatedRatioId: coreRatios.length > 0 ? coreRatios[0].id : undefined,
            allocatedRatioName: coreRatios.length > 0 ? coreRatios[0].name : undefined,
            allocationInputs: [] // Initialize with empty allocationInputs
          }
        };
      }
    });
  };
  
  // Handle allocation method change
  const changeAllocationMethod = (budgetItemId: number, method: 'ratio_based' | 'input_based' | 'weightage_based') => {
    setSelectedBudgetItems(prev => ({
      ...prev,
      [budgetItemId]: {
        ...prev[budgetItemId],
        allocationMethod: method
      }
    }));
  };
  
  // Save allocations to the database
  // Simplified allocation saving without contract dependency
  const saveAllocations = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Check if entities are defined
      if (entities.length === 0) {
        toast({
          title: "No Entities Defined",
          description: "Please define project entities in the Project Setup tab first.",
          variant: "destructive",
        });
        return false;
      }
      
      const selectedItems = Object.values(selectedBudgetItems).filter(item => item.isSelected);
      if (selectedItems.length === 0) {
        toast({
          title: "No Items Selected",
          description: "Please select at least one budget item to allocate.",
          variant: "destructive",
        });
        return false;
      }
      
      // Format the data for local storage (in absence of an API that works)
      const allocationData = {
        projectId: projectId,
        allocations: selectedItems.map(item => ({
          budgetItemId: item.budgetItemId,
          allocationMethod: item.allocationMethod,
          allocations: item.allocations,
          budgetValue: item.budgetValue,
          allocatedRatioId: item.allocatedRatioId,
          allocatedRatioName: item.allocatedRatioName,
          allocationInputs: item.allocationInputs,
          allocationWeightage: item.allocationWeightage,
          notes: item.notes
        }))
      };
      
      // Instead of sending to an API that requires a contract, just store locally
      // This simulates a successful save without the contract dependency
      localStorage.setItem(`allocations-${projectId}`, JSON.stringify(allocationData));
      
      // In a real implementation, you would use an API call:
      // await apiRequest(`/api/allocation/${projectId}`, {
      //   method: 'POST',
      //   body: allocationData
      // });
      
      toast({
        title: "Allocations Saved",
        description: "Your cost allocations have been saved successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving allocations:", error);
      toast({
        title: "Error Saving Allocations",
        description: "An error occurred while saving your allocations. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Handle allocation change for a budget item
  const handleAllocationChange = (budgetItemId: number, newAllocations: SharedAllocation[]) => {
    setSelectedBudgetItems(prev => ({
      ...prev,
      [budgetItemId]: {
        ...prev[budgetItemId],
        allocations: newAllocations
      }
    }));
  };
  
  // Select a project from dropdown
  const handleProjectChange = (projectId: string) => {
    navigate(`/inspection/amc-allocation/${projectId}`);
  };
  
  // Get current budget item
  const currentBudgetItem = selectedBudgetItemId !== null 
    ? budgetItems.find(item => item.id === selectedBudgetItemId) || null
    : null;
  
  // Get allocations for current budget item
  useEffect(() => {
    if (selectedBudgetItemId !== null && selectedBudgetItems[selectedBudgetItemId]) {
      setAllocations(selectedBudgetItems[selectedBudgetItemId].allocations || []);
    }
  }, [selectedBudgetItemId, selectedBudgetItems]);
  
  // Update allocations when changed in the diagram
  const updateCurrentAllocations = (newAllocations: SharedAllocation[]) => {
    if (selectedBudgetItemId !== null) {
      handleAllocationChange(selectedBudgetItemId, newAllocations);
      setAllocations(newAllocations);
    }
  };
  
  // Handle entity form submission
  const handleEntitySubmit = (data: any) => {
    const newEntity: Entity = {
      id: editEntity ? editEntity.id : Date.now(), // Use existing ID or generate new one
      name: data.name,
      type: data.type,
      suitArea: data.suitArea || '0',
      balconyArea: data.balconyArea || '0',
      parkingBayArea: data.parkingBayArea || '0',
      dedicatedCommonArea: data.dedicatedCommonArea || '0',
      totalComponentArea: data.totalComponentArea || '0',
      sellableArea: data.sellableArea || (parseFloat(data.suitArea || '0') + parseFloat(data.balconyArea || '0')).toString(),
      applicableArea: data.applicableArea || (parseFloat(data.suitArea || '0') + (parseFloat(data.balconyArea || '0') * 0.25)).toString(),
      color: editEntity?.color || generateRandomColor(), // Assign a color to the entity
    };
    
    if (editEntity) {
      // Update an existing entity
      setEntities(prev => {
        const updatedEntities = prev.map(entity => entity.id === editEntity.id ? newEntity : entity);
        console.log("Updated entities after edit:", updatedEntities);
        
        // Update core ratios to include the updated entity values
        // This will automatically trigger the useEffect to update ratio values
        setTimeout(() => {
          if (coreRatios.length > 0) {
            // Use a setTimeout to ensure entities state is updated first
            setCoreRatios(currentRatios => updateCoreRatioEntityValues(currentRatios, updatedEntities));
          }
        }, 0);
        
        // Clear combination ratios to force recalculation
        setCombinationRatios([]);
        return updatedEntities;
      });
      
      toast({
        title: "Entity Updated",
        description: `${newEntity.name} has been updated successfully.`
      });
    } else {
      // Add a new entity
      setEntities(prev => {
        const updatedEntities = [...prev, newEntity];
        console.log("Updated entities after add:", updatedEntities);
        
        // Update core ratios to include the new entity
        // This will automatically trigger the useEffect to update ratio values
        setTimeout(() => {
          if (coreRatios.length > 0) {
            // Use a setTimeout to ensure entities state is updated first
            setCoreRatios(currentRatios => updateCoreRatioEntityValues(currentRatios, updatedEntities));
          }
        }, 0);
        
        // Clear combination ratios to force recalculation
        setCombinationRatios([]);
        return updatedEntities;
      });
      
      toast({
        title: "Entity Added",
        description: `${newEntity.name} has been added to the project.`
      });
      
      // Add this entity to current allocations with zero percentage
      setAllocations(prev => [
        ...prev,
        {
          entityIds: [newEntity.id],
          percentage: 0,
          label: newEntity.name
        }
      ]);
    }
    
    setEntityDialogOpen(false);
    setEditEntity(null);
  };
  
  // Generate a random color for entity
  const generateRandomColor = () => {
    const colorChoices = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#8B5CF6', // violet-500
      '#EF4444', // red-500
      '#F59E0B', // amber-500
      '#EC4899', // pink-500
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#8B5CF6', // violet-500
    ];
    return colorChoices[Math.floor(Math.random() * colorChoices.length)];
  };
  
  // Handle shared area form submission
  const handleSharedAreaSubmit = (data: any, beneficiaries: number[]) => {
    const newSharedArea = {
      id: editSharedArea ? editSharedArea.id : Date.now(), // Use existing ID or generate new one
      name: data.name,
      type: data.type,
      area: data.area,
      description: data.description || null,
      beneficiaries: beneficiaries.map(entityId => ({
        entityId,
        sharedAreaId: editSharedArea ? editSharedArea.id : Date.now(),
        allocationPercentage: (100 / beneficiaries.length).toFixed(2),
        id: Date.now() + entityId // Unique ID for each beneficiary
      }))
    };
    
    if (editSharedArea) {
      // Update an existing shared area
      setSharedAreas(prev => {
        const updatedAreas = prev.map(area => area.id === editSharedArea.id ? newSharedArea : area);
        console.log("Updated shared areas after edit:", updatedAreas);
        // Clear combination ratios to force recalculation
        setCombinationRatios([]);
        return updatedAreas;
      });
      
      toast({
        title: "Shared Area Updated",
        description: `${newSharedArea.name} has been updated successfully.`
      });
    } else {
      // Add a new shared area
      setSharedAreas(prev => {
        const updatedAreas = [...prev, newSharedArea];
        console.log("Updated shared areas after add:", updatedAreas);
        // Clear combination ratios to force recalculation
        setCombinationRatios([]);
        return updatedAreas;
      });
      
      toast({
        title: "Shared Area Added",
        description: `${newSharedArea.name} has been added to the project.`
      });
    }
    
    setSharedAreaDialogOpen(false);
    setEditSharedArea(null);
  };
  
  // Handler for the "Manage Special Areas" button
  const handleManageSpecialAreas = () => {
    // Switch to the ratio management tab
    setActiveTab('ratio-management');
    
    // Show a toast notification to guide the user
    toast({
      title: "Special Areas Management",
      description: "You can now manage special areas in the Ratio Management tab.",
    });
  };
  
  // Handler for the "Create Derived Ratio" button
  const handleDeriveRatio = (sourceRatio: any) => {
    // Enrich the source ratio with properties needed for a derived ratio
    const derivedRatioBase = {
      ...sourceRatio,
      id: Date.now(), // Generate a new unique ID
      sourceRatioId: sourceRatio.id,
      sourceRatioName: sourceRatio.name,
      name: `Derived from ${sourceRatio.name}`,
      description: `Custom ratio derived from ${sourceRatio.name}`,
      isDerived: true,
      // Preserve the entity values from the source ratio
      entityValues: sourceRatio.entityValues || {},
      // Add placeholder for future modifications
      entityModifications: []
    };
    
    // Add the new derived ratio to state
    setDerivedRatios(prev => [...prev, derivedRatioBase]);
    
    // Switch to the ratio management tab to edit the newly created derived ratio
    setActiveTab('ratio-management');
    
    // Notify the user
    toast({
      title: "Derived Ratio Created",
      description: `A new derived ratio based on "${sourceRatio.name}" has been created. You can now customize it in the Ratio Management tab.`,
    });
  };
  
  // Toggle between square meters and square feet
  const toggleUnitType = () => {
    setUnitType(prev => prev === 'sqm' ? 'sqft' : 'sqm');
    
    // Here you could implement conversion logic for all measurements
    // For example: multiply all area values by 10.764 when going from sqm to sqft
    // or divide by 10.764 when going from sqft to sqm
    
    toast({
      title: `Unit Type Changed`,
      description: `Measurements are now displayed in ${unitType === 'sqm' ? 'square feet' : 'square meters'}.`
    });
  };
  
  return (
    <InspectionLayout
      title="AMC Cost Allocation"
      description="Annual Maintenance Contract cost allocation for mixed-use properties"
      showBackButton={true}
      backUrl="/inspection/projects"
      actionButton={
        projectId && (
          <Button
            onClick={() => navigate(`/inspection/projects/${projectId}`)}
            variant="outline"
            className="ml-auto"
          >
            View Project Details
          </Button>
        )
      }
    >
      <Helmet>
        <title>AMC Cost Allocation | Property Inspection Platform</title>
        <meta name="description" content="Annual Maintenance Contract cost allocation for mixed-use properties" />
      </Helmet>
      
      <div>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inspection/dashboard">
                <HomeIcon className="h-3 w-3 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inspection/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">AMC Allocation</BreadcrumbLink>
            </BreadcrumbItem>
            {project && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">{project.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Project Selection (if no project ID in URL) */}
        {!projectId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select a Project</CardTitle>
              <CardDescription>Choose a project to start the AMC cost allocation process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-64">
                  <Select
                    onValueChange={handleProjectChange}
                    disabled={isLoadingProjects || projects.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {isLoadingProjects && (
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}
                
                {!isLoadingProjects && projects.length === 0 && (
                  <div className="flex-1 flex items-center">
                    <span className="text-amber-600">No projects found. Create a project first.</span>
                    <Button
                      variant="outline"
                      className="ml-4"
                      onClick={() => navigate('/inspection/projects')}
                    >
                      Go to Projects <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Project Content (when project is selected) */}
        {projectId && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">AMC Cost Allocation System</CardTitle>
                    <CardDescription>
                      Manage and allocate Annual Maintenance Contract costs among different entities in a mixed-use development
                    </CardDescription>
                  </div>
                  {project && (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Project: {project.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <InfoIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        This system helps you allocate maintenance costs fairly across different entities in a mixed-use property,
                        following RERA audit guidelines. Follow these steps:
                        <ol className="list-decimal ml-5 mt-2 space-y-1">
                          <li>Define project entities and their characteristics</li>
                          <li>Select relevant RERA budget line items for your project</li>
                          <li>Allocate costs for each selected budget line item</li>
                        </ol>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="project-setup" className="flex items-center">
                  <Building2Icon className="mr-2 h-4 w-4" />
                  <span>1. Project Setup</span>
                </TabsTrigger>
                <TabsTrigger value="ratio-management" className="flex items-center">
                  <BarChartHorizontalIcon className="mr-2 h-4 w-4" />
                  <span>2. Ratio Management</span>
                </TabsTrigger>
                <TabsTrigger value="budget-selection" className="flex items-center">
                  <ListChecksIcon className="mr-2 h-4 w-4" />
                  <span>3. Budget Item Selection</span>
                </TabsTrigger>
                <TabsTrigger value="allocation" className="flex items-center">
                  <PercentSquareIcon className="mr-2 h-4 w-4" />
                  <span>4. Cost Allocation</span>
                </TabsTrigger>
                <TabsTrigger value="allocation-summary" className="flex items-center">
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>5. Allocation Summary</span>
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  <span>6. Generate Report</span>
                </TabsTrigger>
              </TabsList>
              
              {/* STEP 1: PROJECT SETUP */}
              <TabsContent value="project-setup">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
                      <CardTitle>Project Entities Setup</CardTitle>
                    </div>
                    <CardDescription>
                      Step 1: Define the entities in your mixed-use project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium mr-3">Project Entities</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={toggleUnitType}
                            >
                              Switch to {unitType === 'sqm' ? 'Square Feet' : 'Square Meters'}
                            </Button>
                          </div>
                          <Button size="sm" onClick={() => setEntityDialogOpen(true)}>
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Entity
                          </Button>
                        </div>
                        
                        {entities.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Area ({unitType})</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entities.map(entity => (
                                <TableRow key={entity.id}>
                                  <TableCell className="font-medium">{entity.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {entity.type === 'residential' && <BuildingIcon className="h-3 w-3 mr-1" />}
                                      {entity.type === 'retail' && <ShoppingBagIcon className="h-3 w-3 mr-1" />}
                                      {entity.type === 'office' && <BuildingIcon className="h-3 w-3 mr-1" />}
                                      {entity.type === 'hotel' && <LandmarkIcon className="h-3 w-3 mr-1" />}
                                      {entity.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{unitType === 'sqm' ? entity.suitArea : (parseFloat(entity.suitArea) * 10.764).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          setEditEntity(entity);
                                          setEntityDialogOpen(true);
                                        }}
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete ${entity.name}?`)) {
                                            setEntities(prev => prev.filter(e => e.id !== entity.id));
                                            toast({
                                              title: "Entity Deleted",
                                              description: `${entity.name} has been removed from the project.`
                                            });
                                          }
                                        }}
                                      >
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
                            <Building2Icon className="mx-auto h-8 w-8 text-slate-400" />
                            <h3 className="mt-2 text-sm font-medium text-slate-500">No entities defined</h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Add entities to start the allocation process
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Shared Areas</h3>
                          <Button size="sm" onClick={() => setSharedAreaDialogOpen(true)}>
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Shared Area
                          </Button>
                        </div>
                        
                        {sharedAreas.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Area ({unitType})</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sharedAreas.map(area => (
                                <TableRow key={area.id}>
                                  <TableCell className="font-medium">{area.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {area.type === 'principal_common' ? 'Principal Common' : 'Common Element'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {unitType === 'sqm' ? area.area : (parseFloat(area.area) * 10.764).toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          setEditSharedArea(area);
                                          setSharedAreaDialogOpen(true);
                                        }}
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete ${area.name}?`)) {
                                            setSharedAreas(prev => prev.filter(a => a.id !== area.id));
                                            toast({
                                              title: "Shared Area Deleted",
                                              description: `${area.name} has been removed from the project.`
                                            });
                                          }
                                        }}
                                      >
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
                            <Scale3Icon className="mx-auto h-8 w-8 text-slate-400" />
                            <h3 className="mt-2 text-sm font-medium text-slate-500">No shared areas defined</h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Add shared areas for more precise allocations
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-10">
                      {entities.length > 0 ? (
                        <div className="space-y-8">
                          {/* Core Ratios Display */}
                          <CoreRatiosDisplay 
                            entities={entities}
                            sharedAreas={sharedAreas as any} // Type cast to resolve type mismatch temporarily
                            unitType={unitType}
                          />
                          
                          {/* Using a safer pattern for comments in JSX */}
                          {(() => {
                            // Combination Ratios Display Component
                            return null;
                          })()}
                          {/* Replace both ratio displays with a single unified display */}
                          <UnifiedRatioDisplay 
                            entities={entities}
                            sharedAreas={sharedAreas as any}
                            coreRatios={coreRatios}
                            combinationRatios={combinationRatios}
                            derivedRatios={derivedRatios}
                            unitType={unitType}
                            onSave={(allRatios) => {
                              console.log("All ratios updated:", allRatios);
                              
                              // Update state with all ratio types
                              setCoreRatios(allRatios.coreRatios);
                              setCombinationRatios(allRatios.combinationRatios);
                              
                              // Enhance derived ratios to ensure they have proper entityValues
                              const enhancedDerivedRatios = allRatios.derivedRatios.map(derivedRatio => {
                                // If the ratio already has entityValues, use them directly
                                if (derivedRatio.entityValues) {
                                  return {
                                    ...derivedRatio,
                                    isCore: false // Mark as not a core ratio
                                  };
                                }
                                
                                // Otherwise calculate entity values from modifications
                                const entityValues: Record<number, number> = {};
                                
                                // Use modifications to calculate values for each entity
                                entities.forEach(entity => {
                                  const modification = derivedRatio.entityModifications?.find(
                                    (mod: { entityId: number; action: string }) => 
                                      mod.entityId === entity.id && mod.action === 'include'
                                  );
                                  
                                  entityValues[entity.id] = modification?.modifiedValue || 0;
                                });
                                
                                return {
                                  ...derivedRatio,
                                  isCore: false,
                                  entityValues
                                };
                              });
                              
                              setDerivedRatios(enhancedDerivedRatios);
                              
                              // Also update special areas
                              // This isn't directly used in the state, but might be useful for other components
                              const specialAreas = allRatios.specialAreas;
                              
                              // Removed redundant toast notification that was causing UI distraction
                              // The UI already shows the available ratios in the interface
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
                          <PercentSquareIcon className="mx-auto h-8 w-8 text-slate-400" />
                          <h3 className="mt-2 text-sm font-medium text-slate-500">No entities to allocate</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Add entities first to create allocation ratios
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate('/inspection/projects')}>
                      Back to Projects
                    </Button>
                    <Button onClick={completeProjectSetup}>
                      Continue to Ratio Management
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* STEP 2: BUDGET ITEM SELECTION */}
              {/* STEP 2: RATIO MANAGEMENT - New Tab */}
              <TabsContent value="ratio-management">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
                      <CardTitle>Ratio Management</CardTitle>
                    </div>
                    <CardDescription>
                      Step 2: Create and manage allocation ratios for different entities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Use the new simplified RatioMatrix component */}
                    <div className="mb-6">
                  <RatioMatrix
                    entities={entities}
                    ratios={[...coreRatios, ...combinationRatios, ...derivedRatios]}
                    specialAreas={sharedAreas}
                    unitType={unitType}
                    onSaveRatio={(updatedRatio) => {
                      // Handle saving ratios based on their type
                      if (updatedRatio.isCore) {
                        setCoreRatios(prev => prev.map(r => r.id === updatedRatio.id ? updatedRatio : r));
                      } else if ('sourceRatioId' in updatedRatio) {
                        setDerivedRatios(prev => prev.map(r => r.id === updatedRatio.id ? updatedRatio : r));
                      } else {
                        setCombinationRatios(prev => prev.map(r => r.id === updatedRatio.id ? updatedRatio : r));
                      }
                      
                      toast({
                        title: "Ratio updated",
                        description: `${updatedRatio.name} ratio has been updated successfully.`
                      });
                    }}
                    onDeleteRatio={(ratioId) => {
                      // Handle deleting ratios based on their type
                      const coreRatio = coreRatios.find(r => r.id === ratioId);
                      const derivedRatio = derivedRatios.find(r => r.id === ratioId);
                      
                      if (coreRatio) {
                        toast({
                          title: "Cannot delete core ratio",
                          description: "Core ratios cannot be deleted as they are essential for calculations.",
                          variant: "destructive"
                        });
                      } else if (derivedRatio) {
                        setDerivedRatios(prev => prev.filter(r => r.id !== ratioId));
                        toast({
                          title: "Ratio deleted",
                          description: `${derivedRatio.name} ratio has been deleted.`
                        });
                      } else {
                        setCombinationRatios(prev => prev.filter(r => r.id !== ratioId));
                        toast({
                          title: "Ratio deleted",
                          description: "Combination ratio has been deleted."
                        });
                      }
                    }}
                  />
                </div>
                
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 mt-4">
                    <Button variant="outline" onClick={() => setActiveTab('project-setup')}>
                      Back to Project Setup
                    </Button>
                    <Button onClick={() => setActiveTab('budget-selection')}>
                      Continue to Budget Selection
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* STEP 3: BUDGET SELECTION */}
              <TabsContent value="budget-selection">
                <BudgetItemSelection
                  projectId={projectId}
                  selectedBudgetItems={selectedBudgetItems}
                  onBudgetItemsChange={setSelectedBudgetItems}
                  onContinue={completeBudgetSelection}
                  onBack={() => setActiveTab('ratio-management')}
                />
              </TabsContent>
              
              {/* STEP 3: COST ALLOCATION */}
              <TabsContent value="allocation">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">4</div>
                      <CardTitle>Cost Allocation</CardTitle>
                    </div>
                    <CardDescription>
                      Step 4: Allocate budget item costs to entities using various allocation methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Left sidebar: Budget item list */}
                      <div className="md:col-span-1 border-r pr-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium">Selected Budget Items</h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {Object.values(selectedBudgetItems).filter(item => item.isSelected).length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                          {Object.values(selectedBudgetItems)
                            .filter(item => item.isSelected)
                            .map(item => {
                              const budgetItem = (budgetItems as ReraBudgetItem[]).find(bi => bi.id === item.budgetItemId);
                              // Check if allocation is complete (sum of percentages is 100%)
                              const isComplete = item.allocations && item.allocations.length > 0 && 
                                Math.abs(item.allocations.reduce((sum, alloc) => sum + (typeof alloc.percentage === 'number' ? alloc.percentage : parseFloat(alloc.percentage || '0')), 0) - 100) < 0.01;
                              
                              // Check if the budget value has been set
                              const hasBudgetValue = !!item.budgetValue && parseFloat(item.budgetValue) > 0;
                              
                              return budgetItem ? (
                                <div 
                                  key={budgetItem.id} 
                                  onClick={() => setSelectedBudgetItemId(budgetItem.id)}
                                  className={`
                                    px-3 py-2 rounded-md cursor-pointer transition-all
                                    ${selectedBudgetItemId === budgetItem.id ? 'bg-slate-100 border border-slate-300 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}
                                  `}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">{budgetItem.code}</span>
                                    <div className="flex items-center gap-1">
                                      {!isComplete && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <AlertCircle className="h-4 w-4 text-amber-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Allocation incomplete</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                      {hasBudgetValue && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                          ${parseFloat(item.budgetValue || '0').toLocaleString()}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate">{budgetItem.description}</p>
                                  <div className="flex items-center mt-1 gap-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        item.allocationMethod === 'ratio_based' 
                                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                          : item.allocationMethod === 'input_based'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : 'bg-orange-50 text-orange-700 border-orange-200'
                                      }`}
                                    >
                                      {item.allocationMethod === 'ratio_based' 
                                        ? 'Ratio' 
                                        : item.allocationMethod === 'input_based' 
                                          ? 'Input' 
                                          : 'Weightage'}
                                    </Badge>
                                    {/* Indicate number of inputs if input-based */}
                                    {item.allocationMethod === 'input_based' && item.allocationInputs && (
                                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                                        {item.allocationInputs.length} Input{item.allocationInputs.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    {/* Show ratio name if ratio-based */}
                                    {item.allocationMethod === 'ratio_based' && item.allocatedRatioName && (
                                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                                        {item.allocatedRatioName}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })
                          }
                          {Object.values(selectedBudgetItems).filter(item => item.isSelected).length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                              <p className="text-sm text-slate-500">No budget items selected</p>
                              <Button 
                                variant="link" 
                                onClick={() => setActiveTab('budget-selection')}
                                className="mt-2 text-sm"
                              >
                                Go to Budget Selection
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Main content: Allocation for selected budget item */}
                      <div className="md:col-span-3">
                        {selectedBudgetItemId && currentBudgetItem ? (
                          <div className="space-y-6">
                            {/* Budget Item Header with Budget Value Input */}
                            <div className="pb-4 border-b">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h2 className="text-lg font-medium">{currentBudgetItem.code}: {currentBudgetItem.description}</h2>
                                  <p className="text-sm text-slate-600">
                                    {currentBudgetItem.category} / {currentBudgetItem.subCategory || 'General'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                    <Label htmlFor="budgetValue" className="mr-2">Budget Value:</Label>
                                    <Input
                                      id="budgetValue"
                                      type="number"
                                      placeholder="0.00"
                                      className="w-32 text-right font-medium"
                                      value={selectedBudgetItems[selectedBudgetItemId]?.budgetValue || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedBudgetItems(prev => ({
                                          ...prev,
                                          [selectedBudgetItemId]: {
                                            ...prev[selectedBudgetItemId],
                                            budgetValue: value
                                          }
                                        }));
                                      }}
                                    />
                                  </div>
                                  {selectedBudgetItems[selectedBudgetItemId]?.budgetValue && (
                                    <p className="text-xs text-green-600 mt-1">
                                      ${parseFloat(selectedBudgetItems[selectedBudgetItemId]?.budgetValue || '0').toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Cost Allocation Implementation */}
                            <div className="w-full">
                              {/* Integrated Ratio Management System */}
                              <CostAllocationTab
                                projectId={projectId}
                                entities={entities}
                                selectedBudgetItems={selectedBudgetItems}
                                allRatios={[...coreRatios, ...derivedRatios, ...combinationRatios]}
                                coreRatios={coreRatios}
                                derivedRatios={derivedRatios}
                                combinationRatios={combinationRatios}
                                unitType="sqm"
                                onAllocationUpdate={(updatedAllocations: Record<number, BudgetItemAllocation>) => {
                                  // Process all updated allocations
                                  setSelectedBudgetItems(prev => {
                                    const newItems = { ...prev };
                                    
                                    // Update each budget item with its new allocation data
                                    Object.entries(updatedAllocations).forEach(([itemId, allocation]) => {
                                      const budgetItemId = parseInt(itemId);
                                      const existingItem = prev[budgetItemId];
                                      
                                      if (existingItem) {
                                        // Store the BudgetItemAllocation in the allocation property
                                        newItems[budgetItemId] = {
                                          ...existingItem,
                                          budgetValue: allocation.budgetValue,
                                          allocation: allocation, // Store the complete allocation object
                                          isSelected: true, // Ensure it stays selected
                                          allocationMethod: allocation.allocationMethod // Use the allocation method from the allocation
                                        };
                                      }
                                    });
                                    
                                    return newItems;
                                  });
                                  
                                  toast({
                                    title: "Allocation saved",
                                    description: "Budget item allocation has been updated using the integrated ratio management system."
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16 bg-slate-50 rounded-lg border border-dashed">
                            <PercentSquareIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-medium text-slate-700">No Budget Item Selected</h3>
                            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                              Select a budget line item from the list to begin allocating costs using ratios, inputs, or weightage methods.
                            </p>
                            {Object.values(selectedBudgetItems).filter(item => item.isSelected).length === 0 && (
                              <Button 
                                variant="outline" 
                                onClick={() => setActiveTab('budget-selection')}
                                className="mt-4"
                              >
                                Select Budget Items
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 mt-4">
                    <Button variant="outline" onClick={() => setActiveTab('budget-selection')}>
                      Back to Budget Selection
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('allocation-summary')}
                      >
                        <ArrowRightIcon className="h-4 w-4 mr-2" />
                        Allocation Summary
                      </Button>
                      <Button 
                        onClick={async () => {
                          const success = await saveAllocations();
                          if (success) {
                            toast({
                              title: "Allocations Saved",
                              description: "Your allocations have been saved successfully.",
                            });
                          }
                        }}
                      >
                        Save Allocations
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* STEP 4: ALLOCATION SUMMARY */}
              <TabsContent value="allocation-summary">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">5</div>
                      <CardTitle>Allocation Summary</CardTitle>
                    </div>
                    <CardDescription>
                      Step 5: Review the final allocation percentages and cost distribution for all budget items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Budget Allocation Summary</h3>
                        <Button variant="outline" size="sm">
                          <FileDownIcon className="mr-2 h-4 w-4" />
                          Export Report
                        </Button>
                      </div>
                      
                      {Object.values(selectedBudgetItems).filter(item => item.isSelected).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-[100px]">Budget Value</TableHead>
                              {entities.map(entity => (
                                <TableHead key={entity.id} className="text-right">
                                  {entity.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.values(selectedBudgetItems)
                              .filter(item => item.isSelected)
                              .map(item => {
                                const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
                                const budgetValue = parseFloat(item.budgetValue || '0');
                                
                                return (
                                  <TableRow key={item.budgetItemId}>
                                    <TableCell className="font-medium">{budgetItem?.code}</TableCell>
                                    <TableCell>
                                      <span className="text-xs text-gray-500 truncate block max-w-[250px]">
                                        {budgetItem?.description}
                                      </span>
                                    </TableCell>
                                    <TableCell>${budgetValue.toLocaleString()}</TableCell>
                                    
                                    {entities.map(entity => {
                                      const percentage = getEntityAllocationPercentage(item, entity.id);
                                      const amount = getEntityAllocationAmount(item, entity.id);
                                      
                                      return (
                                        <TableCell key={entity.id} className="text-right">
                                          <div className="flex flex-col items-end">
                                            <span className="text-xs font-medium">{percentage.toFixed(2)}%</span>
                                            <span className="text-xs text-green-600">${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                          </div>
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                );
                              })}
                            
                            {/* Total Row */}
                            <TableRow className="bg-slate-50 font-medium">
                              <TableCell colSpan={2}>Total</TableCell>
                              <TableCell>
                                ${Object.values(selectedBudgetItems)
                                  .filter(item => item.isSelected)
                                  .reduce((sum, item) => sum + parseFloat(item.budgetValue || '0'), 0)
                                  .toLocaleString()}
                              </TableCell>
                              
                              {entities.map(entity => {
                                const totalAmount = Object.values(selectedBudgetItems)
                                  .filter(item => item.isSelected)
                                  .reduce((sum, item) => sum + getEntityAllocationAmount(item, entity.id), 0);
                                
                                const totalBudget = Object.values(selectedBudgetItems)
                                  .filter(item => item.isSelected)
                                  .reduce((sum, item) => sum + parseFloat(item.budgetValue || '0'), 0);
                                
                                const percentage = totalBudget > 0 ? (totalAmount / totalBudget) * 100 : 0;
                                
                                return (
                                  <TableCell key={entity.id} className="text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="text-xs font-medium">{percentage.toFixed(2)}%</span>
                                      <span className="text-xs text-green-600">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                          <FileBarChart className="mx-auto h-12 w-12 text-slate-400" />
                          <h3 className="mt-4 text-lg font-medium text-slate-700">No Allocated Budget Items</h3>
                          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                            You haven't allocated any budget items yet. Go to the allocation tab to start allocating costs.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('allocation')}
                            className="mt-4"
                          >
                            Go to Allocation
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 mt-4">
                    <Button variant="outline" onClick={() => setActiveTab('allocation')}>
                      Back to Allocation
                    </Button>
                    <Button 
                      onClick={async () => {
                        const success = await saveAllocations();
                        if (success) {
                          toast({
                            title: "Allocations Saved",
                            description: "Your allocations have been saved successfully.",
                          });
                        }
                      }}
                    >
                      Save Allocations
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* STEP 6: REPORT GENERATION */}
              <TabsContent value="report">
                <ReportGenerator
                  contractId={projectContract?.id || 0}
                  projectId={projectId || 0}
                  entities={entities}
                  allocations={allocations}
                  selectedBudgetItems={selectedBudgetItems}
                  onBack={() => setActiveTab('allocation-summary')}
                />
              </TabsContent>
            </Tabs>
            
            {/* Entity Management Dialog */}
            <Dialog open={entityDialogOpen} onOpenChange={setEntityDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editEntity ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
                  <DialogDescription>
                    {editEntity 
                      ? 'Update the entity details below.' 
                      : 'Define a new entity for your project. Enter the details below.'}
                  </DialogDescription>
                </DialogHeader>
                
                <EntityManagementForm 
                  onSubmit={handleEntitySubmit}
                  editEntity={editEntity}
                  unitType={unitType}
                  onCancel={() => setEntityDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            
            {/* Shared Area Management Dialog */}
            <Dialog open={sharedAreaDialogOpen} onOpenChange={setSharedAreaDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editSharedArea ? 'Edit Shared Area' : 'Add New Shared Area'}</DialogTitle>
                  <DialogDescription>
                    {editSharedArea 
                      ? 'Update the shared area details below.' 
                      : 'Define a new shared area for your project. Principal common areas are shared by all entities while common element areas can be allocated to specific entities.'}
                  </DialogDescription>
                </DialogHeader>
                
                <SharedAreaManagementForm 
                  onSubmit={handleSharedAreaSubmit}
                  editSharedArea={editSharedArea}
                  entities={entities}
                  unitType={unitType}
                  onCancel={() => setSharedAreaDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </InspectionLayout>
  );
};

export default AmcAllocation;
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PlusCircleIcon,
  EditIcon,
  TrashIcon,
  FilterIcon,
  LayoutIcon,
  GitBranchIcon
} from 'lucide-react';

// Import standard types from shared definitions
import {
  Entity,
  EntityBeneficiary,
  SharedArea,
  CombinationRatio,
  RatioType
} from '@shared/ratio-types';

// Define the props
interface CombinationRatiosDisplayProps {
  entities: Entity[];
  sharedAreas: SharedArea[];
  unitType: 'sqm' | 'sqft';
  onSave?: (combinationRatios: CombinationRatio[]) => void;
  onDeriveRatio?: (ratio: CombinationRatio) => void;
  onManageSpecialAreas?: () => void; // New callback for managing special areas
}

const CombinationRatiosDisplay: React.FC<CombinationRatiosDisplayProps> = ({
  entities,
  sharedAreas,
  unitType,
  onSave,
  onDeriveRatio,
  onManageSpecialAreas
}) => {
  // State for the dialog and filters
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRatio, setCurrentRatio] = useState<CombinationRatio | null>(null);
  const [combinationRatios, setCombinationRatios] = useState<CombinationRatio[]>([]);
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  const [ratioName, setRatioName] = useState('');
  const [ratioDescription, setRatioDescription] = useState('');
  const [selectedRatioType, setSelectedRatioType] = useState<RatioType>('sellable_area');
  const [selectedRatioFilters, setSelectedRatioFilters] = useState<RatioType[]>([]);

  // Generate all possible combinations of entities
  const generateAllCombinations = (items: Entity[]): Entity[][] => {
    const result: Entity[][] = [];
    
    // Function to generate combinations of size k
    const generateCombinationsOfSize = (start: number, size: number, current: Entity[]) => {
      if (current.length === size) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < items.length; i++) {
        current.push(items[i]);
        generateCombinationsOfSize(i + 1, size, current);
        current.pop();
      }
    };
    
    // Generate all combinations of sizes 1 to n
    for (let size = 1; size <= items.length; size++) {
      generateCombinationsOfSize(0, size, []);
    }
    
    return result;
  };

  // Generate all combinations of entities when entities change
  useEffect(() => {
    if (entities.length > 0) {
      // Generate all possible combinations of entities
      const allCombinations = generateAllCombinations(entities);
      
      // Define all ratio types to generate combinations for
      const ratioTypes: RatioType[] = [
        'sellable_area',
        'applicable_area',
        'parking_bay_area',
        'dedicated_common_area',
        'total_component_area',
        'principal_common_area',
        'common_element_area',
        'total_common_area'
      ];
      
      // Create ratios for each combination and each ratio type
      let generatedRatios: CombinationRatio[] = [];
      let idCounter = 1;
      
      ratioTypes.forEach(ratioType => {
        const ratiosForType = allCombinations.map((combination) => {
          const entityIds = combination.map(entity => entity.id);
          
          // Create meaningful names based on entity count
          const name = entityIds.length === 1 
            ? combination[0].name
            : entityIds.length === entities.length 
              ? 'All Entities' 
              : combination.length <= 2
                ? `${combination.map(e => e.name.split(' ')[0]).join(' & ')}`
                : `Combination of ${combination.length} entities`;
              
          const description = `${getRatioTypeDisplayName(ratioType)} ratio for ${
            entityIds.length === 1 
              ? combination[0].name
              : entityIds.length === entities.length 
                ? 'all entities' 
                : combination.map(e => e.name).join(', ')
          }`;
              
          return {
            id: idCounter++,
            name,
            entityIds,
            description,
            ratioValue: calculateSummaryRatio(entityIds, ratioType),
            ratioType: ratioType
          };
        });
        
        generatedRatios = [...generatedRatios, ...ratiosForType];
      });
      
      // Update state with generated combinations
      setCombinationRatios(generatedRatios);
      
      // Notify parent component of the generated ratios immediately
      // Do this silently without toast notifications
      if (onSave) {
        console.log("Silently updating parent with generated combination ratios:", generatedRatios.length);
        onSave(generatedRatios);
      }
    }
  }, [entities, sharedAreas, onSave]);

  // Calculate entity-specific ratios within a combination
  const calculateEntityRatios = (
    entityIds: number[], 
    ratioType: RatioType = 'sellable_area',
    storedEntityValues?: Record<number, number> // Add parameter to use stored values
  ): { [entityId: number]: { area: number; percentage: string; display: string } } => {
    const result: { [entityId: number]: { area: number; percentage: string; display: string } } = {};
    
    // For combinations of 1 entity, it's always 100%
    if (entityIds.length === 1) {
      const entityId = entityIds[0];
      const entity = entities.find(e => e.id === entityId);
      // Add null check for entity
      if (!entity) {
        return result;
      }
      
      // Use stored value if available, otherwise calculate it
      const area = storedEntityValues && storedEntityValues[entityId] !== undefined
        ? storedEntityValues[entityId]
        : getEntityAreaByType(entity, ratioType);
        
      result[entityId] = { 
        area,
        percentage: '100.0%', 
        display: `${area.toFixed(2)} ${unitType}\n100.0%` 
      };
      return result;
    }

    // Get the total area for the selected ratio type
    let totalArea = 0;
    const entityAreas: { [id: number]: number } = {};

    // Calculate each entity's area and total area
    // Use stored values if available, otherwise recalculate
    if (storedEntityValues && Object.keys(storedEntityValues).length > 0) {
      // Using stored values
      entityIds.forEach(entityId => {
        if (storedEntityValues[entityId] !== undefined) {
          const area = storedEntityValues[entityId];
          entityAreas[entityId] = area;
          totalArea += area;
        } else {
          // Fallback to calculation if entity is not in stored values
          const entity = entities.find(e => e.id === entityId);
          if (entity) {
            const area = getEntityAreaByType(entity, ratioType);
            entityAreas[entityId] = area;
            totalArea += area;
          }
        }
      });
    } else {
      // Calculate from scratch
      entities
        .filter(entity => entityIds.includes(entity.id))
        .forEach(entity => {
          const area = getEntityAreaByType(entity, ratioType);
          entityAreas[entity.id] = area;
          totalArea += area;
        });
    }
    
    // Calculate the ratio for each entity
    Object.entries(entityAreas).forEach(([id, area]) => {
      const entityId = parseInt(id);
      const percentage = totalArea > 0 ? (area / totalArea) * 100 : 0;
      const percentageStr = totalArea > 0 ? `${percentage.toFixed(1)}%` : 'N/A';
      
      result[entityId] = { 
        area,
        percentage: percentageStr,
        display: totalArea > 0 
          ? `${area.toFixed(2)} ${unitType}\n${percentageStr}`
          : `${area.toFixed(2)} ${unitType}\nN/A`
      };
    });
    
    return result;
  };
  
  // Helper function to get specific area type from an entity
  const getEntityAreaByType = (entity: Entity | undefined, ratioType: RatioType): number => {
    if (!entity) return 0; // Guard against undefined entity
    
    // Helper to safely parse float values from entity properties
    const safeParseFloat = (value: string | undefined): number => {
      if (!value) return 0;
      // Remove any leading zeros in numbers like "04500" to properly parse
      const cleanedValue = value.replace(/^0+(\d)/, '$1');
      return parseFloat(cleanedValue || '0');
    };
    
    switch(ratioType) {
      case 'sellable_area':
        // Use the actual sellable area from the entity data
        return safeParseFloat(entity.sellableArea || entity.suitArea || '0');
      case 'parking_bay_area':
        return safeParseFloat(entity.parkingBayArea || '0');
      case 'dedicated_common_area':
        return safeParseFloat(entity.dedicatedCommonArea || '0');
      case 'total_component_area': {
        // Calculate Total Component Area directly as the sum of all components
        // Use the safe parse function to handle values properly
        const suitAreaValue = safeParseFloat(entity.suitArea);
        const balconyAreaValue = safeParseFloat(entity.balconyArea);
        const sellableAreaValue = safeParseFloat(entity.sellableArea || 
          (suitAreaValue + balconyAreaValue).toString());
        const parkingBayAreaValue = safeParseFloat(entity.parkingBayArea);
        const dedicatedCommonAreaValue = safeParseFloat(entity.dedicatedCommonArea);
        
        // Calculate Principal Common Area allocation
        const pcaSellableAreaSum = entities.reduce((sum, e) => 
          sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
        const pcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
        const pcaEntityProportion = pcaSellableAreaSum > 0 ? 
          pcaEntitySellableArea / pcaSellableAreaSum : 0;
        
        const pcaTotalArea = sharedAreas && sharedAreas.length > 0 ?
          sharedAreas
            .filter(area => area && area.type === 'principal_common')
            .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
          : 0;
        
        const pcaShare = pcaTotalArea * pcaEntityProportion;
        
        // Calculate Common Element Area allocation
        let ceShare = 0;
        
        // Get all common element areas
        const ceAreaList = sharedAreas.filter(area => area.type === 'common_element');
        
        // For each common element area, calculate this entity's share
        ceAreaList.forEach(commonElementArea => {
          // If this area has beneficiaries defined
          if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
            // Check if this entity is a beneficiary of this area
            const beneficiary = commonElementArea.beneficiaries.find(
              (b: EntityBeneficiary) => b.entityId === entity.id
            );
            
            if (beneficiary) {
              // If entity is explicitly defined as a beneficiary, use its allocation percentage
              const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
              ceShare += parseFloat(commonElementArea.area) * allocationPercentage;
            }
          } else {
            // If no beneficiaries are defined, distribute to all entities based on sellable area
            const entitySellableAreaForCE = parseFloat(entity.sellableArea || entity.suitArea || '0');
            
            // Only calculate against the total of entities that should receive an allocation
            const totalSellableAreaForThisCE = entities.reduce((sum, e) => {
              return sum + parseFloat(e.sellableArea || e.suitArea || '0');
            }, 0);
            
            const ratioCE = totalSellableAreaForThisCE > 0 ? 
              entitySellableAreaForCE / totalSellableAreaForThisCE : 0;
              
            ceShare += parseFloat(commonElementArea.area) * ratioCE;
          }
        });
        
        // Sum all components
        return sellableAreaValue + parkingBayAreaValue + dedicatedCommonAreaValue + pcaShare + ceShare;
      }
      case 'applicable_area': {
        // Applicable Area = Suit Area + (25% of Balcony Area)
        const suitArea = safeParseFloat(entity.suitArea);
        const balconyArea = safeParseFloat(entity.balconyArea);
        return safeParseFloat(entity.applicableArea || (suitArea + (balconyArea * 0.25)).toString());
      }
      case 'principal_common_area': {
        // Calculate entity's proportional share of principal common areas
        // The share is based on the entity's sellable area proportion
        const pcaSellableAreaSum = entities.reduce((sum, e) => 
          sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
        
        const pcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
        const pcaEntityProportion = pcaSellableAreaSum > 0 ? 
          pcaEntitySellableArea / pcaSellableAreaSum : 0;
          
        // Get total principal common areas
        const pcaTotalArea = sharedAreas && sharedAreas.length > 0 ?
          sharedAreas
            .filter(area => area && area.type === 'principal_common')
            .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
          : 0;
          
        // Return entity's share of principal common areas
        return pcaTotalArea * pcaEntityProportion;
      }
      case 'common_element_area': {
        // Calculate entity's share of all common element areas
        // Process each common element area separately based on its beneficiaries
        let totalCeAllocation = 0;
        
        // Get all common element areas - add null checks
        const ceAreaList = sharedAreas && sharedAreas.length > 0 ?
          sharedAreas.filter(area => area && area.type === 'common_element') : [];
        
        // For each common element area, calculate this entity's share
        ceAreaList.forEach(commonElementArea => {
          // If this area has beneficiaries defined
          if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
            // Check if this entity is a beneficiary of this area
            const beneficiary = commonElementArea.beneficiaries.find(
              (b: EntityBeneficiary) => b.entityId === entity.id
            );
            
            if (beneficiary) {
              // If entity is explicitly defined as a beneficiary, use its allocation percentage
              const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
              totalCeAllocation += parseFloat(commonElementArea.area) * allocationPercentage;
            }
          } else {
            // If no beneficiaries are defined, distribute to all entities based on sellable area
            const entitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
            
            // Only calculate against the total of entities that should receive an allocation
            const totalSellableAreaForThisElement = entities.reduce((sum, e) => {
              return sum + parseFloat(e.sellableArea || e.suitArea || '0');
            }, 0);
            
            const ratio = totalSellableAreaForThisElement > 0 ? 
              entitySellableArea / totalSellableAreaForThisElement : 0;
              
            totalCeAllocation += parseFloat(commonElementArea.area) * ratio;
          }
        });
        
        return totalCeAllocation;
      }
      case 'total_common_area': {
        // Get entity's direct dedicated common area
        const dedicatedArea = parseFloat(entity.dedicatedCommonArea || '0');
        
        // Calculate entity's proportional share of principal common areas
        // The share is based on the entity's sellable area proportion
        const tcaSellableAreaSum = entities.reduce((sum, e) => 
          sum + parseFloat(e.sellableArea || e.suitArea || '0'), 0);
        
        const tcaEntitySellableArea = parseFloat(entity.sellableArea || entity.suitArea || '0');
        const tcaEntityProportion = tcaSellableAreaSum > 0 ? 
          tcaEntitySellableArea / tcaSellableAreaSum : 0;
          
        // Get principal common areas - add null checks
        const tcaPrincipalArea = sharedAreas && sharedAreas.length > 0 ?
          sharedAreas
            .filter(area => area && area.type === 'principal_common')
            .reduce((sum, area) => sum + parseFloat(area.area || '0'), 0)
          : 0;
        
        // Calculate entity's share of principal common areas
        const tcaPrincipalShare = tcaPrincipalArea * tcaEntityProportion;
        
        // Calculate entity's share of all common element areas
        let tcaCeShare = 0;
        
        // Get all common element areas for total common area - add null checks
        const tcaCeAreaList = sharedAreas && sharedAreas.length > 0 ?
          sharedAreas.filter(area => area && area.type === 'common_element') : [];
        
        // For each common element area, calculate this entity's share
        tcaCeAreaList.forEach(commonElementArea => {
          // If this area has beneficiaries defined
          if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
            // Check if this entity is a beneficiary of this area
            const beneficiary = commonElementArea.beneficiaries.find(
              (b: EntityBeneficiary) => b.entityId === entity.id
            );
            
            if (beneficiary) {
              // If entity is explicitly defined as a beneficiary, use its allocation percentage
              const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
              tcaCeShare += parseFloat(commonElementArea.area) * allocationPercentage;
            }
          } else {
            // If no beneficiaries are defined, distribute to all entities based on sellable area
            // Only calculate against the total of entities that should receive an allocation
            const totalSellableAreaForThisElement = entities.reduce((sum, e) => {
              return sum + parseFloat(e.sellableArea || e.suitArea || '0');
            }, 0);
            
            const ratio = totalSellableAreaForThisElement > 0 ? 
              tcaEntitySellableArea / totalSellableAreaForThisElement : 0;
              
            tcaCeShare += parseFloat(commonElementArea.area) * ratio;
          }
        });
        
        // Sum all components
        return dedicatedArea + tcaPrincipalShare + tcaCeShare;
      }
      default:
        return 0;
    }
  };
  
  // Calculate summary ratio for display
  const calculateSummaryRatio = (
    entityIds: number[], 
    ratioType: RatioType = 'sellable_area'
  ): string => {
    // For a single entity, it's always 100%
    if (entityIds.length === 1) {
      return '100.0%';
    }
    
    // Get the ratios
    const entityRatios = calculateEntityRatios(entityIds, ratioType);
    
    // For multiple entities, return a summary like "60.5% : 39.5%"
    return Object.values(entityRatios)
      .map(ratio => ratio.percentage)
      .join(' : ');
  };

  // Open dialog to add a new ratio
  const openAddDialog = () => {
    setCurrentRatio(null);
    setSelectedEntityIds([]);
    setRatioName('');
    setRatioDescription('');
    setSelectedRatioType('sellable_area');
    setIsDialogOpen(true);
  };

  // Open dialog to edit an existing ratio
  const openEditDialog = (ratio: CombinationRatio) => {
    setCurrentRatio(ratio);
    setSelectedEntityIds(ratio.entityIds);
    setRatioName(ratio.name);
    setRatioDescription(ratio.description || '');
    setSelectedRatioType(ratio.ratioType || 'sellable_area');
    setIsDialogOpen(true);
  };

  // Save the current ratio (add or update)
  const saveRatio = () => {
    if (selectedEntityIds.length === 0) {
      // Should show an error that at least one entity must be selected
      return;
    }
    
    if (!ratioName.trim()) {
      // Should show an error that a name is required
      return;
    }
    
    // Calculate the entity-specific ratios to store actual values for each entity
    const entityRatios = calculateEntityRatios(selectedEntityIds, selectedRatioType);
    
    // Create an entityValues object that contains the actual numerical values
    const entityValues: Record<number, number> = {};
    for (const entityId of selectedEntityIds) {
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        entityValues[entityId] = getEntityAreaByType(entity, selectedRatioType);
      }
    }
    
    const newRatio: CombinationRatio = {
      id: currentRatio ? currentRatio.id : Date.now(),
      name: ratioName,
      entityIds: selectedEntityIds,
      description: ratioDescription || undefined,
      ratioValue: calculateSummaryRatio(selectedEntityIds, selectedRatioType),
      ratioType: selectedRatioType,
      // Add actual numeric entity values to preserve them
      entityValues: entityValues
    };
    
    if (currentRatio) {
      // Update existing ratio
      setCombinationRatios(prev => 
        prev.map(r => r.id === currentRatio.id ? newRatio : r)
      );
    } else {
      // Add new ratio
      setCombinationRatios(prev => [...prev, newRatio]);
    }
    
    // Close the dialog
    setIsDialogOpen(false);
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave([...combinationRatios, newRatio]);
    }
  };

  // Delete a ratio
  const deleteRatio = (id: number) => {
    setCombinationRatios(prev => prev.filter(r => r.id !== id));
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(combinationRatios.filter(r => r.id !== id));
    }
  };

  // Toggle an entity selection
  const toggleEntitySelection = (entityId: number) => {
    setSelectedEntityIds(prev => 
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  // Toggle ratio type
  const toggleRatioType = (type: RatioType) => {
    setSelectedRatioType(type);
  };
  
  // Filter related functions
  const toggleRatioFilter = (type: RatioType) => {
    setSelectedRatioFilters(prev => {
      // If it's already in the list, remove it, otherwise add it
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  const isRatioFilterActive = (type: RatioType): boolean => {
    // If no filters are selected, everything is shown
    if (selectedRatioFilters.length === 0) return true;
    // Otherwise check if this type is in the filter list
    return selectedRatioFilters.includes(type);
  };
  
  const handleAllRatioFilter = (checked: boolean) => {
    if (checked) {
      // Clear all filters when "Show All" is checked
      setSelectedRatioFilters([]);
    }
  };
  
  // Get filtered ratios
  const getFilteredRatios = (): CombinationRatio[] => {
    if (selectedRatioFilters.length === 0) {
      return combinationRatios;
    }
    
    return combinationRatios.filter(ratio => {
      const ratioType = ratio.ratioType || 'sellable_area';
      return selectedRatioFilters.includes(ratioType);
    });
  };

  // Get entity names for a given list of entity IDs
  const getEntityNames = (entityIds: number[]): string => {
    return entities
      .filter(entity => entityIds.includes(entity.id))
      .map(entity => entity.name)
      .join(', ');
  };

  // Get the display name for a ratio
  const getRatioDisplayName = (ratio: CombinationRatio): string => {
    if (ratio.name) return ratio.name;
    
    if (ratio.entityIds.length === 1) {
      const entity = entities.find(e => e.id === ratio.entityIds[0]);
      return entity?.name || `Entity ${ratio.entityIds[0]}`;
    }
    
    if (ratio.entityIds.length === entities.length) {
      return "All Entities";
    }
    
    return `Combination ${ratio.id}`;
  };

  // Get color class based on ratio type
  const getRatioTypeColorClass = (type: RatioType): string => {
    switch (type) {
      case 'sellable_area':
        return 'bg-blue-100 border-blue-300';
      case 'parking_bay_area':
        return 'bg-green-100 border-green-300';
      case 'dedicated_common_area':
        return 'bg-purple-100 border-purple-300';
      case 'total_component_area':
        return 'bg-red-100 border-red-300';
      case 'applicable_area':
        return 'bg-amber-100 border-amber-300';
      case 'principal_common_area':
        return 'bg-cyan-100 border-cyan-300';
      case 'common_element_area':
        return 'bg-indigo-100 border-indigo-300';
      case 'total_common_area':
        return 'bg-fuchsia-100 border-fuchsia-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  // Get display name for ratio type
  const getRatioTypeDisplayName = (type: RatioType): string => {
    switch (type) {
      case 'sellable_area':
        return 'Sellable Area';
      case 'parking_bay_area':
        return 'Parking Bay Area';
      case 'dedicated_common_area':
        return 'Dedicated Common Area';
      case 'total_component_area':
        return 'Total Component Area';
      case 'applicable_area':
        return 'Applicable Area';
      case 'principal_common_area':
        return 'Principal Common Area';
      case 'common_element_area':
        return 'Common Element Area';
      case 'total_common_area':
        return 'Total Common Area';
      default:
        return String(type).replace(/_/g, ' ');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Ratio Combinations</CardTitle>
            <CardDescription>
              Manage allocation ratios between different entities
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onManageSpecialAreas && onManageSpecialAreas()}>
              <LayoutIcon className="h-4 w-4 mr-2" />
              Manage Special Areas
            </Button>
            <Button size="sm" variant="outline" onClick={openAddDialog}>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add Ratio
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {combinationRatios.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Entities</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {entities.map(entity => (
                    <Badge
                      key={entity.id}
                      variant="outline"
                      className="bg-slate-50 px-3 py-1"
                    >
                      {entity.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Ratio Type Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-2">
                  <div className="flex items-center">
                    <Checkbox id="filter-all" checked={selectedRatioFilters.length === 0} onCheckedChange={handleAllRatioFilter} />
                    <Label htmlFor="filter-all" className="ml-2 cursor-pointer">Show All Ratio Types</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('sellable_area') ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('sellable_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-blue-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Sellable Area</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('parking_bay_area') ? 'border-green-500 bg-green-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('parking_bay_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-green-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Parking Bay Area</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('applicable_area') ? 'border-amber-500 bg-amber-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('applicable_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-amber-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Applicable Area</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('dedicated_common_area') ? 'border-purple-500 bg-purple-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('dedicated_common_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-purple-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Dedicated Common</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('total_component_area') ? 'border-red-500 bg-red-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('total_component_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-red-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Total Component</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('principal_common_area') ? 'border-cyan-500 bg-cyan-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('principal_common_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-cyan-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Principal Common</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('common_element_area') ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('common_element_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-indigo-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Common Element</span>
                  </div>
                  <div 
                    className={`border rounded-md p-2 cursor-pointer ${isRatioFilterActive('total_common_area') ? 'border-fuchsia-500 bg-fuchsia-100' : 'border-gray-200'}`}
                    onClick={() => toggleRatioFilter('total_common_area')}
                  >
                    <span className="inline-block w-3 h-3 bg-fuchsia-300 rounded-sm mr-1"></span>
                    <span className="text-xs">Total Common</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entity Combinations Matrix */}
            <div>
              <h3 className="text-sm font-medium mb-2">Ratio Matrix</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Each ratio is displayed as a row, with the ratio distribution shown between entities.
              </p>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Ratio Name</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[120px]">Distribution</TableHead>
                      {entities.map(entity => (
                        <TableHead key={entity.id} className="text-center w-[100px]">
                          {entity.name}
                        </TableHead>
                      ))}
                      <TableHead className="text-right w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredRatios().length > 0 ? (
                      getFilteredRatios().map(ratio => {
                        // Use stored entity values if available
                        const entityRatios = calculateEntityRatios(
                          ratio.entityIds, 
                          ratio.ratioType,
                          ratio.entityValues
                        );
                        
                        const ratioTypeClass = getRatioTypeColorClass(
                          ratio.ratioType || 'sellable_area'
                        );
                        
                        return (
                          <TableRow key={ratio.id}>
                            <TableCell className="font-medium">
                              {getRatioDisplayName(ratio)}
                              {ratio.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {ratio.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${ratioTypeClass} text-xs border py-0.5 font-normal text-black`}>
                                {getRatioTypeDisplayName(ratio.ratioType || 'sellable_area')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {ratio.ratioValue || calculateSummaryRatio(ratio.entityIds, ratio.ratioType)}
                              </span>
                            </TableCell>
                            
                            {entities.map(entity => {
                              const isIncluded = ratio.entityIds.includes(entity.id);
                              
                              return (
                                <TableCell key={entity.id} className="text-center p-2">
                                  {isIncluded ? (
                                    <div className={`px-3 py-1.5 rounded ${ratioTypeClass} whitespace-pre-line text-xs text-center`}>
                                      {entityRatios[entity.id]?.display}
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 text-xs">—</div>
                                  )}
                                </TableCell>
                              );
                            })}
                            
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDeriveRatio && onDeriveRatio(ratio)}
                                title="Create Derived Ratio"
                              >
                                <GitBranchIcon className="h-3.5 w-3.5" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(ratio)}
                                title="Edit Ratio"
                              >
                                <EditIcon className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => deleteRatio(ratio.id)}
                                title="Delete Ratio"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={entities.length + 4} className="text-center h-24 text-muted-foreground">
                          No ratios match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-md border border-dashed">
            <h3 className="mt-2 text-sm font-medium text-slate-900">No ratio combinations</h3>
            <p className="mt-1 text-sm text-slate-500">
              Get started by adding a new ratio combination.
            </p>
            <div className="mt-6">
              <Button onClick={openAddDialog}>
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Add Ratio
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Dialog for adding/editing a ratio */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentRatio ? "Edit Ratio" : "Add New Ratio"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ratio-name">Ratio Name</Label>
              <Input
                id="ratio-name"
                value={ratioName}
                onChange={(e) => setRatioName(e.target.value)}
                placeholder="Enter a name for this ratio"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ratio-description">Description (Optional)</Label>
              <Input
                id="ratio-description"
                value={ratioDescription}
                onChange={(e) => setRatioDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ratio Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'sellable_area', label: 'Sellable Area', colorClass: 'bg-blue-100 border-blue-300' },
                  { type: 'applicable_area', label: 'Applicable Area', colorClass: 'bg-amber-100 border-amber-300' },
                  { type: 'parking_bay_area', label: 'Parking Bay Area', colorClass: 'bg-green-100 border-green-300' },
                  { type: 'dedicated_common_area', label: 'Dedicated Common Area', colorClass: 'bg-purple-100 border-purple-300' },
                  { type: 'principal_common_area', label: 'Principal Common Area', colorClass: 'bg-cyan-100 border-cyan-300' },
                  { type: 'common_element_area', label: 'Common Element Area', colorClass: 'bg-indigo-100 border-indigo-300' },
                  { type: 'total_component_area', label: 'Total Component Area', colorClass: 'bg-red-100 border-red-300' },
                  { type: 'total_common_area', label: 'Total Common Area', colorClass: 'bg-fuchsia-100 border-fuchsia-300' },
                ].map(option => (
                  <Badge
                    key={option.type}
                    className={`${option.colorClass} cursor-pointer border text-xs py-1 px-2 font-normal flex items-center justify-center text-black ${
                      selectedRatioType === option.type ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                    }`}
                    onClick={() => toggleRatioType(option.type as RatioType)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select Entities</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {entities.length > 0 ? (
                  entities.map(entity => (
                    <div key={entity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`entity-${entity.id}`}
                        checked={selectedEntityIds.includes(entity.id)}
                        onCheckedChange={() => toggleEntitySelection(entity.id)}
                      />
                      <Label
                        htmlFor={`entity-${entity.id}`}
                        className="cursor-pointer text-sm flex-1"
                      >
                        {entity.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No entities available. Add entities first.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveRatio}
              disabled={selectedEntityIds.length === 0 || !ratioName.trim()}
            >
              {currentRatio ? "Save Changes" : "Create Ratio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CombinationRatiosDisplay;
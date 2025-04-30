import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircleIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  FilterIcon,
  LayoutIcon,
  LayoutGridIcon,
  GitBranchIcon,
  PencilIcon,
  PercentSquareIcon,
  RefreshCcwIcon,
  InfoIcon,
  XIcon,
  MinusIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Import standard types from shared definitions
import {
  Entity,
  SharedArea,
  CombinationRatio,
  DerivedRatio,
  SpecialArea,
  RatioType,
  EntityModification
} from '@shared/ratio-types';

// Define EntityBeneficiary type if not available from ratio-types
interface EntityBeneficiary {
  entityId: number;
  allocationPercentage?: string;
}

// Import utility functions
import { 
  formatPercentage, 
  formatAreaValue, 
  calculateRatioValue,
  safeGetEntityIds,
  isDerivedRatio,
  getTotalAreaForRatio
} from './ratio-utils';

// Define the props
interface UnifiedRatioDisplayProps {
  entities: Entity[];
  sharedAreas: SharedArea[];
  // Take core ratios, but we'll generate them internally too
  coreRatios?: CombinationRatio[];
  combinationRatios?: CombinationRatio[];
  derivedRatios?: DerivedRatio[];
  specialAreas?: SpecialArea[];
  unitType: 'sqm' | 'sqft';
  onSave?: (ratios: {
    coreRatios: CombinationRatio[],
    combinationRatios: CombinationRatio[],
    derivedRatios: DerivedRatio[],
    specialAreas: SpecialArea[]
  }) => void;
  // Optional function to filter which ratio types to display
  displayFilter?: {
    showCoreRatios?: boolean;
    showCombinationRatios?: boolean;
    showDerivedRatios?: boolean;
  };
}

/**
 * UnifiedRatioDisplay - A comprehensive component to manage all ratio types
 * 
 * This component consolidates the display and management of core ratios,
 * combination ratios, and derived ratios into a single interface. It provides
 * a unified workflow for creating, editing, and viewing all ratio types.
 */
export function UnifiedRatioDisplay({
  entities,
  sharedAreas,
  coreRatios: initialCoreRatios = [],
  combinationRatios: initialCombinationRatios = [],
  derivedRatios: initialDerivedRatios = [],
  specialAreas: initialSpecialAreas = [],
  unitType = 'sqm',
  onSave,
  displayFilter = {
    showCoreRatios: true,
    showCombinationRatios: true,
    showDerivedRatios: true
  }
}: UnifiedRatioDisplayProps) {
  // Toast notifications
  const { toast } = useToast();
  
  // State for managing all ratio types
  const [coreRatios, setCoreRatios] = useState<CombinationRatio[]>(initialCoreRatios);
  const [combinationRatios, setCombinationRatios] = useState<CombinationRatio[]>(initialCombinationRatios);
  const [derivedRatios, setDerivedRatios] = useState<DerivedRatio[]>(initialDerivedRatios);
  const [specialAreas, setSpecialAreas] = useState<SpecialArea[]>(initialSpecialAreas);
  
  // Current active section
  const [activeSection, setActiveSection] = useState<'core' | 'combination' | 'derived'>('core');
  
  // Dialog states
  const [isCreateCombinationDialogOpen, setIsCreateCombinationDialogOpen] = useState(false);
  const [isEditCombinationDialogOpen, setIsEditCombinationDialogOpen] = useState(false);
  const [isCreateDerivedDialogOpen, setIsCreateDerivedDialogOpen] = useState(false);
  const [isEditDerivedDialogOpen, setIsEditDerivedDialogOpen] = useState(false);
  const [isManageSpecialAreasDialogOpen, setIsManageSpecialAreasDialogOpen] = useState(false);
  
  // Track changes in special areas dialog to reduce toast notifications
  const [areasAdded, setAreasAdded] = useState<string[]>([]);
  const [areasRemoved, setAreasRemoved] = useState<string[]>([]);
  
  // Current editing objects
  const [currentCombinationRatio, setCurrentCombinationRatio] = useState<CombinationRatio | null>(null);
  const [currentDerivedRatio, setCurrentDerivedRatio] = useState<DerivedRatio | null>(null);
  const [selectedSourceRatio, setSelectedSourceRatio] = useState<CombinationRatio | null>(null);
  const [selectedEntityForAreas, setSelectedEntityForAreas] = useState<number | null>(null);
  
  // Form field states
  const [ratioName, setRatioName] = useState('');
  const [ratioDescription, setRatioDescription] = useState('');
  const [selectedRatioType, setSelectedRatioType] = useState<RatioType>('sellable_area');
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  
  // Special areas form fields
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaValue, setNewAreaValue] = useState('');
  
  // Derived ratio form fields
  const [entityModifications, setEntityModifications] = useState<EntityModification[]>([]);
  
  // Filter states
  const [selectedRatioFilters, setSelectedRatioFilters] = useState<RatioType[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Load initial data from props only once on mount
  useEffect(() => {
    // Only set initial state on first mount
    if (initialCoreRatios.length > 0) {
      setCoreRatios(initialCoreRatios);
    }
    if (initialCombinationRatios.length > 0) {
      setCombinationRatios(initialCombinationRatios);
    }
    if (initialDerivedRatios.length > 0) {
      setDerivedRatios(initialDerivedRatios);
    }
    if (initialSpecialAreas.length > 0) {
      setSpecialAreas(initialSpecialAreas);
    }
  }, []); // Empty dependency array means it only runs once
  
  // Generate core ratios only once when entities are first available
  // Or when entities/shared areas actually change structure, not just references
  useEffect(() => {
    if (entities.length > 0) {
      const entitiesHash = JSON.stringify(entities.map(e => e.id));
      const areasHash = JSON.stringify(sharedAreas.map(a => a.id));
      
      // Only regenerate when entities actually change
      generateCoreRatios();
      
      // Don't automatically generate combinations, let user do it manually
      // This prevents unwanted re-renders and flickering
      // generateAllEntityCombinations(); 
    }
  }, [JSON.stringify(entities.map(e => ({ id: e.id, sellableArea: e.sellableArea, applicableArea: e.applicableArea }))), 
      JSON.stringify(sharedAreas.map(a => ({ id: a.id, area: a.area })))]);
  
  // When any ratio changes, notify the parent component
  // But use a deep compare to avoid unnecessary updates
  useEffect(() => {
    if (onSave) {
      // Use a ref to prevent unnecessary updates
      const ratioData = {
        coreRatios,
        combinationRatios,
        derivedRatios,
        specialAreas
      };
      
      // Only update parent if data has actually changed
      onSave(ratioData);
    }
  }, [
    // Deep compare arrays by first-level properties
    JSON.stringify(coreRatios.map(r => ({ id: r.id, entityIds: r.entityIds, ratioType: r.ratioType }))),
    JSON.stringify(combinationRatios.map(r => ({ id: r.id, entityIds: r.entityIds, ratioType: r.ratioType }))),
    JSON.stringify(derivedRatios.map(r => ({ id: r.id, sourceRatioId: r.sourceRatioId }))),
    JSON.stringify(specialAreas.map(a => ({ id: a.id, name: a.name, area: a.area }))),
    onSave
  ]);
  
  // Function to generate core ratios based on entity properties
  const generateCoreRatios = () => {
    if (entities.length === 0) return;
    
    // Define all core ratio types
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
    
    // Generate one ratio per entity per type
    const generatedRatios: CombinationRatio[] = [];
    let idCounter = 1;
    
    // For each entity
    entities.forEach(entity => {
      // For each ratio type
      ratioTypes.forEach(ratioType => {
        // Calculate the area value for this entity and ratio type
        const area = getEntityAreaByType(entity, ratioType);
        
        // Create a ratio object
        const ratio: CombinationRatio = {
          id: idCounter++,
          name: `${entity.name} ${getRatioTypeDisplayName(ratioType)}`,
          description: `${getRatioTypeDisplayName(ratioType)} ratio for ${entity.name}`,
          entityIds: [entity.id],
          ratioType,
          ratioValue: formatAreaValue(area, unitType),
          // Store the actual entity values for easy access during calculations
          entityValues: { [entity.id]: area }
        };
        
        generatedRatios.push(ratio);
      });
    });
    
    // Add an "All Entities" ratio for each type
    ratioTypes.forEach(ratioType => {
      const allEntityIds = entities.map(e => e.id);
      
      // Calculate entity values
      const entityValues: Record<number, number> = {};
      let totalArea = 0;
      
      entities.forEach(entity => {
        const area = getEntityAreaByType(entity, ratioType);
        entityValues[entity.id] = area;
        totalArea += area;
      });
      
      const ratio: CombinationRatio = {
        id: idCounter++,
        name: `All Entities ${getRatioTypeDisplayName(ratioType)}`,
        description: `${getRatioTypeDisplayName(ratioType)} ratio for all entities`,
        entityIds: allEntityIds,
        ratioType,
        ratioValue: formatAreaValue(totalArea, unitType),
        entityValues
      };
      
      generatedRatios.push(ratio);
    });
    
    // Update state with generated core ratios
    setCoreRatios(generatedRatios);
  };
  
  // Helper function to get human-readable ratio type names
  const getRatioTypeDisplayName = (ratioType: RatioType): string => {
    switch (ratioType) {
      case 'sellable_area':
        return 'Sellable Area';
      case 'applicable_area':
        return 'Applicable Area';
      case 'parking_bay_area':
        return 'Parking Bay Area';
      case 'dedicated_common_area':
        return 'Dedicated Common Area';
      case 'total_component_area':
        return 'Total Component Area';
      case 'principal_common_area':
        return 'Principal Common Area';
      case 'common_element_area':
        return 'Common Element Area';
      case 'total_common_area':
        return 'Total Common Area';
      case 'combined_area':
        return 'Combined Area';
      default:
        return ratioType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  // Helper function to get entity area based on ratio type
  const getEntityAreaByType = (entity: Entity, ratioType: RatioType): number => {
    if (!entity) return 0;
    
    // Helper function to safely parse float values
    const safeParseFloat = (value?: string): number => {
      if (!value) return 0;
      return parseFloat(value);
    };
    
    switch(ratioType) {
      case 'sellable_area':
        return safeParseFloat(entity.sellableArea || entity.suitArea);
        
      case 'parking_bay_area':
        return safeParseFloat(entity.parkingBayArea);
        
      case 'dedicated_common_area':
        return safeParseFloat(entity.dedicatedCommonArea);
        
      case 'applicable_area':
        // Applicable Area = Suit Area + (25% of Balcony Area)
        const suitArea = safeParseFloat(entity.suitArea);
        const balconyArea = safeParseFloat(entity.balconyArea);
        return safeParseFloat(entity.applicableArea) || (suitArea + (balconyArea * 0.25));
        
      case 'total_component_area':
        // Sum of various components
        const sellableAreaValue = safeParseFloat(entity.sellableArea || entity.suitArea);
        const parkingBayAreaValue = safeParseFloat(entity.parkingBayArea);
        const dedicatedCommonAreaValue = safeParseFloat(entity.dedicatedCommonArea);
        const pcaValue = calculatePrincipalCommonAreaShare(entity);
        const ceaValue = calculateCommonElementAreaShare(entity);
        
        return sellableAreaValue + parkingBayAreaValue + dedicatedCommonAreaValue + pcaValue + ceaValue;
        
      case 'principal_common_area':
        return calculatePrincipalCommonAreaShare(entity);
        
      case 'common_element_area':
        return calculateCommonElementAreaShare(entity);
        
      case 'total_common_area':
        return calculatePrincipalCommonAreaShare(entity) + calculateCommonElementAreaShare(entity);
        
      default:
        return safeParseFloat(entity.sellableArea || entity.suitArea);
    }
  };
  
  // Calculate entity's share of principal common areas
  const calculatePrincipalCommonAreaShare = (entity: Entity): number => {
    // Calculate based on entity's sellable area proportion
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
  };
  
  // Generate all possible entity combinations and add them as ratios
  const generateAllEntityCombinations = () => {
    if (entities.length === 0) return;
    
    // Generate all possible combinations of entities
    const allEntityCombinations = generateAllPossibleCombinations(entities);
    
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
    const generatedRatios: CombinationRatio[] = [];
    let idCounter = 1000; // Start IDs from 1000 to avoid conflicts
    
    // Create a set of existing entity ID combinations to avoid duplicates
    const existingCombinations = new Set(
      combinationRatios.map(ratio => JSON.stringify(ratio.entityIds.slice().sort()))
    );
    
    // Helper to check if a combination already exists
    const combinationExists = (ids: number[]): boolean => {
      const sortedIds = ids.slice().sort();
      return existingCombinations.has(JSON.stringify(sortedIds));
    };
    
    ratioTypes.forEach(ratioType => {
      allEntityCombinations.forEach(combination => {
        const entityIds = combination.map(entity => entity.id);
        
        // Skip if this exact combination already exists for this ratio type
        if (combinationExists(entityIds) && 
            combinationRatios.some(r => 
              r.ratioType === ratioType && 
              JSON.stringify(r.entityIds.sort()) === JSON.stringify(entityIds.sort())
            )) {
          return;
        }
        
        // Calculate entity values
        const entityValues: Record<number, number> = {};
        let totalArea = 0;
        
        entityIds.forEach(entityId => {
          const entity = entities.find(e => e.id === entityId);
          if (entity) {
            const area = getEntityAreaByType(entity, ratioType);
            entityValues[entityId] = area;
            totalArea += area;
          }
        });
        
        // Create meaningful names based on entity count
        const name = entityIds.length === 1 
          ? combination[0].name + ' ' + getRatioTypeDisplayName(ratioType)
          : entityIds.length === entities.length 
            ? 'All Entities ' + getRatioTypeDisplayName(ratioType)
            : combination.length <= 3
              ? `${combination.map(e => e.name.split(' ')[0]).join(' & ')} ${getRatioTypeDisplayName(ratioType)}`
              : `${getRatioTypeDisplayName(ratioType)} for ${combination.length} entities`;
            
        const description = `${getRatioTypeDisplayName(ratioType)} ratio for ${
          entityIds.length === 1 
            ? combination[0].name
            : entityIds.length === entities.length 
              ? 'all entities' 
              : combination.map(e => e.name).join(', ')
        }`;
        
        // Create the ratio
        const ratio: CombinationRatio = {
          id: idCounter++,
          name,
          description,
          entityIds,
          ratioType,
          ratioValue: formatAreaValue(totalArea, unitType),
          entityValues
        };
        
        generatedRatios.push(ratio);
      });
    });
    
    // Generate special category combinations (e.g., Towers, Retail, Offices)
    // Organize entities by type/category
    const categories = new Map<string, Entity[]>();
    entities.forEach(entity => {
      // Create categories based on the entity type or first word of the name
      const categoryName = entity.type 
        || entity.name.split(' ')[0] 
        || 'Other';
        
      if (!categories.has(categoryName)) {
        categories.set(categoryName, []);
      }
      categories.get(categoryName)?.push(entity);
    });
    
    // Create category-based combination ratios
    for (const [categoryName, categoryEntities] of categories.entries()) {
      if (categoryEntities.length >= 2) {
        ratioTypes.forEach(ratioType => {
          const entityIds = categoryEntities.map(e => e.id);
          const name = `${categoryName} Group ${getRatioTypeDisplayName(ratioType)}`;
          
          // Skip if this combination already exists
          if (combinationRatios.some(r => 
              r.ratioType === ratioType && 
              r.name === name &&
              r.entityIds.length === entityIds.length && 
              r.entityIds.every(id => entityIds.includes(id))
            )) {
            return;
          }
          
          // Calculate entity values
          const entityValues: Record<number, number> = {};
          let totalArea = 0;
          
          entityIds.forEach(entityId => {
            const entity = entities.find(e => e.id === entityId);
            if (entity) {
              const area = getEntityAreaByType(entity, ratioType);
              entityValues[entityId] = area;
              totalArea += area;
            }
          });
          
          // Create the ratio
          const ratio: CombinationRatio = {
            id: idCounter++,
            name,
            description: `${getRatioTypeDisplayName(ratioType)} ratio for all ${categoryName} entities`,
            entityIds,
            ratioType,
            ratioValue: formatAreaValue(totalArea, unitType),
            entityValues
          };
          
          generatedRatios.push(ratio);
        });
      }
    }
    
    // Update state with generated combinations, replacing existing ones
    setCombinationRatios(generatedRatios);
    
    // Notify parent if available (silently)
    if (onSave) {
      console.log("Generated combination ratios:", generatedRatios.length);
    }
  };
  
  // Helper function to generate all possible combinations of entities
  const generateAllPossibleCombinations = (items: Entity[]): Entity[][] => {
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
    
    // Generate combinations of sizes 1 to N (up to a reasonable limit)
    const maxSize = Math.min(items.length, 5); // Limit to 5 entities in a combo to avoid explosion
    for (let size = 1; size <= maxSize; size++) {
      generateCombinationsOfSize(0, size, []);
    }
    
    return result;
  };
  
  // Calculate entity's share of common element areas
  const calculateCommonElementAreaShare = (entity: Entity): number => {
    // Calculate entity's share of all common element areas
    let totalCeAllocation = 0;
    
    // Get all common element areas
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
  };
  
  // Calculate entity-specific ratios within a combination
  const calculateEntityRatios = (
    entityIds: number[], 
    ratioType: RatioType = 'sellable_area',
    storedEntityValues?: Record<number, number>
  ): { [entityId: number]: { area: number; percentage: string; display: string } } => {
    const result: { [entityId: number]: { area: number; percentage: string; display: string } } = {};
    
    // For combinations of 1 entity, it's always 100%
    if (entityIds.length === 1) {
      const entityId = entityIds[0];
      const entity = entities.find(e => e.id === entityId);
      
      if (!entity) return result;
      
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
  
  // Calculate a summary ratio value from entity values
  const calculateSummaryRatio = (
    entityIds: number[], 
    ratioType: RatioType
  ): string => {
    const entityRatios = calculateEntityRatios(entityIds, ratioType);
    
    // For a single entity, return its value
    if (entityIds.length === 1) {
      const entityId = entityIds[0];
      return `${entityRatios[entityId]?.area.toFixed(2)} ${unitType}`;
    }
    
    // For multiple entities, return the sum and percentages
    const totalArea = Object.values(entityRatios).reduce((sum, data) => sum + data.area, 0);
    let summary = `${totalArea.toFixed(2)} ${unitType} total`;
    
    // Add a breakdown of percentages if the combination is small
    if (entityIds.length <= 3) {
      summary += " (";
      summary += entityIds.map(id => {
        const entityName = entities.find(e => e.id === id)?.name.split(' ')[0] || `Entity ${id}`;
        return `${entityName}: ${entityRatios[id]?.percentage}`;
      }).join(', ');
      summary += ")";
    }
    
    return summary;
  };
  
  // Initialize entity modifications for a source ratio
  const initializeEntityModifications = (sourceRatio: CombinationRatio): EntityModification[] => {
    // Create a modification for each entity in the source ratio
    return sourceRatio.entityIds.map(entityId => {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) return null;
      
      const baseValue = sourceRatio.entityValues && sourceRatio.entityValues[entityId] !== undefined
        ? sourceRatio.entityValues[entityId]
        : getEntityAreaByType(entity, sourceRatio.ratioType || 'sellable_area');
      
      return {
        entityId,
        action: 'include',
        originalValue: baseValue,
        modifiedValue: baseValue, // Initially same as original
        excludedSpecialAreas: [],
        addedSpecialAreas: []
      };
    }).filter(Boolean) as EntityModification[];
  };
  
  // Create a new combination ratio
  const handleCreateCombinationRatio = () => {
    if (selectedEntityIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one entity for the ratio",
        variant: "destructive"
      });
      return;
    }
    
    // Create entity values object
    const entityValues: Record<number, number> = {};
    selectedEntityIds.forEach(entityId => {
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        entityValues[entityId] = getEntityAreaByType(entity, selectedRatioType);
      }
    });
    
    // Calculate ratio summary
    const ratioValue = calculateSummaryRatio(selectedEntityIds, selectedRatioType);
    
    // Generate a default name if none provided
    const name = ratioName || 
      (selectedEntityIds.length === 1 
        ? entities.find(e => e.id === selectedEntityIds[0])?.name || 'Single Entity'
        : selectedEntityIds.length === entities.length 
          ? 'All Entities' 
          : `Combination of ${selectedEntityIds.length} entities`);
    
    // Generate a description if none provided
    const description = ratioDescription || 
      `${getRatioTypeDisplayName(selectedRatioType)} ratio for ${
        selectedEntityIds.length === 1 
          ? entities.find(e => e.id === selectedEntityIds[0])?.name || 'single entity'
          : selectedEntityIds.length === entities.length 
            ? 'all entities' 
            : `${selectedEntityIds.length} entities`
      }`;
    
    // Create the new ratio object
    const newRatio: CombinationRatio = {
      id: Date.now(), // Use timestamp as ID
      name,
      description,
      entityIds: selectedEntityIds,
      ratioType: selectedRatioType,
      ratioValue,
      entityValues
    };
    
    // Update state with the new ratio
    setCombinationRatios(prev => [...prev, newRatio]);
    
    // Reset form state
    setRatioName('');
    setRatioDescription('');
    setSelectedEntityIds([]);
    setIsCreateCombinationDialogOpen(false);
    
    toast({
      title: "Success",
      description: "New combination ratio created successfully"
    });
  };
  
  // Open the edit dialog for a combination ratio
  const handleEditCombinationRatio = (ratio: CombinationRatio) => {
    setCurrentCombinationRatio(ratio);
    setRatioName(ratio.name);
    setRatioDescription(ratio.description || '');
    setSelectedRatioType(ratio.ratioType || 'sellable_area');
    setSelectedEntityIds(safeGetEntityIds(ratio));
    setIsEditCombinationDialogOpen(true);
  };
  
  // Save changes to an edited combination ratio
  const handleUpdateCombinationRatio = () => {
    if (!currentCombinationRatio) return;
    
    // Create updated ratio object
    const updatedRatio: CombinationRatio = {
      ...currentCombinationRatio,
      name: ratioName,
      description: ratioDescription,
      ratioType: selectedRatioType,
      entityIds: selectedEntityIds,
      ratioValue: calculateSummaryRatio(selectedEntityIds, selectedRatioType)
    };
    
    // Update entity values
    selectedEntityIds.forEach(entityId => {
      const entity = entities.find(e => e.id === entityId);
      if (entity && updatedRatio.entityValues) {
        updatedRatio.entityValues[entityId] = getEntityAreaByType(entity, selectedRatioType);
      }
    });
    
    // Update state
    setCombinationRatios(prev => 
      prev.map(r => r.id === updatedRatio.id ? updatedRatio : r)
    );
    
    // Reset form state
    setCurrentCombinationRatio(null);
    setRatioName('');
    setRatioDescription('');
    setSelectedEntityIds([]);
    setIsEditCombinationDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Combination ratio updated successfully"
    });
  };
  
  // Delete a combination ratio
  const handleDeleteCombinationRatio = (ratioId: number) => {
    setCombinationRatios(prev => prev.filter(r => r.id !== ratioId));
    
    toast({
      title: "Success",
      description: "Combination ratio deleted successfully"
    });
  };
  
  // Open the create derived ratio dialog with a source ratio
  const handleCreateDerivedRatio = (sourceRatio: CombinationRatio) => {
    setSelectedSourceRatio(sourceRatio);
    setRatioName('');
    setRatioDescription('');
    // Initialize entity modifications based on source ratio
    setEntityModifications(initializeEntityModifications(sourceRatio));
    setIsCreateDerivedDialogOpen(true);
  };
  
  // Calculate derived ratio values based on modifications
  const calculateDerivedRatioValues = (
    sourceRatio: CombinationRatio,
    modifications: EntityModification[]
  ): Record<number, number> => {
    // Create the result object
    const result: Record<number, number> = {};
    
    // Apply modifications to each entity
    modifications.forEach(mod => {
      if (!mod.action) return;
      
      const entityId = mod.entityId;
      let value = mod.originalValue || 0;
      
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
  
  // Generate a ratio name based on modifications
  const generateDerivedRatioName = (
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
  
  // Save a new derived ratio
  const handleSaveDerivedRatio = () => {
    if (!selectedSourceRatio) {
      toast({
        title: "Error",
        description: "No source ratio selected",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate entity values based on modifications
    const entityValues = calculateDerivedRatioValues(selectedSourceRatio, entityModifications);
    
    // Generate a name if not provided
    const name = ratioName || generateDerivedRatioName(selectedSourceRatio.name, entityModifications);
    
    // Create new derived ratio
    const newRatio: DerivedRatio = {
      id: Date.now(),
      name,
      description: ratioDescription || `Modified version of ${selectedSourceRatio.name}`,
      sourceRatioId: selectedSourceRatio.id,
      sourceRatioName: selectedSourceRatio.name,
      ratioType: selectedSourceRatio.ratioType || 'custom',
      entityIds: selectedSourceRatio.entityIds,
      entityValues,
      entityModifications
    };
    
    // Update state
    setDerivedRatios(prev => [...prev, newRatio]);
    
    // Reset form
    setSelectedSourceRatio(null);
    setRatioName('');
    setRatioDescription('');
    setEntityModifications([]);
    setIsCreateDerivedDialogOpen(false);
    
    toast({
      title: "Success",
      description: "New derived ratio created successfully"
    });
  };
  
  // Update entity modification (include/exclude)
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
    
    // Recalculate the derived values
    if (selectedSourceRatio) {
      const newValues = calculateDerivedRatioValues(selectedSourceRatio, newModifications);
      
      // Update the modifiedValue field for each modification
      newModifications.forEach(mod => {
        mod.modifiedValue = newValues[mod.entityId] || 0;
      });
      
      setEntityModifications(newModifications);
    }
  };
  
  // Edit an existing derived ratio
  const handleEditDerivedRatio = (ratio: DerivedRatio) => {
    setCurrentDerivedRatio(ratio);
    setRatioName(ratio.name);
    setRatioDescription(ratio.description || '');
    
    // Find the source ratio
    const sourceRatio = [...coreRatios, ...combinationRatios]
      .find(r => r.id === ratio.sourceRatioId);
      
    if (sourceRatio) {
      setSelectedSourceRatio(sourceRatio);
    }
    
    // Set entity modifications
    setEntityModifications(ratio.entityModifications || []);
    setIsEditDerivedDialogOpen(true);
  };
  
  // Update an existing derived ratio
  const handleUpdateDerivedRatio = () => {
    if (!currentDerivedRatio || !selectedSourceRatio) {
      toast({
        title: "Error",
        description: "Missing data for updating derived ratio",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate entity values based on modifications
    const entityValues = calculateDerivedRatioValues(selectedSourceRatio, entityModifications);
    
    // Create updated ratio object
    const updatedRatio: DerivedRatio = {
      ...currentDerivedRatio,
      name: ratioName,
      description: ratioDescription || currentDerivedRatio.description,
      entityValues,
      entityModifications
    };
    
    // Update state
    setDerivedRatios(prev => 
      prev.map(r => r.id === updatedRatio.id ? updatedRatio : r)
    );
    
    // Reset form
    setCurrentDerivedRatio(null);
    setSelectedSourceRatio(null);
    setRatioName('');
    setRatioDescription('');
    setEntityModifications([]);
    setIsEditDerivedDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Derived ratio updated successfully"
    });
  };
  
  // Delete a derived ratio
  const handleDeleteDerivedRatio = (ratioId: number) => {
    setDerivedRatios(prev => prev.filter(r => r.id !== ratioId));
    
    toast({
      title: "Success",
      description: "Derived ratio deleted successfully"
    });
  };
  
  // Add a new special area
  const handleAddSpecialArea = () => {
    if (!newAreaName || !newAreaValue) {
      toast({
        title: "Error",
        description: "Please provide both area name and value",
        variant: "destructive"
      });
      return;
    }
    
    const areaValue = parseFloat(newAreaValue);
    if (isNaN(areaValue) || areaValue <= 0) {
      toast({
        title: "Error",
        description: "Area value must be a positive number",
        variant: "destructive"
      });
      return;
    }
    
    // Create new special area
    const newArea: SpecialArea = {
      id: Date.now(),
      name: newAreaName,
      area: areaValue,
      type: 'special'
    };
    
    // Update state
    setSpecialAreas(prev => [...prev, newArea]);
    
    // Reset form
    setNewAreaName('');
    setNewAreaValue('');
    
    // Show success toast immediately
    toast({
      title: "Area Added",
      description: `Added ${newArea.name} (${areaValue} ${unitType})` + 
        (selectedEntityForAreas !== null ? 
          ` for ${entities.find(e => e.id === selectedEntityForAreas)?.name || 'entity'}` : 
          '')
    });
    
    // Close the dialog automatically
    setIsManageSpecialAreasDialogOpen(false);
  };
  
  // Delete a special area
  const handleDeleteSpecialArea = (areaId: number) => {
    // Check if this area is used in any derived ratios
    const isUsed = derivedRatios.some(ratio => {
      return ratio.entityModifications?.some(mod => {
        return (
          (mod.addedSpecialAreas && mod.addedSpecialAreas.includes(areaId)) ||
          (mod.excludedSpecialAreas && mod.excludedSpecialAreas.includes(areaId))
        );
      });
    });
    
    if (isUsed) {
      toast({
        title: "Warning",
        description: "This area is used in derived ratios. Deleting it may affect ratio calculations.",
        variant: "destructive"
      });
    }
    
    // Get area name before deleting
    const areaName = specialAreas.find(area => area.id === areaId)?.name || 'Area';
    const areaValue = specialAreas.find(area => area.id === areaId)?.area || 0;
    
    // Delete the area
    setSpecialAreas(prev => prev.filter(area => area.id !== areaId));
    
    // Show success toast immediately
    toast({
      title: "Area Removed",
      description: `Removed ${areaName} (${areaValue} ${unitType})` + 
        (selectedEntityForAreas !== null ? 
          ` for ${entities.find(e => e.id === selectedEntityForAreas)?.name || 'entity'}` : 
          '')
    });
    
    // Close the dialog automatically
    setIsManageSpecialAreasDialogOpen(false);
  };
  
  // Filter ratios by search term and ratio type
  const getFilteredRatios = (
    ratios: (CombinationRatio | DerivedRatio)[],
    searchTerm: string,
    ratioTypes: RatioType[]
  ) => {
    return ratios.filter(ratio => {
      // Filter by search term
      const searchMatch = !searchTerm ||
        ratio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ratio.description && ratio.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by ratio type
      const typeMatch = ratioTypes.length === 0 || 
        (ratio.ratioType && ratioTypes.includes(ratio.ratioType));
      
      return searchMatch && typeMatch;
    });
  };
  
  // Get entity name by ID - use the local version that has access to the entities array
  const getLocalEntityName = (entityId: number): string => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : `Entity ${entityId}`;
  };
  
  // Calculate and format the total area for a ratio
  const getTotalArea = (ratio: CombinationRatio | DerivedRatio): string => {
    if (!ratio.entityValues) return `0.00 ${unitType}`;
    
    const total = Object.values(ratio.entityValues).reduce((sum, value) => sum + value, 0);
    return `${total.toFixed(2)} ${unitType}`;
  };
  
  // Render the Combination Ratios section
  const renderCombinationRatios = () => {
    const filteredRatios = getFilteredRatios(
      combinationRatios,
      searchFilter,
      selectedRatioFilters
    );
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Combination Ratios</div>
          <div className="flex gap-2">
            <Button 
              onClick={generateAllEntityCombinations}
              variant="secondary" 
              size="sm"
            >
              <LayoutGridIcon className="mr-2 h-4 w-4" />
              Generate All Combinations
            </Button>
            <Button 
              onClick={() => setIsCreateCombinationDialogOpen(true)}
              variant="outline" 
              size="sm"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
        
        {filteredRatios.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
            <p className="text-sm text-slate-500">No combination ratios found</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ratio Type</TableHead>
                  <TableHead>Entities</TableHead>
                  <TableHead>Total Area</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatios.map(ratio => (
                  <TableRow key={ratio.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{ratio.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getRatioTypeDisplayName(ratio.ratioType || 'sellable_area')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {safeGetEntityIds(ratio).length === 1 ? (
                        <div>
                          <div>{getLocalEntityName(safeGetEntityIds(ratio)[0])}</div>
                          <div className="text-xs text-slate-500">100%</div>
                        </div>
                      ) : safeGetEntityIds(ratio).length <= 3 ? (
                        <div className="text-sm space-y-1">
                          {safeGetEntityIds(ratio).map(id => {
                            const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'sellable_area', ratio.entityValues);
                            return (
                              <div key={id}>
                                <div>{getLocalEntityName(id)}</div>
                                <div className="text-xs text-slate-500">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="link" size="sm" className="h-auto p-0">
                                {safeGetEntityIds(ratio).length} entities <InfoIcon className="h-3 w-3 ml-1" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="text-sm max-h-60 overflow-y-auto space-y-1">
                                {safeGetEntityIds(ratio).map(id => {
                                  const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'sellable_area', ratio.entityValues);
                                  return (
                                    <div key={id} className="flex justify-between">
                                      <span>{getLocalEntityName(id)}</span>
                                      <span className="text-xs">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {getTotalArea(ratio)}
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleCreateDerivedRatio(ratio)}
                          variant="ghost" 
                          size="sm"
                        >
                          <GitBranchIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleEditCombinationRatio(ratio)}
                          variant="ghost" 
                          size="sm"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteCombinationRatio(ratio.id)}
                          variant="ghost" 
                          size="sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    );
  };
  
  // Render the Core Ratios section
  const renderCoreRatios = () => {
    const filteredRatios = getFilteredRatios(
      coreRatios,
      searchFilter,
      selectedRatioFilters
    );
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Core Ratios</div>
          <Button 
            onClick={generateCoreRatios}
            variant="outline" 
            size="sm"
          >
            <RefreshCcwIcon className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
        
        {filteredRatios.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
            <p className="text-sm text-slate-500">No core ratios found</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ratio Type</TableHead>
                  <TableHead>Entities</TableHead>
                  <TableHead>Total Area</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatios.map(ratio => (
                  <TableRow key={ratio.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{ratio.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getRatioTypeDisplayName(ratio.ratioType || 'sellable_area')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {safeGetEntityIds(ratio).length === 1 ? (
                        <div>
                          <div>{getLocalEntityName(safeGetEntityIds(ratio)[0])}</div>
                          <div className="text-xs text-slate-500">100%</div>
                        </div>
                      ) : safeGetEntityIds(ratio).length <= 3 ? (
                        <div className="text-sm space-y-1">
                          {safeGetEntityIds(ratio).map(id => {
                            const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'sellable_area', ratio.entityValues);
                            return (
                              <div key={id}>
                                <div>{getLocalEntityName(id)}</div>
                                <div className="text-xs text-slate-500">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="link" size="sm" className="h-auto p-0">
                                {safeGetEntityIds(ratio).length} entities <InfoIcon className="h-3 w-3 ml-1" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="text-sm max-h-60 overflow-y-auto space-y-1">
                                {safeGetEntityIds(ratio).map(id => {
                                  const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'sellable_area', ratio.entityValues);
                                  return (
                                    <div key={id} className="flex justify-between">
                                      <span>{getLocalEntityName(id)}</span>
                                      <span className="text-xs">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {getTotalArea(ratio)}
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleCreateDerivedRatio(ratio)}
                          variant="ghost" 
                          size="sm"
                        >
                          <GitBranchIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    );
  };
  
  // Render the Derived Ratios section
  const renderDerivedRatios = () => {
    const filteredRatios = getFilteredRatios(
      derivedRatios,
      searchFilter,
      selectedRatioFilters
    );
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Derived Ratios</div>
        </div>
        
        {filteredRatios.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
            <p className="text-sm text-slate-500">
              No derived ratios found. Create them by clicking the branch icon on a core or combination ratio.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source Ratio</TableHead>
                  <TableHead>Ratio Type</TableHead>
                  <TableHead>Entities</TableHead>
                  <TableHead>Total Area</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatios.map(ratio => (
                  <TableRow key={ratio.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{ratio.name}</TableCell>
                    <TableCell>{ratio.sourceRatioName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getRatioTypeDisplayName(ratio.ratioType || 'custom')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {safeGetEntityIds(ratio).length === 1 ? (
                        <div>
                          <div>{getLocalEntityName(safeGetEntityIds(ratio)[0])}</div>
                          <div className="text-xs text-slate-500">100%</div>
                        </div>
                      ) : safeGetEntityIds(ratio).length <= 3 ? (
                        <div className="text-sm space-y-1">
                          {safeGetEntityIds(ratio).map(id => {
                            const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'custom', ratio.entityValues);
                            return (
                              <div key={id}>
                                <div>{getLocalEntityName(id)}</div>
                                <div className="text-xs text-slate-500">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="link" size="sm" className="h-auto p-0">
                                {safeGetEntityIds(ratio).length} entities <InfoIcon className="h-3 w-3 ml-1" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="text-sm max-h-60 overflow-y-auto space-y-1">
                                {safeGetEntityIds(ratio).map(id => {
                                  const entityRatios = calculateEntityRatios(safeGetEntityIds(ratio), ratio.ratioType || 'custom', ratio.entityValues);
                                  return (
                                    <div key={id} className="flex justify-between">
                                      <span>{getLocalEntityName(id)}</span>
                                      <span className="text-xs">{entityRatios[id]?.percentage || entityRatios[id]?.display?.split('\n')[1]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {getTotalArea(ratio)}
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleEditDerivedRatio(ratio)}
                          variant="ghost" 
                          size="sm"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteDerivedRatio(ratio.id)}
                          variant="ghost" 
                          size="sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    );
  };
  
  // Function to handle dialog open/close with consolidated notifications
  const handleSpecialAreasDialogChange = (open: boolean) => {
    if (open) { // Dialog is being opened
      // Initialize tracking arrays
      setAreasAdded([]);
      setAreasRemoved([]);
    } else { // Dialog is being closed
      // Just reset the tracking arrays, as we're now displaying immediate notifications
      setAreasAdded([]);
      setAreasRemoved([]);
    }
    setIsManageSpecialAreasDialogOpen(open);
  };
  
  // Render special areas management dialog
  const renderSpecialAreasDialog = () => (
    <Dialog open={isManageSpecialAreasDialogOpen} onOpenChange={handleSpecialAreasDialogChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Special Areas</DialogTitle>
          <DialogDescription>
            {selectedEntityForAreas !== null ? 
              `Modify special areas for entity: ${entities.find(e => e.id === selectedEntityForAreas)?.name || ''}` :
              'Special areas can be included or excluded when creating derived ratios.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7">
              <Label htmlFor="newAreaName">Area Name</Label>
              <Input 
                id="newAreaName"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g., Pool Area"
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="newAreaValue">Area ({unitType})</Label>
              <Input 
                id="newAreaValue"
                value={newAreaValue}
                onChange={(e) => setNewAreaValue(e.target.value)}
                placeholder="e.g., 120"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2 flex items-end">
              <Button 
                onClick={handleAddSpecialArea}
                className="w-full"
              >
                Add
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[300px] border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Area Name</TableHead>
                  <TableHead>Size ({unitType})</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialAreas.map(area => (
                  <TableRow key={area.id}>
                    <TableCell>{area.name}</TableCell>
                    <TableCell>{area.area.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {selectedEntityForAreas !== null && (
                        <>
                          <Button 
                            onClick={() => {
                              // Find the entity modification for the selected entity
                              const mod = entityModifications.find(m => m.entityId === selectedEntityForAreas);
                              if (mod) {
                                // Add this area to the entity
                                updateEntityModification(
                                  selectedEntityForAreas,
                                  undefined,
                                  { specialAreaId: area.id, action: 'add' }
                                );
                                
                                // Show immediate success toast
                                const entityName = entities.find(e => e.id === selectedEntityForAreas)?.name || 'entity';
                                toast({
                                  title: "Area Added",
                                  description: `Added ${area.name} (${area.area} ${unitType}) to ${entityName}`
                                });
                                
                                // Close the dialog automatically
                                setIsManageSpecialAreasDialogOpen(false);
                              }
                            }}
                            variant="outline" 
                            size="sm"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add to Entity
                          </Button>
                          <Button 
                            onClick={() => {
                              // Find the entity modification for the selected entity
                              const mod = entityModifications.find(m => m.entityId === selectedEntityForAreas);
                              if (mod) {
                                // Exclude this area from the entity
                                updateEntityModification(
                                  selectedEntityForAreas,
                                  undefined,
                                  { specialAreaId: area.id, action: 'subtract' }
                                );
                                
                                // Show immediate success toast
                                const entityName = entities.find(e => e.id === selectedEntityForAreas)?.name || 'entity';
                                toast({
                                  title: "Area Removed",
                                  description: `Removed ${area.name} (${area.area} ${unitType}) from ${entityName}`
                                });
                                
                                // Close the dialog automatically
                                setIsManageSpecialAreasDialogOpen(false);
                              }
                            }}
                            variant="outline" 
                            size="sm"
                            className="text-rose-600 border-rose-200"
                          >
                            <MinusIcon className="h-4 w-4 mr-1" />
                            Remove from Entity
                          </Button>
                        </>
                      )}
                      <Button 
                        onClick={() => handleDeleteSpecialArea(area.id)}
                        variant="ghost" 
                        size="sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {specialAreas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-sm text-slate-500">
                      No special areas defined
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsManageSpecialAreasDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render create combination ratio dialog
  const renderCreateCombinationDialog = () => (
    <Dialog open={isCreateCombinationDialogOpen} onOpenChange={setIsCreateCombinationDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Combination Ratio</DialogTitle>
          <DialogDescription>
            Select entities and a ratio type to create a new ratio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ratioName">Ratio Name</Label>
            <Input 
              id="ratioName"
              value={ratioName}
              onChange={(e) => setRatioName(e.target.value)}
              placeholder="e.g., Residential & Retail"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ratioDescription">Description (Optional)</Label>
            <Textarea 
              id="ratioDescription"
              value={ratioDescription}
              onChange={(e) => setRatioDescription(e.target.value)}
              placeholder="Add a detailed description of this ratio"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ratio Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'sellable_area', 
                'applicable_area', 
                'total_component_area', 
                'common_element_area',
                'principal_common_area',
                'total_common_area'
              ].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <input 
                    type="radio"
                    id={`ratio-type-${type}`}
                    checked={selectedRatioType === type}
                    onChange={() => setSelectedRatioType(type as RatioType)}
                    className="w-4 h-4"
                  />
                  <Label 
                    htmlFor={`ratio-type-${type}`}
                    className="text-sm cursor-pointer"
                  >
                    {getRatioTypeDisplayName(type as RatioType)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Select Entities</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {entities.map(entity => (
                  <div key={entity.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`entity-${entity.id}`}
                      checked={selectedEntityIds.includes(entity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEntityIds(prev => [...prev, entity.id]);
                        } else {
                          setSelectedEntityIds(prev => 
                            prev.filter(id => id !== entity.id)
                          );
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`entity-${entity.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {entity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsCreateCombinationDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateCombinationRatio}>
            Create Ratio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render edit combination ratio dialog
  const renderEditCombinationDialog = () => (
    <Dialog open={isEditCombinationDialogOpen} onOpenChange={setIsEditCombinationDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Combination Ratio</DialogTitle>
          <DialogDescription>
            Update the properties of this ratio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ratioName">Ratio Name</Label>
            <Input 
              id="ratioName"
              value={ratioName}
              onChange={(e) => setRatioName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ratioDescription">Description (Optional)</Label>
            <Textarea 
              id="ratioDescription"
              value={ratioDescription}
              onChange={(e) => setRatioDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ratio Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'sellable_area', 
                'applicable_area', 
                'total_component_area', 
                'common_element_area',
                'principal_common_area',
                'total_common_area'
              ].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <input 
                    type="radio"
                    id={`edit-ratio-type-${type}`}
                    checked={selectedRatioType === type}
                    onChange={() => setSelectedRatioType(type as RatioType)}
                    className="w-4 h-4"
                  />
                  <Label 
                    htmlFor={`edit-ratio-type-${type}`}
                    className="text-sm cursor-pointer"
                  >
                    {getRatioTypeDisplayName(type as RatioType)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Select Entities</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {entities.map(entity => (
                  <div key={entity.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-entity-${entity.id}`}
                      checked={selectedEntityIds.includes(entity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEntityIds(prev => [...prev, entity.id]);
                        } else {
                          setSelectedEntityIds(prev => 
                            prev.filter(id => id !== entity.id)
                          );
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`edit-entity-${entity.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {entity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsEditCombinationDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateCombinationRatio}>
            Update Ratio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render create derived ratio dialog
  const renderCreateDerivedDialog = () => (
    <Dialog open={isCreateDerivedDialogOpen} onOpenChange={setIsCreateDerivedDialogOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Derived Ratio</DialogTitle>
          <DialogDescription>
            {selectedSourceRatio 
              ? `Creating a derived ratio based on "${selectedSourceRatio.name}"`
              : "Select a source ratio and customize it"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="derivedRatioName">Ratio Name</Label>
            <Input 
              id="derivedRatioName"
              value={ratioName}
              onChange={(e) => setRatioName(e.target.value)}
              placeholder={selectedSourceRatio 
                ? `Modified ${selectedSourceRatio.name}`
                : "Derived Ratio Name"
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="derivedRatioDescription">Description (Optional)</Label>
            <Textarea 
              id="derivedRatioDescription"
              value={ratioDescription}
              onChange={(e) => setRatioDescription(e.target.value)}
              placeholder="Add details about this derived ratio"
              rows={2}
            />
          </div>
          
          {/* Entity modifications table */}
          {selectedSourceRatio && entityModifications.length > 0 && (
            <div className="space-y-2">
              <Label>Entity Modifications</Label>
              <ScrollArea className="h-[250px] border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Include</TableHead>
                      <TableHead>Original Area</TableHead>
                      <TableHead>Modified Area</TableHead>
                      <TableHead>Special Areas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entityModifications.map((mod, index) => {
                      const entity = entities.find(e => e.id === mod.entityId);
                      if (!entity) return null;
                      
                      return (
                        <TableRow key={mod.entityId}>
                          <TableCell>{entity.name}</TableCell>
                          <TableCell>
                            <Checkbox 
                              checked={mod.action === 'include'}
                              onCheckedChange={(checked) => {
                                updateEntityModification(
                                  mod.entityId, 
                                  checked ? 'include' : 'exclude'
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {mod.originalValue?.toFixed(2)} {unitType}
                          </TableCell>
                          <TableCell>
                            {mod.modifiedValue?.toFixed(2)} {unitType}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex gap-1"
                                  onClick={() => {
                                    // Open special areas management dialog for this entity
                                    setSelectedEntityForAreas(mod.entityId);
                                    setIsManageSpecialAreasDialogOpen(true);
                                  }}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                  Add Areas
                                </Button>
                                {mod.action === 'include' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex gap-1"
                                    onClick={() => {
                                      // Open management dialog for removing areas
                                      setSelectedEntityForAreas(mod.entityId);
                                      setIsManageSpecialAreasDialogOpen(true);
                                    }}
                                  >
                                    <MinusIcon className="h-3 w-3" />
                                    Remove from Entity
                                  </Button>
                                )}
                                <Button
                                  variant={mod.action === 'include' ? 'secondary' : 'outline'}
                                  size="sm"
                                  className="flex gap-1"
                                  onClick={() => {
                                    // Toggle inclusion/exclusion of this entity
                                    updateEntityModification(
                                      mod.entityId,
                                      mod.action === 'include' ? 'exclude' : 'include'
                                    );
                                  }}
                                >
                                  {mod.action === 'include' ? 'Remove from Entity' : 'Include Entity'}
                                </Button>
                              </div>
                              
                              {/* Added special areas display with ability to remove */}
                              {mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">Added Areas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {mod.addedSpecialAreas.map(areaId => {
                                      const area = specialAreas.find(a => a.id === areaId);
                                      if (!area) return null;
                                      
                                      return (
                                        <Badge 
                                          key={areaId} 
                                          variant="outline" 
                                          className="flex items-center gap-1"
                                        >
                                          {area.name}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-slate-100 rounded-full"
                                            onClick={() => {
                                              updateEntityModification(
                                                mod.entityId,
                                                undefined,
                                                { specialAreaId: area.id, action: 'neutral' }
                                              );
                                            }}
                                          >
                                            <XIcon className="h-2 w-2" />
                                          </Button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* Excluded special areas display with ability to remove */}
                              {mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">Excluded Areas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {mod.excludedSpecialAreas.map(areaId => {
                                      const area = specialAreas.find(a => a.id === areaId);
                                      if (!area) return null;
                                      
                                      return (
                                        <Badge 
                                          key={areaId} 
                                          variant="outline" 
                                          className="flex items-center gap-1 text-rose-700 border-rose-200 bg-rose-50"
                                        >
                                          {area.name}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-rose-100 rounded-full"
                                            onClick={() => {
                                              updateEntityModification(
                                                mod.entityId,
                                                undefined,
                                                { specialAreaId: area.id, action: 'neutral' }
                                              );
                                            }}
                                          >
                                            <XIcon className="h-2 w-2" />
                                          </Button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedSourceRatio(null);
              setEntityModifications([]);
              setIsCreateDerivedDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveDerivedRatio}>
            Create Derived Ratio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render edit derived ratio dialog
  const renderEditDerivedDialog = () => (
    <Dialog open={isEditDerivedDialogOpen} onOpenChange={setIsEditDerivedDialogOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Derived Ratio</DialogTitle>
          <DialogDescription>
            {currentDerivedRatio 
              ? `Editing "${currentDerivedRatio.name}"`
              : "Update ratio properties"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editDerivedRatioName">Ratio Name</Label>
            <Input 
              id="editDerivedRatioName"
              value={ratioName}
              onChange={(e) => setRatioName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editDerivedRatioDescription">Description (Optional)</Label>
            <Textarea 
              id="editDerivedRatioDescription"
              value={ratioDescription}
              onChange={(e) => setRatioDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          {/* Entity modifications table - similar to create dialog */}
          {entityModifications.length > 0 && (
            <div className="space-y-2">
              <Label>Entity Modifications</Label>
              <ScrollArea className="h-[250px] border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Include</TableHead>
                      <TableHead>Original Area</TableHead>
                      <TableHead>Modified Area</TableHead>
                      <TableHead>Special Areas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entityModifications.map((mod, index) => {
                      const entity = entities.find(e => e.id === mod.entityId);
                      if (!entity) return null;
                      
                      return (
                        <TableRow key={mod.entityId}>
                          <TableCell>{entity.name}</TableCell>
                          <TableCell>
                            <Checkbox 
                              checked={mod.action === 'include'}
                              onCheckedChange={(checked) => {
                                updateEntityModification(
                                  mod.entityId, 
                                  checked ? 'include' : 'exclude'
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {mod.originalValue?.toFixed(2)} {unitType}
                          </TableCell>
                          <TableCell>
                            {mod.modifiedValue?.toFixed(2)} {unitType}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex gap-1"
                                  onClick={() => {
                                    // Open special areas management dialog for this entity
                                    setSelectedEntityForAreas(mod.entityId);
                                    setIsManageSpecialAreasDialogOpen(true);
                                  }}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                  Add Areas
                                </Button>
                                {mod.action === 'include' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex gap-1"
                                    onClick={() => {
                                      // Open management dialog for removing areas
                                      setSelectedEntityForAreas(mod.entityId);
                                      setIsManageSpecialAreasDialogOpen(true);
                                    }}
                                  >
                                    <MinusIcon className="h-3 w-3" />
                                    Remove from Entity
                                  </Button>
                                )}
                                <Button
                                  variant={mod.action === 'include' ? 'secondary' : 'outline'}
                                  size="sm"
                                  className="flex gap-1"
                                  onClick={() => {
                                    // Toggle inclusion/exclusion of this entity
                                    updateEntityModification(
                                      mod.entityId,
                                      mod.action === 'include' ? 'exclude' : 'include'
                                    );
                                  }}
                                >
                                  {mod.action === 'include' ? 'Remove from Entity' : 'Include Entity'}
                                </Button>
                              </div>
                              
                              {/* Added special areas display with ability to remove */}
                              {mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">Added Areas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {mod.addedSpecialAreas.map(areaId => {
                                      const area = specialAreas.find(a => a.id === areaId);
                                      if (!area) return null;
                                      
                                      return (
                                        <Badge 
                                          key={areaId} 
                                          variant="outline" 
                                          className="flex items-center gap-1"
                                        >
                                          {area.name}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-slate-100 rounded-full"
                                            onClick={() => {
                                              updateEntityModification(
                                                mod.entityId,
                                                undefined,
                                                { specialAreaId: area.id, action: 'neutral' }
                                              );
                                            }}
                                          >
                                            <XIcon className="h-2 w-2" />
                                          </Button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* Excluded special areas display with ability to remove */}
                              {mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">Excluded Areas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {mod.excludedSpecialAreas.map(areaId => {
                                      const area = specialAreas.find(a => a.id === areaId);
                                      if (!area) return null;
                                      
                                      return (
                                        <Badge 
                                          key={areaId} 
                                          variant="outline" 
                                          className="flex items-center gap-1 text-rose-700 border-rose-200 bg-rose-50"
                                        >
                                          {area.name}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-rose-100 rounded-full"
                                            onClick={() => {
                                              updateEntityModification(
                                                mod.entityId,
                                                undefined,
                                                { specialAreaId: area.id, action: 'neutral' }
                                              );
                                            }}
                                          >
                                            <XIcon className="h-2 w-2" />
                                          </Button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentDerivedRatio(null);
              setSelectedSourceRatio(null);
              setEntityModifications([]);
              setIsEditDerivedDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateDerivedRatio}>
            Update Ratio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Main component render
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PercentSquareIcon className="h-5 w-5" />
          Unified Ratio Manager
        </CardTitle>
        <CardDescription>
          Manage all ratio types in one place for allocation purposes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search ratios..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Ratio type tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All Ratios</TabsTrigger>
            <TabsTrigger value="core">Core Ratios</TabsTrigger>
            <TabsTrigger value="combination">Combination Ratios</TabsTrigger>
            <TabsTrigger value="derived">Derived Ratios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6 mt-4">
            {displayFilter.showCoreRatios && renderCoreRatios()}
            {displayFilter.showCombinationRatios && renderCombinationRatios()}
            {displayFilter.showDerivedRatios && renderDerivedRatios()}
          </TabsContent>
          
          <TabsContent value="core" className="space-y-6 mt-4">
            {renderCoreRatios()}
          </TabsContent>
          
          <TabsContent value="combination" className="space-y-6 mt-4">
            {renderCombinationRatios()}
          </TabsContent>
          
          <TabsContent value="derived" className="space-y-6 mt-4">
            {renderDerivedRatios()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Render all dialogs */}
      {renderSpecialAreasDialog()}
      {renderCreateCombinationDialog()}
      {renderEditCombinationDialog()}
      {renderCreateDerivedDialog()}
      {renderEditDerivedDialog()}
    </Card>
  );
}
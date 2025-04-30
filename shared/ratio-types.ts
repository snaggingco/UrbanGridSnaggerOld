// AMC Ratio Management Type Definitions

// Possible ratio types
export type RatioType = 
  | 'sellable_area' 
  | 'parking_bay_area' 
  | 'dedicated_common_area' 
  | 'total_component_area' 
  | 'applicable_area'
  | 'principal_common_area'
  | 'common_element_area'
  | 'total_common_area'
  | 'combined_area'
  | 'custom';

// Special area type for easier handling in UI components
export interface SpecialArea {
  id: number;
  name: string;
  area: number;
  type: string;
}

// Basic entity structure
export interface Entity {
  id: number;
  name: string;
  type: 'residential' | 'retail' | 'office' | 'hotel' | 'other';
  suitArea: string;
  balconyArea?: string;
  sellableArea?: string;
  applicableArea?: string;
  dedicatedCommonArea?: string;
  parkingBayArea?: string;
  totalComponentArea?: string;
  commonElementArea?: string;
  principalCommonArea?: string;
  totalCommonArea?: string;
  combinedArea?: string;
  proportionalShare?: string;
  color?: string;
}

// Shared area structure
export interface SharedArea {
  id: number;
  name: string;
  type: "principal_common" | "common_element";
  area: string;
  description: string | null;
  beneficiaries?: EntityBeneficiary[];
}

// Entity beneficiary structure
export interface EntityBeneficiary {
  id: number;
  entityId: number;
  sharedAreaId: number;
  allocationPercentage: string;
}

// Shared allocation structure
export interface SharedAllocation {
  entityIds: number[];
  percentage: number;
  label?: string;
  color?: string;
}

// Entity modification for derived ratios
export interface EntityModification {
  entityId: number;
  action: 'include' | 'exclude';
  originalValue: number;
  modifiedValue: number;
  excludedSpecialAreas?: number[];
  addedSpecialAreas?: number[];
}

// Special area modification for ratio adjustments
export interface SpecialAreaModification {
  id: number;
  ratioId: number;
  ratioName?: string;
  excludedSpecialAreas?: number[];
  addedSpecialAreas?: number[];
  comments?: string;
}

// Base ratio interface
export interface BaseRatio {
  id: number;
  name: string;
  description?: string;
  ratioType?: RatioType;
  entityValues?: Record<number, number>;
  isCore?: boolean;
  unitOfMeasurement?: 'sqm' | 'sqft';
  sourceRatioId?: number; // For tracking the source ratio in derived ratios
  sourceRatioName?: string; // For displaying the source ratio name
}

// Combination ratio
export interface CombinationRatio extends BaseRatio {
  entityIds: number[];
  ratioValue?: string;
}

// Derived ratio
export interface DerivedRatio extends BaseRatio {
  sourceRatioId: number;
  sourceRatioName: string;
  entityModifications: EntityModification[];
  calculatedRatioValue?: string;
  entityIds?: number[]; // Add entityIds to match the structure needed in our components
}

/**
 * Generic Ratio type that can be used to represent any ratio type
 * This is useful for components that need to handle multiple ratio types
 */
export type Ratio = BaseRatio | CombinationRatio | DerivedRatio;

/**
 * Utility functions for working with ratios
 */

// Type guard to check if a ratio is a derived ratio
export function isDerivedRatio(ratio: Ratio): ratio is DerivedRatio {
  return ratio && 'entityModifications' in ratio && Array.isArray((ratio as any).entityModifications);
}

// Type guard to check if a ratio is a combination ratio
export function isCombinationRatio(ratio: Ratio): ratio is CombinationRatio {
  return ratio && 'entityIds' in ratio && Array.isArray((ratio as any).entityIds);
}

// Standardize a ratio to ensure it has all required fields
export function standardizeRatio(ratio: any): Ratio {
  // First, ensure it's a valid ratio object
  if (!ratio || typeof ratio !== 'object') {
    throw new Error('Invalid ratio object provided to standardizeRatio');
  }

  const baseRatio = {
    id: ratio.id || 0,
    name: ratio.name || 'Unnamed Ratio',
    description: ratio.description || '',
    ratioType: ratio.ratioType || 'custom',
    entityValues: ratio.entityValues || {},
    isCore: !!ratio.isCore,
    unitOfMeasurement: ratio.unitOfMeasurement || 'sqm'
  };

  // Check if it's a DerivedRatio
  if (ratio.entityModifications || ratio.sourceRatioId) {
    return {
      ...baseRatio,
      sourceRatioId: ratio.sourceRatioId || 0,
      sourceRatioName: ratio.sourceRatioName || '',
      entityModifications: ratio.entityModifications || [],
      calculatedRatioValue: ratio.calculatedRatioValue || '0'
    } as DerivedRatio;
  } 
  
  // Check if it's a CombinationRatio
  if (ratio.entityIds) {
    return {
      ...baseRatio,
      entityIds: ratio.entityIds || [],
      ratioValue: ratio.ratioValue || '0'
    } as CombinationRatio;
  }

  // Default to base ratio
  return baseRatio as BaseRatio;
}

// Allocation input structure
export interface AllocationInput {
  id: number;
  name: string;
  unit: string;
  value: string; 
  description?: string;
  ratioId: number | null;
  ratioName: string | null;
  entityId: number | null; // For exclusive entity allocation
  entityValues: Record<number, string>;
  percentages: Record<number, number>;
}

// Budget item allocation input structure
export interface BudgetItemInput {
  id: number;
  value: number;
  ratioId: number | null;
  unit: string;
  distribution?: Record<number, number>; // Entity ID to distributed value mapping
}

// Budget item structure
export interface BudgetItem {
  id: string;
  code: string;
  description: string;
  category?: string;
  subCategory?: string;
}

// Budget item allocation structure
export interface BudgetItemAllocation {
  budgetItemId: number;
  budgetItemCode?: string;
  budgetItemDescription?: string;
  
  // Current input system
  allocationInputs: AllocationInput[];
  
  // Additional metadata
  allocationMethod?: 'ratio_based' | 'input_based' | 'hybrid' | 'ratio_input';
  budgetValue?: string;
  notes?: string;
  
  // Selected ratio information for single ratio allocation
  allocatedRatioId?: number;
  allocatedRatioName?: string;
  
  // Legacy fields for backward compatibility
  id?: number;
  inputValue?: number;
  ratioId?: number | null;
  unit?: string;
  inputs?: BudgetItemInput[];
  totalAllocated?: number;
  entityDistribution?: Record<number, number>; // Entity ID to total allocated value mapping
}

// Selected budget item structure
export interface SelectedBudgetItem extends BudgetItem {
  isSelected: boolean;
  allocationMethod?: 'ratio_based' | 'input_based' | 'hybrid' | 'ratio_input';
  allocation?: BudgetItemAllocation;
  notes?: string;
  budgetValue?: string;
  budgetItemId?: number; // Added for tracking in UI
}
// Utility functions for ratio calculations and formatting

import { Entity, RatioType, CombinationRatio, DerivedRatio } from '@shared/ratio-types';

/**
 * Get standardized ratio name based on ratio type and entities
 * @param ratio The ratio object
 * @param entities Array of entities for name lookup
 */
export const getStandardizedRatioName = (
  ratio: CombinationRatio | DerivedRatio,
  entities: Entity[]
): string => {
  if (!ratio) return '';
  
  if (isDerivedRatio(ratio)) {
    return ratio.name;
  }
  
  const entityNames = (ratio.entityIds || [])
    .map(id => getEntityName(id, entities))
    .join(', ');
  
  const ratioTypeName = getRatioTypeDisplayName(ratio.ratioType || 'sellable_area');
  
  return `${entityNames} - ${ratioTypeName}`;
};

/**
 * Get human-readable ratio type names
 * @param ratioType The ratio type to display
 */
export const getRatioTypeDisplayName = (ratioType: RatioType): string => {
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

/**
 * Get CSS color class for a ratio type
 * @param ratioType The ratio type
 */
export const getRatioTypeColorClass = (ratioType: RatioType): string => {
  switch (ratioType) {
    case 'sellable_area':
      return 'bg-blue-100 text-blue-800';
    case 'applicable_area':
      return 'bg-green-100 text-green-800';
    case 'parking_bay_area':
      return 'bg-purple-100 text-purple-800';
    case 'dedicated_common_area':
      return 'bg-amber-100 text-amber-800';
    case 'total_component_area':
      return 'bg-indigo-100 text-indigo-800';
    case 'principal_common_area':
      return 'bg-red-100 text-red-800';
    case 'common_element_area':
      return 'bg-teal-100 text-teal-800';
    case 'total_common_area':
      return 'bg-gray-100 text-gray-800';
    case 'combined_area':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

/**
 * Format a percentage value as a string
 * @param value Percentage value to format
 * @param precision Number of decimal places (default: 1)
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  return `${value.toFixed(precision)}%`;
};

/**
 * Format area value with appropriate unit
 * @param value Area value to format
 * @param unit Unit to use ("sqm" or "sqft")
 */
export const formatAreaValue = (value: number, unit: 'sqm' | 'sqft'): string => {
  return `${value.toFixed(2)} ${unit}`;
};

/**
 * Calculate a ratio value from entity values
 * @param entityValues Record of entity IDs to values
 * @param unit Unit to display ("sqm" or "sqft")
 */
export const calculateRatioValue = (
  entityValues: Record<number, number> | undefined,
  unit: 'sqm' | 'sqft'
): string => {
  if (!entityValues) return `0.00 ${unit}`;
  
  const total = Object.values(entityValues).reduce((sum, value) => sum + value, 0);
  return formatAreaValue(total, unit);
};

/**
 * Safely get the IDs array from a ratio
 * @param ratio The ratio object
 */
export const safeGetEntityIds = (ratio: CombinationRatio | DerivedRatio): number[] => {
  return ratio.entityIds || [];
};

/**
 * Get entity name by ID
 * @param entityId ID of the entity
 * @param entities Array of entities
 */
export const getEntityName = (entityId: number, entities: Entity[]): string => {
  const entity = entities.find(e => e.id === entityId);
  return entity ? entity.name : `Entity ${entityId}`;
};

/**
 * Check if a ratio is a derived ratio
 * @param ratio Ratio to check
 */
export const isDerivedRatio = (
  ratio: CombinationRatio | DerivedRatio
): ratio is DerivedRatio => {
  return 'sourceRatioId' in ratio && 'entityModifications' in ratio;
};

/**
 * Get the total area for all entities in a ratio
 * @param ratio The ratio object
 * @param unit Unit to format with
 */
export const getTotalAreaForRatio = (
  ratio: CombinationRatio | DerivedRatio,
  unit: 'sqm' | 'sqft'
): string => {
  if (!ratio.entityValues) return `0.00 ${unit}`;
  
  const total = Object.values(ratio.entityValues).reduce((sum, value) => sum + value, 0);
  return formatAreaValue(total, unit);
};

/**
 * Format ratio value for display (same as formatAreaValue for backwards compatibility)
 * @param value Value to format
 * @param unit Unit to use ("sqm" or "sqft")
 */
export const formatRatioValue = formatAreaValue;

/**
 * Calculate the distribution of a ratio across all entities
 * @param ratio The ratio to calculate distribution for
 * @param amount The amount to distribute
 * @returns Record mapping entity IDs to distributed amounts
 */
export const calculateRatioDistribution = (
  ratio: CombinationRatio | DerivedRatio,
  amount: number
): Record<number, number> => {
  const distribution: Record<number, number> = {};
  
  if (!ratio || !ratio.entityValues) {
    return distribution;
  }
  
  // Calculate the total value of the ratio
  const totalRatioValue = Object.values(ratio.entityValues).reduce(
    (sum: number, value) => sum + (value as number), 0
  );
  
  // If no ratio value, return empty distribution
  if (totalRatioValue <= 0) {
    return distribution;
  }
  
  // Calculate distribution for each entity
  Object.entries(ratio.entityValues).forEach(([entityId, value]) => {
    const entityRatio = value || 0;
    const percentage = totalRatioValue > 0 ? (entityRatio / totalRatioValue) * 100 : 0;
    const distributedAmount = (percentage / 100) * amount;
    distribution[parseInt(entityId)] = distributedAmount;
  });
  
  return distribution;
};

/**
 * Format ratio type for display (alias of getRatioTypeDisplayName for backward compatibility)
 * @param ratioType The ratio type to format
 */
export const formatRatioType = getRatioTypeDisplayName;
/**
 * Default values for NRM3 asset lifecycle costs
 */

export interface GroupDefault {
  lifespan: number;
  maintenancePercentage: number;
  replacementCostPerUnit?: number;
}

export interface AssetDefault {
  lifespan: number;
  replacementCostPerUnit: number;
  maintenancePercentage: number;
  unit: string;
  replacementUrgency: 'low' | 'medium' | 'high';
}

// Default group values
export const nrm3GroupDefaults: Record<string, GroupDefault> = {
  // Group 3 - Finishes
  "3": { 
    lifespan: 15,
    maintenancePercentage: 2.0,
    replacementCostPerUnit: 150
  },
  "3.1": { 
    lifespan: 15,
    maintenancePercentage: 2.0,
    replacementCostPerUnit: 150
  },
  "3.2": { 
    lifespan: 15,
    maintenancePercentage: 2.0,
    replacementCostPerUnit: 200
  },
  "3.3": { 
    lifespan: 15,
    maintenancePercentage: 2.0,
    replacementCostPerUnit: 175
  },
  // Group 4 - FFE
  "4": { 
    lifespan: 10,
    maintenancePercentage: 3.0,
    replacementCostPerUnit: 500
  },
  "4.1": { 
    lifespan: 10,
    maintenancePercentage: 3.0,
    replacementCostPerUnit: 500
  },
  // Group 5 - Services
  "5.5": { 
    lifespan: 20,
    maintenancePercentage: 3.0,
  },
  "5.8": { 
    lifespan: 20,
    maintenancePercentage: 2.5,
  },
  "5.10": { 
    lifespan: 20,
    maintenancePercentage: 3.5,
  }
};

// Default asset values
export const nrm3AssetDefaults: Record<string, AssetDefault> = {
  "5.5.1": {
    lifespan: 20,
    replacementCostPerUnit: 75000,
    maintenancePercentage: 3.0,
    unit: "unit",
    replacementUrgency: 'medium'
  }
};

/**
 * Get default values for a specific NRM3 asset
 */
export function getAssetDefaultValues(assetCode: string, groupCode: string): {
  lifespan: number,
  replacementCostPerUnit: number | null,
  maintenancePercentage: number,
  unit: string,
  replacementUrgency: 'low' | 'medium' | 'high'
} {
  // First, try to get specific asset defaults
  if (assetCode && nrm3AssetDefaults[assetCode]) {
    const assetDefault = nrm3AssetDefaults[assetCode];
    return {
      lifespan: assetDefault.lifespan,
      replacementCostPerUnit: assetDefault.replacementCostPerUnit,
      maintenancePercentage: assetDefault.maintenancePercentage,
      unit: assetDefault.unit,
      replacementUrgency: assetDefault.replacementUrgency
    };
  }
  
  // If no specific asset defaults, try group defaults
  if (groupCode && nrm3GroupDefaults[groupCode]) {
    const groupDefault = nrm3GroupDefaults[groupCode];
    return {
      lifespan: groupDefault.lifespan,
      replacementCostPerUnit: groupDefault.replacementCostPerUnit || null,
      maintenancePercentage: groupDefault.maintenancePercentage,
      unit: "each",
      replacementUrgency: 'medium'
    };
  }
  
  // Fallback to sensible defaults
  return {
    lifespan: 25,
    replacementCostPerUnit: 1000,
    maintenancePercentage: 2.0,
    unit: "each",
    replacementUrgency: 'medium'
  };
}

/**
 * Calculate annual maintenance cost based on replacement cost and maintenance percentage
 */
export function calculateAnnualMaintenance(replacementCost: number, maintenancePercentage: number): number {
  return replacementCost * (maintenancePercentage / 100);
}

/**
 * Calculate effective age of an asset based on installation year or last replacement year
 */
export function calculateEffectiveAge(
  installationYear?: number,
  lastReplacementYear?: number
): number {
  const currentYear = new Date().getFullYear();
  
  // If we have a last replacement year, use it
  if (lastReplacementYear && lastReplacementYear > 0) {
    return currentYear - lastReplacementYear;
  }
  
  // Otherwise use installation year
  if (installationYear && installationYear > 0) {
    return currentYear - installationYear;
  }
  
  // If no years are provided, default to 0 (newly installed)
  return 0;
}

/**
 * Calculate remaining service life based on condition rating and effective age
 */
export function calculateRemainingServiceLife(
  lifeExpectancy: number, 
  conditionRating: 'A' | 'B' | 'C' | 'D' | string,
  installationYear?: number,
  lastReplacementYear?: number
): number {
  // Calculate effective age based on installation/replacement
  const effectiveAge = calculateEffectiveAge(installationYear, lastReplacementYear);
  
  // Calculate remaining life based on total lifespan and age
  let remainingLife = lifeExpectancy - effectiveAge;
  
  // Can't have negative remaining life
  if (remainingLife < 0) {
    remainingLife = 0;
  }
  
  // Apply condition-based adjustments
  const conditionModifier = 
    conditionRating === 'A' ? 1.1 : // Good condition extends life
    conditionRating === 'B' ? 1.0 : // Fair condition as expected
    conditionRating === 'C' ? 0.8 : // Poor reduces life
    conditionRating === 'D' ? 0.5 : // Bad significantly reduces life
    1.0;                            // Default no modifier
  
  return Math.round(remainingLife * conditionModifier);
}

/**
 * Calculate replacement year based on remaining service life and current year
 */
export function calculateReplacementYear(
  remainingLife: number,
  priorityRating?: '1' | '2' | '3' | '4' | string
): number {
  const currentYear = new Date().getFullYear();
  let yearsToReplacement = remainingLife;
  
  // Adjust years to replacement based on priority if available
  if (priorityRating) {
    switch (priorityRating) {
      case '1': yearsToReplacement = Math.min(remainingLife, 2); break;  // Urgent - within 2 years
      case '2': yearsToReplacement = Math.min(remainingLife, 5); break;  // High - within 5 years
      case '3': yearsToReplacement = remainingLife; break;               // Medium - standard timing
      case '4': yearsToReplacement = remainingLife; break;               // Low - standard timing
      default: yearsToReplacement = remainingLife;
    }
  }
  
  return currentYear + yearsToReplacement;
}
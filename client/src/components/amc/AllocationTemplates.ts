/**
 * Allocation Templates
 * 
 * This module provides intelligent templates for different budget item allocations.
 * The templates suggest the best allocation methods, ratios, and inputs based on
 * the budget item type, category, and description.
 */

// Type definitions
export type AllocationMethod = 'ratio_based' | 'input_based' | 'weightage_based';
export type BudgetCategory = 'Utilities' | 'Maintenance' | 'Security' | 'Cleaning' | 'Administration' | 'Other';
export type BudgetSubCategory = string;
export type RatioType = 'SELLABLE_AREA' | 'APPLICABLE_AREA' | 'COMMON_AREA' | 'TOTAL_COMPONENT_AREA' | 
                        'PARKING_BAY_AREA' | 'PROPORTIONAL_SHARE' | 'ELECTRICAL_LOAD' | 'COOLING_LOAD' | 
                        'HEADCOUNT' | 'ASSET_COUNT' | 'FLOOR_COUNT' | 'CUSTOM';

// Basic template structure
export interface AllocationTemplate {
  id: string;
  name: string;
  description: string;
  suitability: number; // 0-1 score indicating how suitable this template is
  primaryMethod: AllocationMethod;
  applicableToCategories: BudgetCategory[];
  applicableToSubCategories?: string[];
  keywordMatches?: string[]; // Keywords in the budget item description
  recommendedRatios?: RatioType[]; // For ratio-based allocation
  recommendedInputs?: {
    type: 'headcount' | 'electrical_load' | 'cooling_load' | 'asset_count' | 'floor_count' | 'custom';
    name: string;
    description?: string;
    unit: string;
  }[];
  weightageGuidance?: string; // For weightage-based allocation
}

// Library of pre-defined templates
const allocationTemplates: AllocationTemplate[] = [
  // Utilities Templates
  {
    id: 'util-electricity-common',
    name: 'Common Electricity Allocation',
    description: 'Allocates common area electricity based on proportional share or total component area.',
    suitability: 0.9,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Utilities'],
    applicableToSubCategories: ['Electricity', 'Power'],
    keywordMatches: ['common', 'shared', 'lobby', 'corridor', 'public'],
    recommendedRatios: ['PROPORTIONAL_SHARE', 'TOTAL_COMPONENT_AREA']
  },
  {
    id: 'util-electricity-metered',
    name: 'Metered Electricity Allocation',
    description: 'Allocates electricity based on measured consumption from meters.',
    suitability: 0.95,
    primaryMethod: 'input_based',
    applicableToCategories: ['Utilities'],
    applicableToSubCategories: ['Electricity', 'Power'],
    keywordMatches: ['meter', 'consumption', 'measured', 'reading'],
    recommendedInputs: [
      {
        type: 'electrical_load',
        name: 'Electricity Consumption',
        description: 'Monthly electricity consumption from meter readings',
        unit: 'kWh'
      }
    ]
  },
  {
    id: 'util-water-common',
    name: 'Common Water Allocation',
    description: 'Allocates common area water usage based on proportional share.',
    suitability: 0.85,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Utilities'],
    applicableToSubCategories: ['Water', 'Plumbing'],
    keywordMatches: ['common', 'shared', 'irrigation', 'garden', 'pool'],
    recommendedRatios: ['PROPORTIONAL_SHARE', 'TOTAL_COMPONENT_AREA']
  },
  {
    id: 'util-water-usage',
    name: 'Water Usage Allocation',
    description: 'Allocates water based on consumption measurements.',
    suitability: 0.9,
    primaryMethod: 'input_based',
    applicableToCategories: ['Utilities'],
    applicableToSubCategories: ['Water', 'Plumbing'],
    keywordMatches: ['meter', 'consumption', 'usage', 'gallon'],
    recommendedInputs: [
      {
        type: 'custom',
        name: 'Water Consumption',
        description: 'Monthly water consumption',
        unit: 'gallons'
      }
    ]
  },
  {
    id: 'util-chilled-water',
    name: 'Chilled Water Allocation',
    description: 'Allocates chilled water based on cooling load requirements.',
    suitability: 0.9,
    primaryMethod: 'input_based',
    applicableToCategories: ['Utilities'],
    applicableToSubCategories: ['HVAC', 'Cooling', 'Chilled Water'],
    keywordMatches: ['chilled', 'cooling', 'tonnage', 'a/c', 'air conditioning'],
    recommendedInputs: [
      {
        type: 'cooling_load',
        name: 'Cooling Load',
        description: 'Cooling requirements for each area',
        unit: 'Tons'
      }
    ]
  },
  
  // Cleaning Templates
  {
    id: 'cleaning-general',
    name: 'General Cleaning Allocation',
    description: 'Allocates general cleaning services based on total area.',
    suitability: 0.85,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Cleaning'],
    keywordMatches: ['general', 'routine', 'regular', 'daily'],
    recommendedRatios: ['TOTAL_COMPONENT_AREA', 'SELLABLE_AREA', 'APPLICABLE_AREA']
  },
  {
    id: 'cleaning-specialized',
    name: 'Specialized Cleaning Allocation',
    description: 'Allocates specialized cleaning based on usage intensity and area.',
    suitability: 0.8,
    primaryMethod: 'weightage_based',
    applicableToCategories: ['Cleaning'],
    keywordMatches: ['specialized', 'deep', 'carpet', 'window', 'facade'],
    weightageGuidance: 'Adjust weightage based on cleaning frequency and intensity for each entity'
  },
  {
    id: 'cleaning-staff',
    name: 'Cleaning Staff Allocation',
    description: 'Allocates cleaning staff based on headcount assigned to each area.',
    suitability: 0.9,
    primaryMethod: 'input_based',
    applicableToCategories: ['Cleaning'],
    keywordMatches: ['staff', 'personnel', 'janitor', 'worker', 'labor'],
    recommendedInputs: [
      {
        type: 'headcount',
        name: 'Cleaning Staff',
        description: 'Number of cleaning staff assigned',
        unit: 'person'
      }
    ]
  },
  
  // Security Templates
  {
    id: 'security-general',
    name: 'General Security Allocation',
    description: 'Allocates general security services based on proportional share.',
    suitability: 0.85,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Security'],
    keywordMatches: ['general', 'overall', 'building', 'property'],
    recommendedRatios: ['PROPORTIONAL_SHARE', 'TOTAL_COMPONENT_AREA']
  },
  {
    id: 'security-guards',
    name: 'Security Guards Allocation',
    description: 'Allocates security personnel based on posts and coverage area.',
    suitability: 0.9,
    primaryMethod: 'input_based',
    applicableToCategories: ['Security'],
    keywordMatches: ['guard', 'officer', 'personnel', 'post', 'patrol'],
    recommendedInputs: [
      {
        type: 'headcount',
        name: 'Security Personnel',
        description: 'Number of security guards assigned',
        unit: 'person'
      },
      {
        type: 'custom',
        name: 'Security Posts',
        description: 'Number of security posts',
        unit: 'post'
      }
    ]
  },
  {
    id: 'security-systems',
    name: 'Security Systems Allocation',
    description: 'Allocates security system costs based on equipment distribution and coverage.',
    suitability: 0.85,
    primaryMethod: 'input_based',
    applicableToCategories: ['Security'],
    keywordMatches: ['system', 'camera', 'cctv', 'alarm', 'monitoring', 'surveillance'],
    recommendedInputs: [
      {
        type: 'asset_count',
        name: 'Security Cameras',
        description: 'Number of cameras installed',
        unit: 'camera'
      },
      {
        type: 'asset_count',
        name: 'Access Control Points',
        description: 'Number of access control devices',
        unit: 'device'
      }
    ]
  },
  
  // Maintenance Templates
  {
    id: 'maintenance-general',
    name: 'General Maintenance Allocation',
    description: 'Allocates general maintenance based on total area and usage.',
    suitability: 0.8,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Maintenance'],
    keywordMatches: ['general', 'routine', 'regular', 'preventive'],
    recommendedRatios: ['TOTAL_COMPONENT_AREA', 'PROPORTIONAL_SHARE']
  },
  {
    id: 'maintenance-hvac',
    name: 'HVAC Maintenance Allocation',
    description: 'Allocates HVAC maintenance based on equipment distribution and cooling load.',
    suitability: 0.9,
    primaryMethod: 'input_based',
    applicableToCategories: ['Maintenance'],
    applicableToSubCategories: ['HVAC', 'Air Conditioning', 'Cooling'],
    keywordMatches: ['hvac', 'air conditioning', 'cooling', 'chillers', 'ahu', 'fcu'],
    recommendedInputs: [
      {
        type: 'cooling_load',
        name: 'Cooling Tonnage',
        description: 'Cooling capacity in tons',
        unit: 'Ton'
      },
      {
        type: 'asset_count',
        name: 'HVAC Equipment',
        description: 'Number of HVAC equipment units',
        unit: 'unit'
      }
    ]
  },
  {
    id: 'maintenance-elevators',
    name: 'Elevator Maintenance Allocation',
    description: 'Allocates elevator maintenance based on usage intensity and floor count.',
    suitability: 0.9,
    primaryMethod: 'weightage_based',
    applicableToCategories: ['Maintenance'],
    applicableToSubCategories: ['Elevators', 'Lifts', 'Vertical Transportation'],
    keywordMatches: ['elevator', 'lift', 'vertical', 'transportation'],
    weightageGuidance: 'Adjust weightage based on elevator usage intensity for each entity'
  },
  {
    id: 'maintenance-building-fabric',
    name: 'Building Fabric Maintenance',
    description: 'Allocates building fabric maintenance based on total component area.',
    suitability: 0.85,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Maintenance'],
    keywordMatches: ['building', 'facade', 'structure', 'fabric', 'exterior'],
    recommendedRatios: ['TOTAL_COMPONENT_AREA', 'PROPORTIONAL_SHARE']
  },
  
  // Administration Templates
  {
    id: 'admin-general',
    name: 'General Administration Allocation',
    description: 'Allocates general administration costs based on proportional share.',
    suitability: 0.85,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Administration'],
    keywordMatches: ['general', 'admin', 'management', 'overhead'],
    recommendedRatios: ['PROPORTIONAL_SHARE']
  },
  {
    id: 'admin-staff',
    name: 'Administration Staff Allocation',
    description: 'Allocates admin staff costs based on service distribution.',
    suitability: 0.8,
    primaryMethod: 'weightage_based',
    applicableToCategories: ['Administration'],
    keywordMatches: ['staff', 'personnel', 'employee', 'manager'],
    weightageGuidance: 'Adjust weightage based on administrative support required by each entity'
  },
  
  // Fallback Template
  {
    id: 'general-fallback',
    name: 'General Proportional Allocation',
    description: 'General allocation based on proportional share when no specific method is indicated.',
    suitability: 0.6,
    primaryMethod: 'ratio_based',
    applicableToCategories: ['Utilities', 'Maintenance', 'Security', 'Cleaning', 'Administration', 'Other'],
    recommendedRatios: ['PROPORTIONAL_SHARE', 'TOTAL_COMPONENT_AREA']
  }
];

/**
 * Finds the best allocation template based on budget item metadata
 */
export function findBestTemplate(
  category: string,
  subCategory: string,
  description: string
): AllocationTemplate | null {
  // Normalize inputs for matching
  const normalizedCategory = category?.toLowerCase() || '';
  const normalizedSubCategory = subCategory?.toLowerCase() || '';
  const normalizedDescription = description?.toLowerCase() || '';
  
  // Score each template based on how well it matches the input
  const scoredTemplates = allocationTemplates.map(template => {
    let score = template.suitability; // Base score from template definition
    
    // Check category match
    const categoryMatch = template.applicableToCategories.some(cat => 
      normalizedCategory.includes(cat.toLowerCase())
    );
    if (categoryMatch) {
      score += 0.2;
    } else {
      score -= 0.3; // Penalty for category mismatch
    }
    
    // Check subcategory match if applicable
    if (template.applicableToSubCategories && template.applicableToSubCategories.length > 0) {
      const subCategoryMatch = template.applicableToSubCategories.some(subCat => 
        normalizedSubCategory.includes(subCat.toLowerCase())
      );
      if (subCategoryMatch) {
        score += 0.15;
      }
    }
    
    // Check keyword matches in description
    if (template.keywordMatches && template.keywordMatches.length > 0) {
      const matchCount = template.keywordMatches.filter(keyword => 
        normalizedDescription.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        // Add score based on percentage of keywords matched
        score += 0.3 * (matchCount / template.keywordMatches.length);
      }
    }
    
    return { template, score };
  });
  
  // Sort by score (descending) and return the best match
  scoredTemplates.sort((a, b) => b.score - a.score);
  
  // Return the best template if it's above a minimum threshold
  return scoredTemplates[0]?.score > 0.4 ? scoredTemplates[0].template : null;
}

/**
 * Generate input-based allocation inputs from a template
 */
export function generateInputsFromTemplate(template: AllocationTemplate): any[] {
  if (!template.recommendedInputs || template.recommendedInputs.length === 0) {
    return [];
  }
  
  // Create input objects with unique IDs
  return template.recommendedInputs.map((input, index) => ({
    id: Date.now() + index, // Simple unique ID
    name: input.name,
    type: input.type,
    unit: input.unit,
    description: input.description || '',
    values: {} // Empty values to be filled
  }));
}

/**
 * Generate weightage-based allocation from a template
 */
export function generateWeightageFromTemplate(template: AllocationTemplate): any {
  return {
    id: Date.now(),
    name: template.name,
    description: template.weightageGuidance || template.description,
    weightageValues: {} // Empty weightage values to be filled
  };
}
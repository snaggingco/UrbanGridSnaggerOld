import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Ratio as SharedRatio, RatioType as SharedRatioType, standardizeRatio } from '@shared/ratio-types';

// Define additional ratio types for the manager
export type RatioType = SharedRatioType | 'core' | 'derived' | 'combined' | 'exclusive';

// For backward compatibility - internally we'll convert between string and number IDs
export interface EntityValue {
  [entityId: string]: number;
}

// Enhanced Ratio interface for the RatioManager context
// This extends the shared Ratio type with additional properties needed for the manager
export interface Ratio extends Omit<SharedRatio, 'id' | 'entityValues' | 'ratioType'> {
  id: string; // Use string IDs in the manager context
  ratioType: RatioType; // Use enhanced ratio types
  entityValues: EntityValue; // Use the string-based entity values
  sourceRatioIds?: string[]; // String IDs for source ratios
  combinationType?: 'add' | 'subtract' | 'average' | 'weighted' | 'custom';
  metadata?: {
    [key: string]: any;  // For storing additional ratio-specific data
  };
}

interface RatioManagerContextType {
  ratios: Ratio[];
  loading: boolean;
  error: any;
  
  // CRUD operations
  createRatio: (ratio: Omit<Ratio, 'id'>) => Promise<Ratio>;
  updateRatio: (id: string, ratio: Partial<Ratio>) => Promise<Ratio>;
  deleteRatio: (id: string) => Promise<void>;
  
  // Ratio operations
  getCoreRatios: () => Ratio[];
  getDerivedRatios: () => Ratio[];
  getCombinedRatios: () => Ratio[];
  
  // Calculation functions
  calculateAllocation: (ratioId: string, totalValue: number) => Record<string, number>;
  combineRatios: (sourceRatioIds: string[], combinationType: string, options?: any) => EntityValue;
}

export const RatioManagerContext = createContext<RatioManagerContextType | undefined>(undefined);

export const useRatioManager = () => {
  const context = useContext(RatioManagerContext);
  if (context === undefined) {
    throw new Error('useRatioManager must be used within a RatioManagerProvider');
  }
  return context;
};

interface RatioManagerProviderProps {
  contractId: string;
  children: React.ReactNode;
}

export const RatioManagerProvider: React.FC<RatioManagerProviderProps> = ({ 
  contractId, 
  children 
}) => {
  const [ratios, setRatios] = useState<Ratio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Load ratios for the contract
  useEffect(() => {
    const fetchRatios = async () => {
      try {
        setLoading(true);
        console.log(`Fetching ratios for contract ID: ${contractId}`);
        const response = await apiRequest(`/amc/contracts/${contractId}/ratios`);
        console.log(`Received ratios:`, response);
        
        // Process received ratios to ensure core ratios have proper entity values
        let processedRatios = response || [];
        
        // If no ratios are returned or if core ratios are missing, initialize empty ones
        if (!processedRatios.length) {
          console.log("No ratios found for contract, initializing with empty core ratios");
          
          // We'll fetch entities to get their IDs for empty ratio initialization
          const entitiesResponse = await apiRequest(`/amc/contracts/${contractId}/entities`);
          const entities = entitiesResponse || [];
          
          if (entities.length > 0) {
            // Create empty entityValues object with entity IDs as keys
            const emptyEntityValues = entities.reduce((values: Record<string, number>, entity) => {
              // Ensure we're using string keys for entityValues
              values[entity.id.toString()] = 0; // Start with 0 for all entities
              return values;
            }, {});
            
            // Add empty core ratios for basic types
            const coreRatioTypes = [
              { id: 'core-1', name: 'Sellable Area', ratioType: 'sellable_area', isCore: true },
              { id: 'core-2', name: 'Applicable Area', ratioType: 'applicable_area', isCore: true },
              { id: 'core-3', name: 'Parking Bay Area', ratioType: 'parking_bay_area', isCore: true },
              { id: 'core-4', name: 'Dedicated Common Area', ratioType: 'dedicated_common_area', isCore: true },
              { id: 'core-5', name: 'Total Component Area', ratioType: 'total_component_area', isCore: true },
              { id: 'core-6', name: 'Principal Common Area', ratioType: 'principal_common_area', isCore: true },
              { id: 'core-7', name: 'Common Element Area', ratioType: 'common_element_area', isCore: true },
              { id: 'core-8', name: 'Total Common Area', ratioType: 'total_common_area', isCore: true }
            ];
            
            // Create core ratios with empty values
            const initialCoreRatios = coreRatioTypes.map(coreType => ({
              ...coreType,
              entityValues: {...emptyEntityValues},
              description: `${coreType.name} ratio for all entities`
            }));
            
            processedRatios = initialCoreRatios;
          }
        } else {
          // Ensure all existing ratios have properly formatted entityValues with string keys
          processedRatios = processedRatios.map(ratio => {
            if (ratio.entityValues) {
              // Convert any numeric keys to string keys for consistency
              const formattedEntityValues: Record<string, number> = {};
              Object.entries(ratio.entityValues).forEach(([key, value]) => {
                formattedEntityValues[key.toString()] = typeof value === 'number' ? value : parseFloat(value as any) || 0;
              });
              return {
                ...ratio,
                entityValues: formattedEntityValues
              };
            }
            return ratio;
          });
        }
        
        setRatios(processedRatios);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ratios for contract ${contractId}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    if (contractId) {
      fetchRatios();
    } else {
      console.warn("No contract ID provided to RatioManagerProvider");
      // Reset ratios when no contract is available
      setRatios([]);
    }
  }, [contractId]);

  // CRUD operations
  const createRatio = async (ratio: Omit<Ratio, 'id'>): Promise<Ratio> => {
    try {
      const response = await apiRequest(`/amc/contracts/${contractId}/ratios`, {
        method: 'POST',
        body: JSON.stringify(ratio)
      });
      
      setRatios(prev => [...prev, response]);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateRatio = async (id: string, ratioUpdate: Partial<Ratio>): Promise<Ratio> => {
    try {
      const response = await apiRequest(`/amc/contracts/${contractId}/ratios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(ratioUpdate)
      });
      
      setRatios(prev => prev.map(r => r.id === id ? { ...r, ...response } : r));
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteRatio = async (id: string): Promise<void> => {
    try {
      await apiRequest(`/amc/contracts/${contractId}/ratios/${id}`, {
        method: 'DELETE'
      });
      
      setRatios(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Filter ratios by type
  const getCoreRatios = () => ratios.filter(r => r.isCore);
  const getDerivedRatios = () => ratios.filter(r => !r.isCore && r.ratioType === 'derived');
  const getCombinedRatios = () => ratios.filter(r => !r.isCore && ['combined', 'exclusive'].includes(r.ratioType));

  // Calculate allocation based on a ratio
  const calculateAllocation = (ratioId: string, totalValue: number): Record<string, number> => {
    const ratio = ratios.find(r => r.id === ratioId);
    if (!ratio) return {};

    const entityValues = ratio.entityValues;
    const totalRatioValue = Object.values(entityValues).reduce((sum, val) => sum + val, 0);
    
    // Return allocation for each entity
    return Object.entries(entityValues).reduce((result, [entityId, value]) => {
      const percentage = totalRatioValue > 0 ? value / totalRatioValue : 0;
      result[entityId] = percentage * totalValue;
      return result;
    }, {} as Record<string, number>);
  };

  // Function to combine ratios based on type
  const combineRatios = (
    sourceRatioIds: string[], 
    combinationType: string, 
    options?: any
  ): EntityValue => {
    // Get source ratios
    const sourceRatios = ratios.filter(r => sourceRatioIds.includes(r.id));
    if (sourceRatios.length === 0) return {};

    // Get all entity IDs from all source ratios
    const allEntityIds = new Set<string>();
    sourceRatios.forEach(ratio => {
      Object.keys(ratio.entityValues).forEach(id => allEntityIds.add(id));
    });
    
    // Convert to array
    const entityIds = Array.from(allEntityIds);
    
    // Initialize result
    const result: EntityValue = {};
    
    // Different combination logic based on type
    switch (combinationType) {
      case 'add':
        // For each entity, add up the values from all source ratios
        entityIds.forEach(entityId => {
          result[entityId] = sourceRatios.reduce((sum, ratio) => 
            sum + (ratio.entityValues[entityId] || 0), 0);
        });
        
        // Log the calculation details for debugging
        console.log('Combined ratio calculation (addition):', {
          sourceRatios: sourceRatios.map(r => ({
            id: r.id,
            name: r.name,
            values: r.entityValues
          })),
          result
        });
        break;
        
      case 'subtract':
        if (sourceRatios.length < 2) return sourceRatios[0]?.entityValues || {};
        
        entityIds.forEach(entityId => {
          // Start with first ratio's value
          let value = sourceRatios[0].entityValues[entityId] || 0;
          
          // Subtract all other ratios
          for (let i = 1; i < sourceRatios.length; i++) {
            value -= (sourceRatios[i].entityValues[entityId] || 0);
          }
          
          result[entityId] = Math.max(0, value); // Prevent negative values
        });
        
        // Log the calculation details for debugging
        console.log('Combined ratio calculation (subtraction):', {
          sourceRatios: sourceRatios.map(r => ({
            id: r.id,
            name: r.name,
            values: r.entityValues
          })),
          result
        });
        break;
        
      case 'average':
        entityIds.forEach(entityId => {
          // Only include ratios that have a value for this entity
          const ratiosWithValue = sourceRatios.filter(r => 
            r.entityValues[entityId] !== undefined && r.entityValues[entityId] !== null);
          
          if (ratiosWithValue.length === 0) {
            result[entityId] = 0;
          } else {
            result[entityId] = ratiosWithValue.reduce((sum, ratio) => 
              sum + (ratio.entityValues[entityId] || 0), 0) / ratiosWithValue.length;
          }
        });
        
        // Log the calculation details for debugging
        console.log('Combined ratio calculation (average):', {
          sourceRatios: sourceRatios.map(r => ({
            id: r.id,
            name: r.name,
            values: r.entityValues
          })),
          result
        });
        break;
        
      case 'weighted':
        const weights = options?.weights || sourceRatios.map(() => 1);
        const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
        
        if (totalWeight <= 0) {
          // Avoid division by zero
          return {};
        }
        
        entityIds.forEach(entityId => {
          result[entityId] = sourceRatios.reduce((sum, ratio, index) => 
            sum + ((ratio.entityValues[entityId] || 0) * (weights[index] || 0)), 0) / totalWeight;
        });
        
        // Log the calculation details for debugging
        console.log('Combined ratio calculation (weighted):', {
          sourceRatios: sourceRatios.map((r, i) => ({
            id: r.id,
            name: r.name,
            values: r.entityValues,
            weight: weights[i]
          })),
          totalWeight,
          result
        });
        break;
        
      case 'custom':
        // Custom logic based on options
        if (options?.includeEntityIds) {
          // Include only specific entities
          entityIds.forEach(entityId => {
            if (options.includeEntityIds.includes(entityId)) {
              // For included entities, sum the values from all source ratios
              result[entityId] = sourceRatios.reduce((sum, ratio) => 
                sum + (ratio.entityValues[entityId] || 0), 0);
            } else {
              result[entityId] = 0;
            }
          });
        } else if (options?.excludeEntityIds) {
          // Exclude specific entities
          entityIds.forEach(entityId => {
            if (!options.excludeEntityIds.includes(entityId)) {
              // For non-excluded entities, sum the values from all source ratios
              result[entityId] = sourceRatios.reduce((sum, ratio) => 
                sum + (ratio.entityValues[entityId] || 0), 0);
            } else {
              result[entityId] = 0;
            }
          });
        } else {
          // If no inclusion/exclusion specified, just sum all values
          entityIds.forEach(entityId => {
            result[entityId] = sourceRatios.reduce((sum, ratio) => 
              sum + (ratio.entityValues[entityId] || 0), 0);
          });
        }
        
        // Log the calculation details for debugging
        console.log('Combined ratio calculation (custom):', {
          sourceRatios: sourceRatios.map(r => ({
            id: r.id,
            name: r.name,
            values: r.entityValues
          })),
          includeEntityIds: options?.includeEntityIds,
          excludeEntityIds: options?.excludeEntityIds,
          result
        });
        break;
        
      default:
        // Default to simple sum of all ratios
        entityIds.forEach(entityId => {
          result[entityId] = sourceRatios.reduce((sum, ratio) => 
            sum + (ratio.entityValues[entityId] || 0), 0);
        });
        
        console.log('Combined ratio calculation (default):', {
          sourceRatios: sourceRatios.map(r => ({
            id: r.id,
            name: r.name,
            values: r.entityValues
          })),
          result
        });
    }
    
    return result;
  };

  const value = {
    ratios,
    loading,
    error,
    createRatio,
    updateRatio,
    deleteRatio,
    getCoreRatios,
    getDerivedRatios,
    getCombinedRatios,
    calculateAllocation,
    combineRatios
  };

  return (
    <RatioManagerContext.Provider value={value}>
      {children}
    </RatioManagerContext.Provider>
  );
};

export default RatioManagerProvider;
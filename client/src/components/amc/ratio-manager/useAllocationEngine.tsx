import React, { useState, useCallback, useMemo } from 'react';
import { RatioManagerContext, Ratio as ManagerRatio } from './RatioManagerProvider';
import { Ratio as SharedRatio, Entity, standardizeRatio } from '@shared/ratio-types';

// Local definition of AllocationInput to match existing component implementation
// This makes it compatible with the component implementation while maintaining
// the spirit of the standardized type
export interface AllocationInput {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string;
  ratioId: string;
  entityValues?: Record<string, number>;
}

export interface EntityAllocation {
  entityId: string;
  value: number;
  percentage: number;
}

export interface AllocationDistribution {
  inputId: string;
  entityAllocations: Record<string, EntityAllocation>;
  totalAllocated: number;
}

// Helper function to convert manager ratio to shared ratio
function convertToSharedRatio(managerRatio: ManagerRatio): SharedRatio {
  return standardizeRatio({
    ...managerRatio,
    id: typeof managerRatio.id === 'string' ? parseInt(managerRatio.id) : managerRatio.id,
    // Convert string-based entity values to number-based
    entityValues: Object.entries(managerRatio.entityValues).reduce((result, [entityId, value]) => {
      result[parseInt(entityId)] = value;
      return result;
    }, {} as Record<number, number>)
  });
}

export interface UseAllocationEngineProps {
  entities: Entity[];  // Using the standardized Entity type from shared/ratio-types.ts
  ratios?: ManagerRatio[];
}

export interface UseAllocationEngineReturn {
  // Allocation state
  inputs: AllocationInput[];
  distributions: Record<string, AllocationDistribution>;
  totals: Record<string, number>;
  
  // Input management
  addInput: (input: Omit<AllocationInput, 'id'>) => string;
  updateInput: (id: string, input: Partial<AllocationInput>) => void;
  removeInput: (id: string) => void;
  
  // Helpers
  getTotalForEntity: (entityId: string) => number;
  getPercentageForEntity: (entityId: string) => number;
  getAllInputsTotal: () => number;
  getInputDistribution: (inputId: string) => AllocationDistribution | undefined;
  
  // Export functions
  getAllocationData: () => any;
}

/**
 * Custom hook for managing the allocation engine
 * Handles allocation inputs, ratio distribution, and totals calculation
 */
export const useAllocationEngine = ({ entities, ratios = [] }: UseAllocationEngineProps): UseAllocationEngineReturn => {
  // If we're within a RatioManager context, use it; otherwise use the passed ratios
  const ratioContext = React.useContext(RatioManagerContext);
  const managedRatios = ratioContext ? ratioContext.ratios : ratios;
  
  const [inputs, setInputs] = useState<AllocationInput[]>([]);
  const [distributions, setDistributions] = useState<Record<string, AllocationDistribution>>({});

  // Calculate entity allocations based on input and ratio
  const distributeInput = useCallback((
    input: AllocationInput, 
    ratio: ManagerRatio,
    entities: Entity[]
  ): Record<string, EntityAllocation> => {
    const entityAllocations: Record<string, EntityAllocation> = {};
    
    // Calculate total ratio value
    const totalRatioValue = ratio.entityValues 
      ? Object.values(ratio.entityValues).reduce((sum: number, val: number) => sum + val, 0)
      : 0;
    
    // Distribute to each entity
    entities.forEach(entity => {
      // Convert entity.id from number to string for compatibility
      const entityId = entity.id.toString();
      
      // Handle conversion between number and string IDs
      const entityIdStr = entity.id.toString();
      const entityRatioValue = ratio.entityValues && ratio.entityValues[entityIdStr] 
        ? ratio.entityValues[entityIdStr] 
        : 0;
      
      const percentage = totalRatioValue > 0 ? entityRatioValue / totalRatioValue : 0;
      const value = percentage * input.value;
      
      entityAllocations[entityId] = {
        entityId,
        value,
        percentage: percentage * 100
      };
    });
    
    return entityAllocations;
  }, []);

  // Add a new allocation input
  const addInput = useCallback((input: Omit<AllocationInput, 'id'>): string => {
    const id = `input-${Date.now()}`;
    const newInput = { ...input, id };
    
    setInputs(prev => [...prev, newInput]);
    
    // Create empty distribution for new inputs without a valid ratio
    if (!input.ratioId || input.ratioId === '' || input.ratioId === 'none') {
      // Create empty allocations for all entities
      const emptyEntityAllocations: Record<string, EntityAllocation> = {};
      entities.forEach(entity => {
        const entityId = entity.id.toString();
        emptyEntityAllocations[entityId] = {
          entityId,
          value: 0,
          percentage: 0
        };
      });
      
      setDistributions(prev => ({
        ...prev,
        [id]: {
          inputId: id,
          entityAllocations: emptyEntityAllocations,
          totalAllocated: 0
        }
      }));
      return id;
    }
    
    // Calculate distribution for the new input with a ratio
    const ratio = managedRatios.find(r => r.id === input.ratioId);
    if (ratio) {
      const entityAllocations = distributeInput(newInput, ratio, entities);
      const totalAllocated = Object.values(entityAllocations).reduce(
        (sum, allocation) => sum + allocation.value, 0
      );
      
      setDistributions(prev => ({
        ...prev,
        [id]: {
          inputId: id,
          entityAllocations,
          totalAllocated
        }
      }));
    }
    
    return id;
  }, [managedRatios, entities, distributeInput]);

  // Update an existing input with immediate recalculation
  const updateInput = useCallback((id: string, inputUpdate: Partial<AllocationInput>) => {
    // First update the input object
    let updatedInputs = inputs.map(input => 
      input.id === id ? { ...input, ...inputUpdate } : input
    );
    setInputs(updatedInputs);
    
    // Find the updated input to use in calculation
    const currentInput = inputs.find(input => input.id === id);
    // Apply updates to get the new state
    const updatedInput = currentInput ? { ...currentInput, ...inputUpdate } : null;
    
    if (!updatedInput) return; // Safety check
    
    // Always recalculate distribution when any property changes
    // This ensures percentages are always up to date
    
    // If the ratio was removed or set to empty
    if (!updatedInput.ratioId || updatedInput.ratioId === '' || updatedInput.ratioId === 'none') {
      // Create empty allocations for all entities
      const emptyEntityAllocations: Record<string, EntityAllocation> = {};
      entities.forEach(entity => {
        const entityId = entity.id.toString();
        emptyEntityAllocations[entityId] = {
          entityId,
          value: 0,
          percentage: 0
        };
      });
      
      setDistributions(prev => ({
        ...prev,
        [id]: {
          inputId: id,
          entityAllocations: emptyEntityAllocations,
          totalAllocated: 0
        }
      }));
      return;
    }
    
    // If a valid ratio was selected
    const ratio = managedRatios.find(r => r.id === updatedInput.ratioId);
    if (ratio) {
      const entityAllocations = distributeInput(updatedInput, ratio, entities);
      const totalAllocated = Object.values(entityAllocations).reduce(
        (sum, allocation) => sum + allocation.value, 0
      );
      
      setDistributions(prev => ({
        ...prev,
        [id]: {
          inputId: id,
          entityAllocations,
          totalAllocated
        }
      }));
    }
  }, [inputs, managedRatios, entities, distributeInput]);

  // Remove an input
  const removeInput = useCallback((id: string) => {
    setInputs(prev => prev.filter(input => input.id !== id));
    setDistributions(prev => {
      const newDistributions = { ...prev };
      delete newDistributions[id];
      return newDistributions;
    });
  }, []);

  // Calculate totals for each entity across all inputs
  const totals = useMemo(() => {
    const entityTotals: Record<string, number> = {};
    
    // Initialize with zero for all entities
    entities.forEach(entity => {
      // Convert entity.id from number to string
      entityTotals[entity.id.toString()] = 0;
    });
    
    // Sum up allocations for each entity
    Object.values(distributions).forEach(distribution => {
      Object.values(distribution.entityAllocations).forEach(allocation => {
        entityTotals[allocation.entityId] = 
          (entityTotals[allocation.entityId] || 0) + allocation.value;
      });
    });
    
    return entityTotals;
  }, [distributions, entities]);

  // Get total allocated to a specific entity
  const getTotalForEntity = useCallback((entityId: string): number => {
    return totals[entityId] || 0;
  }, [totals]);

  // Get percentage of total for a specific entity
  const getPercentageForEntity = useCallback((entityId: string): number => {
    const totalAllocation = Object.values(totals).reduce((sum, val) => sum + val, 0);
    return totalAllocation > 0 ? (totals[entityId] || 0) / totalAllocation * 100 : 0;
  }, [totals]);

  // Get the total of all inputs
  const getAllInputsTotal = useCallback((): number => {
    return inputs.reduce((sum, input) => sum + input.value, 0);
  }, [inputs]);

  // Get the distribution for a specific input
  const getInputDistribution = useCallback((inputId: string): AllocationDistribution | undefined => {
    return distributions[inputId];
  }, [distributions]);

  // Export allocation data for saving
  const getAllocationData = useCallback(() => {
    return {
      inputs,
      distributions,
      totals
    };
  }, [inputs, distributions, totals]);

  return {
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
  };
};

export default useAllocationEngine;
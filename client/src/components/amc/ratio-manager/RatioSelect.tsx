import React, { useContext, useState } from 'react';
import { RatioManagerContext, Ratio as ManagerRatio } from './RatioManagerProvider';
import { Ratio as SharedRatio, standardizeRatio } from '@shared/ratio-types';
import { 
  getStandardizedRatioName, 
  getStandardizedRatioDescription,
  getRatioTypeDisplayName,
  formatPercentage
} from '../ratio-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { PercentIcon, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the properties for this component
interface RatioSelectProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  setSelectedRatio?: (ratio: ManagerRatio | null) => void;
  setActiveTab?: (tab: string) => void;
}

// Helper function to convert manager ratio to shared ratio for utility functions
function convertToSharedRatio(managerRatio: ManagerRatio): SharedRatio {
  // Basic conversion - use standardizeRatio to ensure all required fields
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

/**
 * A reusable select component for ratio selection that ensures consistent display
 * of ratio descriptions and additional information across the application
 */
const RatioSelect: React.FC<RatioSelectProps> = ({ 
  value, 
  onChange, 
  setSelectedRatio,
  setActiveTab
}) => {
  // Get ratios from context
  const context = useContext(RatioManagerContext);
  const ratios = context?.ratios || [];
  
  // Filter to only show derived ratios, not core ratios
  const derivedRatios = ratios.filter((r: ManagerRatio) => r.isCore !== true);
  
  const handleChange = (newValue: string) => {
    if (newValue === 'manual') {
      onChange(null);
      if (setSelectedRatio) setSelectedRatio(null);
      return;
    }
    
    // Skip if newValue is empty or invalid
    if (!newValue || newValue === '' || isNaN(parseInt(newValue))) {
      console.warn('Invalid ratio ID:', newValue);
      return;
    }
    
    // Parse ratio ID
    const ratioId = parseInt(newValue);
    
    // Find the ratio in the derived ratios array
    const selectedRatio = derivedRatios.find((r: ManagerRatio) => r.id.toString() === ratioId.toString());
    
    if (selectedRatio) {
      onChange(selectedRatio.id);
      if (setSelectedRatio) setSelectedRatio(selectedRatio);
    } else {
      console.error('Failed to find ratio with ID:', ratioId);
    }
  };
  
  // Find the currently selected ratio
  const selectedRatio = value ? derivedRatios.find((r: ManagerRatio) => r.id.toString() === value.toString()) : null;
  
  return (
    <Select
      value={value ? value.toString() : 'manual'}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select ratio for allocation">
          {selectedRatio ? 
            getStandardizedRatioName(convertToSharedRatio(selectedRatio)) : 
            'Manual Distribution'
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        <SelectItem value="manual">Manual Distribution</SelectItem>
        
        {derivedRatios.length > 0 && (
          <>
            {/* Use a different pattern for the header since empty string values cause errors */}
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              --- Available Ratio Descriptions ---
            </div>
            {derivedRatios.map((ratio: ManagerRatio) => {
              // Calculate percentages for display
              const totalValue = Object.values(ratio.entityValues).reduce((sum: number, val: number) => sum + val, 0);
              
              // Get top entities by percentage (max 2 for display clarity)
              const topEntities = Object.entries(ratio.entityValues)
                .map(([entityId, value]) => ({
                  entityId,
                  percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
                }))
                .filter(item => item.percentage > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 2);
              
              // Count of active entities (non-zero)
              const activeEntityCount = Object.values(ratio.entityValues).filter(v => v > 0).length;
              
              return (
                <SelectItem 
                  key={`derived_${ratio.id}`} 
                  value={ratio.id.toString()}
                  className="py-2"
                >
                  <div className="flex flex-col space-y-1 w-full">
                    {/* Primary ratio description */}
                    <span className="font-medium">{ratio.description || getStandardizedRatioName(convertToSharedRatio(ratio))}</span>
                    
                    {/* Ratio type with badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getRatioTypeDisplayName(ratio.ratioType as any)}
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <PercentIcon className="h-3 w-3" />
                        {activeEntityCount} entities
                      </span>
                    </div>
                    
                    {/* Entity distribution preview */}
                    {topEntities.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {topEntities.map((entity, i) => (
                          <span key={entity.entityId}>
                            Entity {entity.entityId}: {formatPercentage(entity.percentage)}
                            {i < topEntities.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                        {activeEntityCount > 2 && ` + ${activeEntityCount - 2} more`}
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default RatioSelect;
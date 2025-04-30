import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRatioManager, Ratio, EntityValue } from './RatioManagerProvider';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface RatioCombinerProps {
  sourceRatioIds: string[];
  setSourceRatioIds: (ids: string[]) => void;
  combinationType: string;
  availableRatios: Ratio[];
  onCombineRatios: (result: EntityValue) => void;
  includeEntityIds?: string[];
  excludeEntityIds?: string[];
}

export const RatioCombiner: React.FC<RatioCombinerProps> = ({
  sourceRatioIds,
  setSourceRatioIds,
  combinationType,
  availableRatios,
  onCombineRatios,
  includeEntityIds = [],
  excludeEntityIds = []
}) => {
  const { combineRatios } = useRatioManager();
  const [weights, setWeights] = useState<number[]>([]);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // When source ratios or combination type changes, update weights
  useEffect(() => {
    if (sourceRatioIds.length > 0) {
      // Initialize weights (default to 1 for each ratio)
      setWeights(sourceRatioIds.map(() => 1));
    }
  }, [sourceRatioIds]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (autoUpdate && sourceRatioIds.length > 0 && combinationType) {
      const options: any = {};
      
      // Add weights for weighted average
      if (combinationType === 'weighted') {
        options.weights = weights;
      }
      
      // Add entity inclusions/exclusions for custom combination
      if (combinationType === 'custom') {
        if (includeEntityIds?.length > 0) {
          options.includeEntityIds = includeEntityIds;
        }
        if (excludeEntityIds?.length > 0) {
          options.excludeEntityIds = excludeEntityIds;
        }
      }
      
      // Calculate combined ratio values
      const result = combineRatios(sourceRatioIds, combinationType, options);
      onCombineRatios(result);
    }
  }, [
    sourceRatioIds, 
    combinationType, 
    weights, 
    autoUpdate,
    includeEntityIds,
    excludeEntityIds,
    combineRatios,
    onCombineRatios
  ]);

  const handleAddRatio = () => {
    // Find first available ratio not already selected
    const availableRatioIds = availableRatios
      .filter(r => !sourceRatioIds.includes(r.id))
      .map(r => r.id);
    
    if (availableRatioIds.length > 0) {
      const newSourceRatioIds = [...sourceRatioIds, availableRatioIds[0]];
      setSourceRatioIds(newSourceRatioIds);
      setWeights([...weights, 1]);
    }
  };

  const handleRemoveRatio = (index: number) => {
    const newSourceRatioIds = [...sourceRatioIds];
    newSourceRatioIds.splice(index, 1);
    setSourceRatioIds(newSourceRatioIds);
    
    const newWeights = [...weights];
    newWeights.splice(index, 1);
    setWeights(newWeights);
  };

  const handleRatioChange = (index: number, ratioId: string) => {
    const newSourceRatioIds = [...sourceRatioIds];
    newSourceRatioIds[index] = ratioId;
    setSourceRatioIds(newSourceRatioIds);
  };

  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const handleCalculate = () => {
    const options: any = {};
    
    if (combinationType === 'weighted') {
      options.weights = weights;
    }
    
    if (combinationType === 'custom') {
      if (includeEntityIds?.length > 0) {
        options.includeEntityIds = includeEntityIds;
      }
      if (excludeEntityIds?.length > 0) {
        options.excludeEntityIds = excludeEntityIds;
      }
    }
    
    const result = combineRatios(sourceRatioIds, combinationType, options);
    onCombineRatios(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Source Ratios</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAddRatio}
          disabled={availableRatios.filter(r => !sourceRatioIds.includes(r.id)).length === 0}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Ratio
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sourceRatioIds.map((ratioId, index) => {
          const ratio = availableRatios.find(r => r.id === ratioId);
          return (
            <Card key={index} className="p-2">
              <CardContent className="p-2 flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={ratioId}
                    onValueChange={(value) => handleRatioChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRatios
                        .filter(r => !sourceRatioIds.includes(r.id) || r.id === ratioId)
                        .map(ratio => (
                          <SelectItem key={ratio.id} value={ratio.id}>
                            {ratio.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                {combinationType === 'weighted' && (
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      value={weights[index] || 1}
                      onChange={(e) => handleWeightChange(index, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleRemoveRatio(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
        {sourceRatioIds.length === 0 && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No source ratios selected. Click "Add Ratio" to add ratios to combine.
          </div>
        )}
      </div>
      
      {combinationType === 'custom' && (
        <div className="space-y-2">
          <Label>Included/Excluded Entities</Label>
          <div className="flex flex-wrap gap-2">
            {includeEntityIds?.map(id => (
              <Badge key={id} variant="outline" className="bg-green-50">
                Include: {id}
              </Badge>
            ))}
            {excludeEntityIds?.map(id => (
              <Badge key={id} variant="outline" className="bg-red-50">
                Exclude: {id}
              </Badge>
            ))}
            {includeEntityIds?.length === 0 && excludeEntityIds?.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Use the "Ratio Values" tab to include/exclude entities.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Label className="flex items-center">
          <Input
            type="checkbox"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          Auto-calculate
        </Label>
        
        <Button onClick={handleCalculate} disabled={sourceRatioIds.length === 0 || !combinationType}>
          Calculate
        </Button>
      </div>
    </div>
  );
};

export default RatioCombiner;
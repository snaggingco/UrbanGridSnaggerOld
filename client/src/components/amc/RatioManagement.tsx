import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  InfoIcon, 
  PercentIcon, 
  ArrowRightIcon, 
  ChevronDown, 
  Calculator
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// Import shared ratio types
import type { 
  Entity, 
  SharedArea,
  Ratio
} from "@shared/ratio-types";
import { 
  isDerivedRatio,
  standardizeRatio,
  isCombinationRatio 
} from "@shared/ratio-types";
import {
  getRatioTypeDisplayName,
  getRatioTypeColorClass,
  getStandardizedRatioName,
  getStandardizedRatioDescription,
  formatRatioValue
} from "./ratio-utils";
import RatioCalculationDisplay from "./ratio-manager/RatioCalculationDisplay";

interface RatioManagementProps {
  entities: Entity[];
  sharedAreas: SharedArea[];
  ratios: Ratio[];
  unitType: 'sqm' | 'sqft';
  onContinue?: () => void;
  onBack?: () => void;
}

/**
 * Ratio Management component
 * Displays all ratios in the project with calculation details
 */
const RatioManagement: React.FC<RatioManagementProps> = ({
  entities,
  sharedAreas,
  ratios,
  unitType,
  onContinue,
  onBack,
}) => {
  // State for expanded card
  const [expandedRatioId, setExpandedRatioId] = useState<number | null>(null);
  
  // Toggle expanded state for a ratio
  const toggleRatioExpand = (ratioId: number) => {
    if (expandedRatioId === ratioId) {
      setExpandedRatioId(null);
    } else {
      setExpandedRatioId(ratioId);
    }
  };
  
  // Get entity name by ID
  const getEntityName = (entityId: number): string => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : `Entity ${entityId}`;
  };

  // Process each ratio to ensure it has all the necessary properties
  const processedRatios = ratios.map(standardizeRatio);

  // Check if we have valid ratios to display
  const hasRatios = processedRatios.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PercentIcon className="mr-2 h-5 w-5" />
          Ratio Management
        </CardTitle>
        <CardDescription>
          Comprehensive view of all ratios with detailed mathematical calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">All Project Ratios</h3>
            {hasRatios && (
              <span className="text-sm text-muted-foreground">
                {processedRatios.length} ratios available
              </span>
            )}
          </div>
          
          {hasRatios ? (
            <div className="space-y-4">
              {processedRatios.map((ratio: Ratio) => {
                const ratioTypeClass = getRatioTypeColorClass(ratio.ratioType);
                
                // Get entities list for display
                const entityList = isDerivedRatio(ratio)
                  ? (ratio.entityModifications || [])
                      .filter(mod => mod.action === 'include' && mod.modifiedValue > 0)
                      .map(mod => getEntityName(mod.entityId))
                  : (isCombinationRatio(ratio) && ratio.entityIds ? ratio.entityIds : [])
                      .map(id => getEntityName(id));
                      
                // Ensure ratio value is a number
                const ratioValue = parseFloat(
                  isDerivedRatio(ratio) 
                    ? ratio.calculatedRatioValue?.toString() || '0'
                    : (isCombinationRatio(ratio) ? ratio.ratioValue?.toString() || '0' : '0')
                );
                
                return (
                  <Collapsible 
                    key={ratio.id}
                    open={expandedRatioId === ratio.id}
                    onOpenChange={() => toggleRatioExpand(ratio.id)}
                    className="border rounded-lg bg-card shadow-sm overflow-hidden"
                  >
                    <div className="flex justify-between items-start p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`${ratioTypeClass} text-xs py-0.5 font-normal text-black`}>
                            {getRatioTypeDisplayName(ratio.ratioType)}
                          </Badge>
                          
                          <h3 className="text-lg font-semibold">
                            {ratio.description || getStandardizedRatioName(ratio)}
                          </h3>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <InfoIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-medium">About this ratio</p>
                                  <p className="text-sm">{getStandardizedRatioDescription(ratio)}</p>
                                  {ratio.id && (
                                    <p className="text-xs text-muted-foreground mt-1">ID: {ratio.id}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1 ml-1">
                          {entityList.length > 0 && (
                            <span>Includes: {entityList.join(', ')}</span>
                          )}
                          {typeof ratioValue === 'number' && ratioValue > 0 && (
                            <span className="ml-2 font-medium">
                              ({formatRatioValue(ratioValue, unitType)})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRatioExpand(ratio.id);
                          }}
                        >
                          <Calculator className="h-3.5 w-3.5" />
                          <span>View Calculation</span>
                        </Button>
                        
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t pt-4">
                        <RatioCalculationDisplay 
                          ratio={ratio}
                          entities={entities}
                          sharedAreas={sharedAreas}
                          unitType={unitType}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-md">
              <p className="text-muted-foreground">
                No ratios have been defined yet. Create ratios in the Project Setup tab.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 mt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Project Setup
          </Button>
        )}
        <div className="flex-1"></div>
        {onContinue && (
          <Button onClick={onContinue} className="ml-auto">
            Continue to Budget Selection
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RatioManagement;
import React, { useState } from "react";
import { AlertCircle, CheckCircle, ChevronRight, Info, Settings, ArrowUp, ArrowDown, Percent, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RecommendationActionType = 
  | 'increase_contribution' 
  | 'decrease_contribution' 
  | 'increase_escalation' 
  | 'decrease_escalation' 
  | 'increase_inflation' 
  | 'decrease_inflation' 
  | 'increase_interest' 
  | 'decrease_interest' 
  | 'custom';

interface RecommendationAction {
  type: RecommendationActionType;
  value: number | string;
  years?: number[];
  customAction?: string;
}

interface RecommendationItem {
  description: string;
  action: RecommendationAction;
  icon: React.ElementType;
}

interface ImportantNoticesWithRecommendationsProps {
  warnings: string[];
  onApplyRecommendation: (recommendation: RecommendationAction, index: number) => void;
  currentSettings?: {
    annualContribution?: number;
    contributionIncreaseRate?: string;
    inflationRate?: string;
    interestRate?: string;
  };
}

/**
 * Analyzes a warning message and returns an appropriate recommendation
 */
function getRecommendationForWarning(warning: string, currentSettings?: any): RecommendationItem {
  // Cash flow warnings
  if (warning.includes("negative cash flow") || warning.includes("deficit")) {
    return {
      description: "Increase annual contribution to prevent negative cash flow",
      action: {
        type: 'increase_contribution',
        value: 5,
        years: [1, 2, 3]
      },
      icon: ArrowUp
    };
  }

  // Contribution warnings
  if (warning.includes("insufficient contribution")) {
    return {
      description: "Current contribution rate is too low for projected expenses",
      action: {
        type: 'increase_escalation',
        value: 4.0
      },
      icon: Percent
    };
  }

  // Reserve fund balance warnings
  if (warning.includes("balance falls below")) {
    return {
      description: "Reserve fund balance will be too low in some periods",
      action: {
        type: 'increase_escalation',
        value: 2.0,
        years: [7, 8, 9]
      },
      icon: ArrowUp
    };
  }

  // Inflation warnings
  if (warning.includes("inflation") && warning.includes("high")) {
    return {
      description: "Inflation rate may be set too high",
      action: {
        type: 'decrease_inflation',
        value: 2.0
      },
      icon: ArrowDown
    };
  }

  // Interest rate warnings
  if (warning.includes("interest rate") && warning.includes("low")) {
    return {
      description: "Interest rate may be set too low",
      action: {
        type: 'increase_interest',
        value: 1.5
      },
      icon: ArrowUp
    };
  }

  // Contribution Frequency
  if (warning.includes("contribution frequency") || warning.includes("payment schedule")) {
    return {
      description: "Consider changing contribution frequency for better cash flow",
      action: {
        type: 'custom',
        value: "monthly",
        customAction: "Switch to monthly contributions"
      },
      icon: Settings
    };
  }

  // Default case
  return {
    description: "Review reserve fund settings for optimal performance",
    action: {
      type: 'custom',
      value: "adjust",
      customAction: "Adjust contribution strategy based on projected needs"
    },
    icon: Settings
  };
}

export default function ImportantNoticesWithRecommendations({
  warnings,
  onApplyRecommendation,
  currentSettings
}: ImportantNoticesWithRecommendationsProps) {
  const [appliedRecommendations, setAppliedRecommendations] = useState<number[]>([]);

  const handleApplyRecommendation = (index: number) => {
    const recommendation = getRecommendationForWarning(warnings[index], currentSettings);
    onApplyRecommendation(recommendation.action, index);
    
    // Mark this recommendation as applied
    setAppliedRecommendations(prev => [...prev, index]);
    
    // Create user-friendly description based on the action type
    let actionDescription = "";
    const { action } = recommendation;
    
    switch(action.type) {
      case 'increase_contribution':
        actionDescription = `Increase contribution by ${action.value}%${action.years ? ` for years ${action.years.join(', ')}` : ''}`;
        break;
      case 'decrease_contribution':
        actionDescription = `Decrease contribution by ${action.value}%${action.years ? ` for years ${action.years.join(', ')}` : ''}`;
        break;
      case 'increase_escalation':
        actionDescription = `Increase annual contribution rate to ${action.value}%${action.years ? ` for years ${action.years.join(', ')}` : ''}`;
        break;
      case 'decrease_escalation':
        actionDescription = `Decrease annual contribution rate to ${action.value}%${action.years ? ` for years ${action.years.join(', ')}` : ''}`;
        break;
      case 'increase_inflation':
        actionDescription = `Increase inflation rate to ${action.value}%`;
        break;
      case 'decrease_inflation':
        actionDescription = `Decrease inflation rate to ${action.value}%`;
        break;
      case 'increase_interest':
        actionDescription = `Increase interest rate to ${action.value}%`;
        break;
      case 'decrease_interest':
        actionDescription = `Decrease interest rate to ${action.value}%`;
        break;
      case 'custom':
        actionDescription = action.customAction || "Custom action applied";
        break;
    }
    
    // Show success toast
    toast({
      title: "Recommendation Applied",
      description: actionDescription,
      variant: "default",
    });
  };

  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Important Notices</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-3">
          {warnings.map((warning, index) => {
            const recommendation = getRecommendationForWarning(warning, currentSettings);
            const isApplied = appliedRecommendations.includes(index);
            const { action, icon: ActionIcon } = recommendation;
            
            // Format action text for display
            let actionText = "";
            switch(action.type) {
              case 'increase_contribution':
                actionText = `Increase contribution by ${action.value}%`;
                break;
              case 'decrease_contribution':
                actionText = `Decrease contribution by ${action.value}%`;
                break;
              case 'increase_escalation':
                actionText = `Set escalation rate to ${action.value}%`;
                break;
              case 'decrease_escalation':
                actionText = `Set escalation rate to ${action.value}%`;
                break;
              case 'increase_inflation':
                actionText = `Set inflation to ${action.value}%`;
                break;
              case 'decrease_inflation':
                actionText = `Set inflation to ${action.value}%`;
                break;
              case 'increase_interest':
                actionText = `Set interest to ${action.value}%`;
                break;
              case 'decrease_interest':
                actionText = `Set interest to ${action.value}%`;
                break;
              case 'custom':
                actionText = action.customAction || "Apply custom change";
                break;
            }
            
            return (
              <div 
                key={index} 
                className="rounded-md border border-amber-200 bg-amber-50 p-3"
              >
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">{warning}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center cursor-help p-1 hover:bg-blue-50 rounded">
                              <Info className="h-4 w-4 text-blue-500 mr-1" />
                              <span className="text-xs font-medium text-blue-600">Recommendation</span>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="bottom" 
                              align="start" 
                              className="bg-white p-3 border border-gray-200 shadow-lg rounded max-w-xs z-50"
                            >
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-900">{recommendation.description}</p>
                                {action.years && (
                                  <p className="text-xs text-gray-600">Applies to years: {action.years.join(', ')}</p>
                                )}
                                <p className="text-xs text-gray-600">
                                  <span className="font-semibold">Action:</span> {actionText}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {isApplied ? (
                        <div className="flex items-center text-xs font-medium text-green-600">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Applied
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleApplyRecommendation(index)}
                        >
                          <ActionIcon className="h-3.5 w-3.5 mr-1" />
                          {actionText}
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AlertDescription>
    </Alert>
  );
}
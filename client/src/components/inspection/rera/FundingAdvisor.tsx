import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReserveFundSettings } from "./ReserveFundSettingsForm";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Lightbulb, 
  Zap, 
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FundingAdvisorProps {
  settings: ReserveFundSettings;
  onOptimize: (optimizedSettings: Partial<ReserveFundSettings>) => void;
  minimumAnnualContribution?: number;
}

export default function FundingAdvisor({ 
  settings, 
  onOptimize,
  minimumAnnualContribution
}: FundingAdvisorProps) {
  // Calculate optimization status for each setting
  const getStrategyStatus = () => {
    if (settings.contributionStrategy === 'escalating') return 'optimal';
    if (settings.contributionStrategy === 'flat') return 'suboptimal';
    return 'warning';
  };

  const getInterestRateStatus = () => {
    const rate = settings.interestRate * 100;
    if (rate >= 1.5 && rate <= 2.0) return 'optimal';
    if (rate > 2.0 && rate <= 4.0) return 'suboptimal';
    return 'warning';
  };

  const getInflationRateStatus = () => {
    const rate = settings.inflationRate * 100;
    if (rate >= 2.5 && rate <= 3.5) return 'optimal';
    if ((rate >= 2.0 && rate < 2.5) || (rate > 3.5 && rate <= 5.0)) return 'suboptimal';
    return 'warning';
  };

  const getEscalationRateStatus = () => {
    if (settings.contributionStrategy !== 'escalating') return 'neutral';
    
    const rate = (settings.escalationRate || 0) * 100;
    if (rate >= 2.0 && rate <= 3.0) return 'optimal';
    if ((rate >= 1.0 && rate < 2.0) || (rate > 3.0 && rate <= 4.0)) return 'suboptimal';
    return 'warning';
  };

  // Quick optimization function
  const handleQuickOptimize = () => {
    const optimizedSettings: Partial<ReserveFundSettings> = {
      contributionStrategy: 'escalating',
      interestRate: 0.02, // 2%
      inflationRate: 0.03, // 3%
      escalationRate: 0.025, // 2.5%
    };
    
    // If we have a minimum contribution, set it 15% higher
    if (minimumAnnualContribution) {
      optimizedSettings.annualContribution = Math.round(minimumAnnualContribution * 1.15);
    }
    
    onOptimize(optimizedSettings);
  };

  // Render status indicator
  const StatusIndicator = ({ status }: { status: 'optimal' | 'suboptimal' | 'warning' | 'neutral' }) => {
    if (status === 'neutral') return null;
    
    const icons = {
      optimal: <CheckCircle className="h-4 w-4 text-green-500" />,
      suboptimal: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-red-500" />
    };
    
    const labels = {
      optimal: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Optimal</Badge>,
      suboptimal: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Consider Adjusting</Badge>,
      warning: <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Review Recommended</Badge>
    };
    
    return (
      <div className="flex items-center space-x-2">
        {icons[status]}
        {labels[status]}
      </div>
    );
  };

  return (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
          Reserve Fund Optimization Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-4">
          <ul className="space-y-3">
            <li className="flex justify-between items-start border-b border-blue-100 pb-2">
              <div className="flex items-start">
                <span className="mr-2">
                  <Info className="h-4 w-4 text-blue-500 mt-1" />
                </span>
                <div>
                  <p className="font-medium">Contribution Strategy</p>
                  <p className="text-sm text-gray-600">
                    Escalating contributions (2-3% annually) provide the most balanced approach for both current and future owners.
                  </p>
                </div>
              </div>
              <StatusIndicator status={getStrategyStatus()} />
            </li>
            
            <li className="flex justify-between items-start border-b border-blue-100 pb-2">
              <div className="flex items-start">
                <span className="mr-2">
                  <Info className="h-4 w-4 text-blue-500 mt-1" />
                </span>
                <div>
                  <p className="font-medium">Interest Rate Assumption</p>
                  <p className="text-sm text-gray-600">
                    Use conservative rates (1.5-2%) to reduce risk in financial projections.
                  </p>
                </div>
              </div>
              <StatusIndicator status={getInterestRateStatus()} />
            </li>
            
            <li className="flex justify-between items-start border-b border-blue-100 pb-2">
              <div className="flex items-start">
                <span className="mr-2">
                  <Info className="h-4 w-4 text-blue-500 mt-1" />
                </span>
                <div>
                  <p className="font-medium">Inflation Rate</p>
                  <p className="text-sm text-gray-600">
                    Industry standard is to use 3% for long-term inflation projections in the UAE market.
                  </p>
                </div>
              </div>
              <StatusIndicator status={getInflationRateStatus()} />
            </li>
            
            {settings.contributionStrategy === 'escalating' && (
              <li className="flex justify-between items-start border-b border-blue-100 pb-2">
                <div className="flex items-start">
                  <span className="mr-2">
                    <Info className="h-4 w-4 text-blue-500 mt-1" />
                  </span>
                  <div>
                    <p className="font-medium">Escalation Rate</p>
                    <p className="text-sm text-gray-600">
                      Set between 2-3% to balance with inflation while keeping contributions manageable.
                    </p>
                  </div>
                </div>
                <StatusIndicator status={getEscalationRateStatus()} />
              </li>
            )}
            
            <li className="flex justify-between items-start pb-2">
              <div className="flex items-start">
                <span className="mr-2">
                  <Info className="h-4 w-4 text-blue-500 mt-1" />
                </span>
                <div>
                  <p className="font-medium">Initial Contribution</p>
                  <p className="text-sm text-gray-600">
                    Set initial contributions 10-15% above the calculated minimum for adequate safety margin.
                  </p>
                </div>
              </div>
            </li>
          </ul>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleQuickOptimize}
                  variant="secondary"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Optimal Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Automatically apply industry best practice settings that create a balanced funding strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
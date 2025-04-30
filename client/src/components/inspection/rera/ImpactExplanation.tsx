import React from "react";
import { ReserveFundSettings } from "./ReserveFundSettingsForm";
import { TrendingUp, TrendingDown, Shield, BarChart } from "lucide-react";

interface ImpactExplanationProps {
  settings: ReserveFundSettings;
  minimumAnnualContribution?: number;
}

export default function ImpactExplanation({ 
  settings,
  minimumAnnualContribution
}: ImpactExplanationProps) {
  // Calculate recommended contribution
  const recommendedContribution = minimumAnnualContribution 
    ? Math.round(minimumAnnualContribution * 1.15) 
    : 0;
  
  // Determine fund health impact
  const getFundHealthImpact = () => {
    // No minimum contribution data yet
    if (!minimumAnnualContribution) return 'unknown';
    
    // Compare annual contribution to recommended
    const currentContribution = settings.annualContribution || 0;
    
    if (currentContribution >= recommendedContribution * 1.3) {
      return 'excessive';
    } else if (currentContribution >= recommendedContribution) {
      return 'optimal';
    } else if (currentContribution >= minimumAnnualContribution) {
      return 'adequate';
    } else {
      return 'insufficient';
    }
  };
  
  // Determine owner burden impact
  const getOwnerBurdenImpact = () => {
    if (!minimumAnnualContribution) return 'unknown';
    
    const currentContribution = settings.annualContribution || 0;
    
    if (currentContribution >= recommendedContribution * 1.3) {
      return 'high';
    } else if (currentContribution >= recommendedContribution) {
      return 'balanced';
    } else if (currentContribution >= minimumAnnualContribution) {
      return 'moderate';
    } else {
      return 'low';
    }
  };
  
  // Determine risk level
  const getRiskLevel = () => {
    if (!minimumAnnualContribution) return 'unknown';
    
    const currentContribution = settings.annualContribution || 0;
    const interestRate = settings.interestRate * 100;
    
    // High risk if underfunded or using high interest assumptions
    if (currentContribution < minimumAnnualContribution || interestRate > 3) {
      return 'high';
    }
    
    // Low risk with conservative interest and above recommended contribution
    if (interestRate <= 2 && currentContribution >= recommendedContribution) {
      return 'low';
    }
    
    // Otherwise moderate risk
    return 'moderate';
  };
  
  const fundHealth = getFundHealthImpact();
  const ownerBurden = getOwnerBurdenImpact();
  const riskLevel = getRiskLevel();
  
  // Only show when we have minimum contribution data
  if (!minimumAnnualContribution) return null;
  
  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm font-medium flex items-center">
        <BarChart className="h-4 w-4 mr-1" />
        Current Fund Strategy Impact Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`border p-3 rounded-md ${fundHealth === 'optimal' ? 'bg-green-50 border-green-200' : 
                               fundHealth === 'excessive' ? 'bg-amber-50 border-amber-200' : 
                               'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className={`h-4 w-4 ${fundHealth === 'optimal' ? 'text-green-600' : 
                                           fundHealth === 'excessive' ? 'text-amber-600' : 
                                           'text-orange-600'}`} />
            <h4 className="text-xs font-medium">Long-term Fund Health</h4>
          </div>
          <p className="text-xs">
            {fundHealth === 'optimal' && "Your funding strategy maintains an optimal balance without excessive accumulation."}
            {fundHealth === 'excessive' && "Your funding strategy may lead to an excessive ending balance."}
            {fundHealth === 'adequate' && "Your funding meets minimum requirements but has limited safety margin."}
            {fundHealth === 'insufficient' && "Warning: Your funding strategy is insufficient to meet long-term needs."}
          </p>
        </div>
        
        <div className={`border p-3 rounded-md ${ownerBurden === 'balanced' ? 'bg-green-50 border-green-200' : 
                               ownerBurden === 'high' ? 'bg-amber-50 border-amber-200' : 
                               'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center space-x-2 mb-1">
            <TrendingDown className={`h-4 w-4 ${ownerBurden === 'balanced' ? 'text-green-600' : 
                                           ownerBurden === 'high' ? 'text-amber-600' : 
                                           'text-orange-600'}`} />
            <h4 className="text-xs font-medium">Owner Financial Burden</h4>
          </div>
          <p className="text-xs">
            {ownerBurden === 'balanced' && "Contributions are fairly balanced between current and future owners."}
            {ownerBurden === 'high' && "Current owners may be overpaying for future owners' benefit."}
            {ownerBurden === 'moderate' && "Contribution level is reasonable but may need future increases."}
            {ownerBurden === 'low' && "Current owners are underpaying, shifting burden to future owners."}
          </p>
        </div>
        
        <div className={`border p-3 rounded-md ${riskLevel === 'low' ? 'bg-green-50 border-green-200' : 
                               riskLevel === 'high' ? 'bg-amber-50 border-amber-200' : 
                               'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center space-x-2 mb-1">
            <Shield className={`h-4 w-4 ${riskLevel === 'low' ? 'text-green-600' : 
                                           riskLevel === 'high' ? 'text-amber-600' : 
                                           'text-orange-600'}`} />
            <h4 className="text-xs font-medium">Financial Risk Level</h4>
          </div>
          <p className="text-xs">
            {riskLevel === 'low' && "Low risk strategy with conservative assumptions and adequate funding."}
            {riskLevel === 'moderate' && "Moderate risk with some potential for funding shortfalls."}
            {riskLevel === 'high' && "High risk strategy that may require significant future adjustments."}
          </p>
        </div>
      </div>
    </div>
  );
}
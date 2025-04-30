import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  AlertCircle,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  ArrowUpDown 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SummaryTooltip from "./SummaryTooltip";
import ImportantNoticesWithRecommendations from "./ImportantNoticesWithRecommendations";
import ReserveFundSettingsForm, { ReserveFundSettings } from "./ReserveFundSettingsForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";

// Define format utility functions directly in the component
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};
// Mock the getAssetDefaultValues function as it's missing from the codebase
const getAssetDefaultValues = (nrmIdentifier: string, nrmGroup?: string) => {
  return {
    replacementCostPerUnit: 500,
    maintenanceCostPerUnit: 10,
    lifespan: 15,
    condition: 'C',
    priority: '3'
  };
};

/**
 * Interfaces
 */
interface ReserveFundAnalysisProps {
  projectId: number;
  classifications: any[];
  assessments: any[];
}

interface CapitalPlanEntry {
  year: number;
  amount: number;
  description: string;
  classificationId?: number;
  inflatedAmount?: number;
}

interface FundingStrategyResult {
  strategyType: 'flat' | 'escalating' | 'custom';
  annualContribution: number;
  escalationRate?: number;
  contributions: number[];
  cashflow: CashflowEntry[];
  warnings: string[];
}

interface CashflowEntry {
  year: number;
  beginBalance: number;
  contribution: number;
  interest: number;
  capitalCost: number;
  endBalance: number;
}

interface SummaryStatistics {
  totalReplacementCost: number;
  totalInflatedReplacementCost: number;
  shortTermNeeds: number;
  annualMaintenanceCost: number;
  annualContribution: number;
  minBalanceYear: number;
  minBalance: number;
}

/**
 * Helper functions
 */
function calculateRemainingServiceLife(lifeExpectancy: number, conditionRating: string): number {
  // Based on NRM3 condition assessment guidelines
  const conditionFactors: Record<string, number> = {
    'A': 0.95, // New or as new condition - 95% of life expectancy remaining
    'B': 0.75, // Good condition - 75% of life expectancy remaining
    'C': 0.5,  // Moderate condition - 50% of life expectancy remaining
    'D': 0.25, // Poor condition - 25% of life expectancy remaining
    'E': 0.1   // Very poor condition - 10% of life expectancy remaining
  };
  
  const factor = conditionFactors[conditionRating] || 0.5;
  return lifeExpectancy * factor;
}

function calculateReplacementYear(remainingLife: number, priorityRating: string): number {
  const currentYear = new Date().getFullYear();
  
  // Based on priority rating, adjust when replacement should happen
  const priorityAdjustment: Record<string, number> = {
    '1': 0,  // Immediate replacement (within a year)
    '2': 1,  // Near-term replacement (1-2 years)
    '3': 0,  // Standard replacement based on remaining life
    '4': 2,  // Can extend slightly beyond remaining life
    '5': 5   // Can defer beyond remaining life for less critical items
  };
  
  // If high priority (1 or 2), speed up replacement regardless of condition
  // If low priority (4 or 5), can delay beyond remaining life
  // If medium priority (3), use the calculated remaining life
  const adjustedRemainingLife = priorityRating === '3' 
    ? remainingLife 
    : Math.min(remainingLife, Math.max(0, remainingLife - priorityAdjustment[priorityRating]));
    
  return currentYear + Math.floor(adjustedRemainingLife);
}

/**
 * Main Component
 */
export default function ReserveFundAnalysis({ 
  projectId, 
  classifications,
  assessments
}: ReserveFundAnalysisProps) {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState("settings");
  const [settings, setSettings] = useState<ReserveFundSettings>({
    projectId,
    studyPeriod: 30,
    startBalance: 100000,
    interestRate: 0.02,
    inflationRate: 0.025,
    contributionStrategy: 'flat',
    escalationRate: 0.02
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fundingStrategy, setFundingStrategy] = useState<FundingStrategyResult | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStatistics | null>(null);
  
  const queryClient = useQueryClient();

  /**
   * Fetch existing settings
   */
  const { data: existingSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`);
        return response;
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // Settings don't exist yet, that's okay
          return null;
        } else {
          // Other errors should be thrown
          throw error;
        }
      }
    }
  });

  /**
   * Update settings when data is loaded
   */
  useEffect(() => {
    if (existingSettings) {
      setSettings({
        id: existingSettings.id,
        projectId,
        studyPeriod: existingSettings.studyPeriod || 30,
        startBalance: existingSettings.startBalance || 100000,
        interestRate: existingSettings.interestRate || 0.02,
        inflationRate: existingSettings.inflationRate || 0.025,
        contributionStrategy: existingSettings.contributionStrategy || 'flat',
        escalationRate: existingSettings.escalationRate || 0.02,
        annualContribution: existingSettings.annualContribution,
        currentContribution: existingSettings.currentContribution,
      });
    }
  }, [existingSettings, projectId]);

  /**
   * Generate capital plan from classifications and assessments
   */
  const capitalPlan = useMemo(() => {
    let plan: CapitalPlanEntry[] = [];
    
    // Create a map of assessments by classificationId for quick lookup
    const assessmentMap: Record<number, any> = {};
    if (assessments && assessments.length > 0) {
      assessments.forEach(assessment => {
        if (assessment.classificationId) {
          assessmentMap[assessment.classificationId] = assessment;
        }
      });
    }
    
    if (classifications && classifications.length > 0) {
      classifications.forEach(classification => {
        const assessment = assessmentMap[classification.id];
        
        // Skip assets without assessments if we have assessments for other assets
        if (!assessment && Object.keys(assessmentMap).length > 0) {
          return;
        }
        
        // Get default values based on asset type
        const nrmIdentifier = classification.nrmElement || classification.nrmSubGroup || '';
        const defaultValues = getAssetDefaultValues(nrmIdentifier, classification.nrmGroup);
        
        // Calculate replacement cost based on quantity and unit rate
        const quantity = parseFloat(classification.quantity || "1");
        const unitCost = parseFloat(classification.costPerUnit) || 
                        (defaultValues.replacementCostPerUnit || 500);
        const validQuantity = !isNaN(quantity) && quantity > 0 ? quantity : 1;
        const validUnitCost = !isNaN(unitCost) && unitCost > 0 ? unitCost : 500;
        const replacementCost = validQuantity * validUnitCost;
        
        // Calculate life expectancy based on default values or custom settings
        const lifeExpectancy = classification.lifeExpectancy || defaultValues.lifespan || 15;
        
        // For condition assessment, we need valid ratings
        const conditionRating = assessment ? assessment.conditionRating || 'C' : 'C';
        const priorityRating = assessment ? assessment.priorityRating || '3' : '3';
        
        // Calculate remaining life based on condition
        const remainingLife = calculateRemainingServiceLife(lifeExpectancy, conditionRating);
        
        // Determine replacement year based on priority rating
        const replacementAbsoluteYear = calculateReplacementYear(remainingLife, priorityRating);
        const yearsUntilReplacement = replacementAbsoluteYear - currentYear;
        const replacementYear = Math.max(0, Math.floor(yearsUntilReplacement));
        
        // Only add to capital plan if replacement is needed within study period
        if (replacementYear <= settings.studyPeriod) {
          plan.push({
            year: replacementYear,
            amount: replacementCost,
            description: classification.description || classification.nrmElement || 'Asset Replacement',
            classificationId: classification.id
          });
        }
        
        // Calculate recurring replacement cycles if component has multiple replacements in study period
        if (lifeExpectancy > 0 && lifeExpectancy < settings.studyPeriod) {
          let nextCycle = replacementYear + lifeExpectancy;
          while (nextCycle <= settings.studyPeriod) {
            plan.push({
              year: nextCycle,
              amount: replacementCost,
              description: `${classification.description || classification.nrmElement || 'Asset'} Replacement (Cycle)`,
              classificationId: classification.id
            });
            nextCycle += lifeExpectancy;
          }
        }
      });
    }
    
    // Apply inflation to all capital costs
    return plan.map(entry => ({
      ...entry,
      inflatedAmount: entry.amount * Math.pow(1 + settings.inflationRate, entry.year)
    }));
  }, [classifications, assessments, settings.studyPeriod, settings.inflationRate, currentYear]);

  /**
   * Total replacement cost for all assets
   */
  const { totalReplacementCost, totalInflatedReplacementCost } = useMemo(() => {
    let totalCost = 0;
    let totalInflatedCost = 0;
    
    capitalPlan.forEach(entry => {
      totalCost += entry.amount;
      totalInflatedCost += entry.inflatedAmount || entry.amount;
    });
    
    return { totalReplacementCost: totalCost, totalInflatedReplacementCost: totalInflatedCost };
  }, [capitalPlan]);

  /**
   * Capital costs grouped by year
   */
  const getCapitalCostsByYear = useCallback((years: number) => {
    const costsByYear: { [key: number]: number } = {};
    
    for (let i = 0; i <= years; i++) {
      costsByYear[i] = 0;
    }
    
    capitalPlan.forEach(entry => {
      if (entry.year <= years) {
        costsByYear[entry.year] += entry.inflatedAmount || entry.amount;
      }
    });
    
    return costsByYear;
  }, [capitalPlan]);

  /**
   * Short-term needs (costs in first 5 years)
   */
  const shortTermNeeds = useMemo(() => {
    let costs = 0;
    capitalPlan
      .filter(entry => entry.year <= 5)
      .forEach(entry => {
        costs += entry.inflatedAmount || entry.amount;
      });
    return costs;
  }, [capitalPlan]);

  /**
   * Annual maintenance cost
   */
  const annualMaintenanceCost = useMemo(() => {
    let total = 0;
    
    if (classifications && classifications.length > 0) {
      classifications.forEach(classification => {
        const nrmIdentifier = classification.nrmElement || classification.nrmSubGroup || '';
        const defaultValues = getAssetDefaultValues(nrmIdentifier, classification.nrmGroup);
        
        const quantity = parseFloat(classification.quantity || "1");
        // Calculate maintenance cost based on replacement cost if maintenanceCostPerUnit is not available
        const maintenanceCost = classification.annualMaintenanceCost || 
                              (defaultValues.replacementCostPerUnit ? defaultValues.replacementCostPerUnit * 0.02 : 10);
                              
        const validQuantity = !isNaN(quantity) && quantity > 0 ? quantity : 1;
        const validMaintenanceCost = !isNaN(maintenanceCost) ? maintenanceCost : 10;
        
        total += validQuantity * validMaintenanceCost;
      });
    }
    
    return total;
  }, [classifications]);

  /**
   * Simulate fund performance with contribution strategy
   */
  const simulateFundPerformance = useCallback((
    annualContribution: number,
    escalationRate: number = 0.02
  ): { 
    cashflow: CashflowEntry[], 
    minBalance: number,
    minBalanceYear: number,
    finalBalance: number,
    warnings: string[]
  } => {
    const cashflow: CashflowEntry[] = [];
    const warnings: string[] = [];
    const capitalCostsByYear = getCapitalCostsByYear(settings.studyPeriod);
    
    let currentBalance = settings.startBalance;
    let minBalance = currentBalance;
    let minBalanceYear = 0;
    
    // Check for immediate expense in year 0 when starting balance is very low
    const immediateExpense = capitalCostsByYear[0] || 0;
    let specialFirstYearContribution = 0;
    
    // If we have an immediate expense in year 0 and insufficient balance
    if (immediateExpense > 0 && currentBalance < immediateExpense) {
      // Calculate the special first year contribution needed to cover the expense
      specialFirstYearContribution = immediateExpense - currentBalance + 5000; // Add a buffer
      warnings.push(`Immediate expense detected (${formatCurrency(immediateExpense)}) with insufficient starting balance (${formatCurrency(currentBalance)}). An additional contribution of ${formatCurrency(specialFirstYearContribution)} is required in year 0.`);
    }
    
    for (let year = 0; year <= settings.studyPeriod; year++) {
      const beginBalance = currentBalance;
      
      // Determine contribution based on strategy
      let contribution = 0;
      
      // For year 0, apply special contribution if needed
      if (year === 0 && specialFirstYearContribution > 0) {
        contribution = specialFirstYearContribution;
      } else if (year > 0) { // Regular contributions start in year 1
        if (settings.contributionStrategy === 'custom') {
          // For custom strategy, this would need to be fetched from a user-defined schedule
          // For now, default to the annual contribution
          contribution = annualContribution;
        } else if (settings.contributionStrategy === 'escalating') {
          // Use the escalating contribution formula with provided escalation rate
          // Force escalation rate to be used even if passed as 0 (due to potential data inconsistency)
          const effectiveRate = escalationRate > 0 ? escalationRate : (settings.escalationRate || 0.02);
          console.log(`Year ${year}: Using escalation rate ${effectiveRate} to calculate contribution`);
          contribution = annualContribution * Math.pow(1 + effectiveRate, year - 1);
        } else {
          // Flat rate - same amount each year
          contribution = annualContribution;
        }
      }
      
      // Add contribution to balance
      currentBalance += contribution;
      
      // More realistic interest calculation - use average balance throughout the year
      const capitalCost = capitalCostsByYear[year] || 0;
      
      // Calculate average balance throughout the year assuming expenses occur mid-year
      const midYearBalance = currentBalance - (capitalCost / 2);
      const averageBalance = (currentBalance + Math.max(0, midYearBalance)) / 2;
      
      // Only apply interest on positive balances
      const interest = Math.max(0, averageBalance) * settings.interestRate;
      
      // Add interest
      currentBalance += interest;
      
      // Subtract capital expenses for the year
      currentBalance -= capitalCost;
      
      // Track minimum balance
      if (currentBalance < minBalance) {
        minBalance = currentBalance;
        minBalanceYear = year;
      }
      
      // Check for low or negative balance
      if (currentBalance < 0) {
        warnings.push(`Negative balance in year ${currentYear + year}: ${formatCurrency(currentBalance)}`);
      } else if (currentBalance < totalReplacementCost * 0.05) {
        warnings.push(`Critically low balance in year ${currentYear + year}: ${formatCurrency(currentBalance)}`);
      }
      
      // Check for unusually high expenses
      if (capitalCost > totalReplacementCost * 0.2) {
        warnings.push(`High capital cost in year ${currentYear + year}: ${formatCurrency(capitalCost)}`);
      }
      
      // Add to cashflow table
      cashflow.push({
        year: year,
        beginBalance: beginBalance,
        contribution: contribution,
        interest: interest,
        capitalCost: capitalCost,
        endBalance: currentBalance
      });
    }
    
    return {
      cashflow,
      minBalance,
      minBalanceYear,
      finalBalance: currentBalance,
      warnings
    };
  }, [settings.studyPeriod, settings.startBalance, settings.interestRate, settings.contributionStrategy, getCapitalCostsByYear, totalReplacementCost, currentYear]);

  /**
   * Find minimum annual contribution using binary search
   */
  const calculateMinimumContribution = useCallback((
    escalationRate: number = 0.02
  ): FundingStrategyResult => {
    // Calculate a reasonable initial upper bound
    const totalCapitalCosts = Object.values(getCapitalCostsByYear(settings.studyPeriod))
                                .reduce((sum, cost) => sum + cost, 0);
    const avgAnnualCost = totalCapitalCosts / Math.max(settings.studyPeriod, 1);
    const initialUpperBound = avgAnnualCost * 1.5; // Add safety margin
    
    let low = 1000; // Minimum reasonable annual contribution
    let high = Math.max(initialUpperBound, 1000000); // Maximum reasonable bound
    let mid = 0;
    let result;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops
    
    // Strategy-specific logic
    const strategyType = settings.contributionStrategy || 'flat';
    console.log('Using strategy type for calculation:', strategyType);
    
    // Determine if we're using escalation or not
    const useEscalation = strategyType === 'escalating';
    
    // Binary search to find minimum contribution
    while (low <= high && iterations < maxIterations) {
      mid = Math.floor((low + high) / 2);
      
      // For flat rate, pass 0 as escalation rate, for escalating use the provided rate
      const rateToUse = useEscalation ? escalationRate : 0;
      console.log(`Testing contribution: ${mid}, escalation: ${rateToUse}`);
      
      result = simulateFundPerformance(
        mid, 
        rateToUse
      );
      
      // If we found a minimum balance that's non-negative, try a lower contribution
      // Otherwise, try a higher contribution
      if (result.minBalance >= 0) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
      
      iterations++;
    }
    
    // Ensure we return a valid positive contribution that gives non-negative balance
    const finalAmount = low;
    console.log(`Final contribution amount: ${finalAmount}, strategy: ${strategyType}`);
    
    // Pass the correct escalation rate based on strategy type
    const finalRateToUse = useEscalation ? escalationRate : 0;
    const finalResult = simulateFundPerformance(finalAmount, finalRateToUse);
    
    // Generate yearly contributions
    const contributions: number[] = [];
    
    for (let year = 0; year <= settings.studyPeriod; year++) {
      if (year === 0) {
        // No regular contribution in year 0
        contributions.push(0);
      } else if (useEscalation) {
        // For escalating, increase by rate each year
        // Ensure we use a valid escalation rate
        const effectiveRate = escalationRate > 0 ? escalationRate : (settings.escalationRate || 0.02);
        console.log(`Contribution for year ${year} using rate ${effectiveRate}`);
        contributions.push(finalAmount * Math.pow(1 + effectiveRate, year - 1));
      } else {
        // Flat rate - same contribution every year
        contributions.push(finalAmount);
      }
    }
    
    // Ensure we use the correct escalation rate in the result
    const finalEscalationRate = useEscalation 
      ? (escalationRate > 0 ? escalationRate : (settings.escalationRate || 0.02)) 
      : 0;
      
    console.log(`Final escalation rate to be used: ${finalEscalationRate}`);
      
    return {
      strategyType: strategyType,
      annualContribution: finalAmount,
      escalationRate: finalEscalationRate,
      contributions: contributions,
      cashflow: finalResult.cashflow,
      warnings: finalResult.warnings
    };
  }, [settings.studyPeriod, settings.contributionStrategy, getCapitalCostsByYear, simulateFundPerformance]);

  /**
   * Update summary statistics
   */
  const updateSummaryStats = useCallback(() => {
    if (!fundingStrategy) return;
    
    // Find minimum balance and its year
    let minBalance = Infinity;
    let minBalanceYear = 0;
    
    fundingStrategy.cashflow.forEach(entry => {
      if (entry.endBalance < minBalance) {
        minBalance = entry.endBalance;
        minBalanceYear = entry.year;
      }
    });
    
    setSummaryStats({
      totalReplacementCost,
      totalInflatedReplacementCost,
      shortTermNeeds,
      annualMaintenanceCost,
      annualContribution: fundingStrategy.annualContribution,
      minBalanceYear,
      minBalance
    });
  }, [fundingStrategy, totalReplacementCost, totalInflatedReplacementCost, shortTermNeeds, annualMaintenanceCost]);

  /**
   * Handle calculation
   */
  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    
    try {
      // Calculate funding strategy based on settings
      console.log('Calculating with strategy:', settings.contributionStrategy);
      
      // Determine the escalation rate to use based on strategy
      const escalationRate = settings.contributionStrategy === 'escalating'
        ? (settings.escalationRate || 0.02)
        : 0;
        
      console.log('Using escalation rate for calculation:', escalationRate);
      
      // Pass the escalation rate to the calculation
      const result = calculateMinimumContribution(escalationRate);
      
      // Force the result to use the current strategy type from settings
      result.strategyType = settings.contributionStrategy;
      result.escalationRate = escalationRate; // Ensure escalation rate is stored
      
      console.log('Strategy result:', result);
      setFundingStrategy(result);
      
      toast({
        title: "Calculation complete",
        description: "Reserve fund analysis has been updated.",
      });
    } catch (error) {
      console.error("Error calculating reserve fund:", error);
      toast({
        title: "Calculation failed",
        description: "An error occurred while calculating the reserve fund analysis.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  }, [settings.contributionStrategy, settings.escalationRate, calculateMinimumContribution]);

  /**
   * Handle settings changes 
   */
  const handleSettingsChange = useCallback((newSettings: ReserveFundSettings) => {
    setSettings(newSettings);
  }, []);

  /**
   * Update summary when funding strategy changes
   */
  useEffect(() => {
    if (fundingStrategy) {
      updateSummaryStats();
    }
  }, [fundingStrategy, updateSummaryStats]);

  /**
   * Simulate performance with current contribution for comparison
   */
  const currentContributionPerformance = useMemo(() => {
    // Only calculate current contribution performance if a value is provided
    if (!settings.currentContribution || !fundingStrategy) return null;
    
    // Simulate performance with the current contribution instead of recommended
    const currentPerformance = simulateFundPerformance(
      settings.currentContribution,
      settings.contributionStrategy === 'escalating' ? (settings.escalationRate || 0.02) : 0
    );
    
    return currentPerformance;
  }, [settings.currentContribution, settings.contributionStrategy, settings.escalationRate, simulateFundPerformance, fundingStrategy]);

  /**
   * Format chart data
   */
  const chartData = useMemo(() => {
    if (!fundingStrategy) return [];
    
    // Log escalation information for debugging
    if (settings.contributionStrategy === 'escalating') {
      console.log('Escalating strategy detected');
      console.log('Escalation rate:', fundingStrategy.escalationRate);
      console.log('First few cashflow entries:', fundingStrategy.cashflow.slice(0, 5));
    }
    
    const data = fundingStrategy.cashflow.map(entry => {
      const baseData = {
        year: currentYear + entry.year,
        capitalCost: entry.capitalCost,
        balance: entry.endBalance,
        contribution: entry.contribution
      };
      
      // If we have current contribution performance, add it to the chart data
      if (currentContributionPerformance && settings.currentContribution) {
        const currentEntry = currentContributionPerformance.cashflow.find(e => e.year === entry.year);
        if (currentEntry) {
          return {
            ...baseData,
            currentBalance: currentEntry.endBalance
          };
        }
      }
      
      return baseData;
    });
    
    return data;
  }, [fundingStrategy, currentContributionPerformance, settings.currentContribution, currentYear]);

  /**
   * Export to PDF
   */
  const exportToPDF = async () => {
    if (!fundingStrategy) return;
    
    setIsExporting(true);
    try {
      const response = await apiRequest(`/api/rera/projects/${projectId}/reports/generate`, {
        method: "POST",
        body: {
          type: "reserve-fund",
          format: "pdf",
          data: {
            settings,
            fundingStrategy,
            capitalPlan,
            summaryStats,
            currentContributionPerformance,
            currentYear
          }
        }
      });
      
      // Download the file using response.fileUrl
      if (response.fileUrl) {
        window.open(response.fileUrl, '_blank');
      }
      
      toast({
        title: "PDF exported",
        description: "Reserve fund report has been exported to PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the reserve fund report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export to Excel
   */
  const exportToExcel = async () => {
    if (!fundingStrategy) return;
    
    setIsExporting(true);
    try {
      const response = await apiRequest(`/api/rera/projects/${projectId}/reports/generate`, {
        method: "POST",
        body: {
          type: "reserve-fund",
          format: "excel",
          data: {
            settings,
            fundingStrategy,
            capitalPlan,
            summaryStats,
            currentContributionPerformance,
            currentYear
          }
        }
      });
      
      // Download the file using response.fileUrl
      if (response.fileUrl) {
        window.open(response.fileUrl, '_blank');
      }
      
      toast({
        title: "Excel exported",
        description: "Reserve fund report has been exported to Excel.",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the reserve fund report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Skip if capital plan is empty or loading
  if (capitalPlan.length === 0 && (!classifications || classifications.length === 0)) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Missing asset data</AlertTitle>
        <AlertDescription>
          Please add assets to the project before running a reserve fund analysis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Fund Settings</TabsTrigger>
          <TabsTrigger value="assets">Asset Schedule</TabsTrigger>
          <TabsTrigger value="projections">Financial Projections</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow Details</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <ReserveFundSettingsForm 
            projectId={projectId}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onCalculate={handleCalculate}
            isCalculating={isCalculating}
            minimumAnnualContribution={fundingStrategy?.annualContribution}
          />

          {fundingStrategy && fundingStrategy.warnings.length > 0 && (
            <ImportantNoticesWithRecommendations
              warnings={fundingStrategy.warnings}
              onApplyRecommendation={(recommendation, index) => {
                // Apply changes based on recommendation action type
                switch(recommendation.type) {
                  case 'increase_contribution':
                    // Increase contribution by percentage
                    const increasePercent = Number(recommendation.value);
                    const newContrib = Math.round(fundingStrategy.annualContribution * (1 + increasePercent/100));
                    setSettings(prev => ({
                      ...prev,
                      annualContribution: newContrib
                    }));
                    break;
                    
                  case 'increase_escalation':
                    // Set escalation rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      contributionStrategy: 'escalating',
                      escalationRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'decrease_escalation':
                    // Set escalation rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      escalationRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'increase_inflation':
                    // Set inflation rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      inflationRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'decrease_inflation':
                    // Set inflation rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      inflationRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'increase_interest':
                    // Set interest rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      interestRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'decrease_interest':
                    // Set interest rate to specified percentage
                    setSettings(prev => ({
                      ...prev,
                      interestRate: Number(recommendation.value) / 100
                    }));
                    break;
                    
                  case 'custom':
                    // For custom actions that may affect multiple settings
                    if (recommendation.customAction?.includes('monthly')) {
                      // Monthly contributions logic could be implemented here
                      console.log('Monthly contributions selected');
                    } else {
                      // Default to escalating strategy for other custom actions
                      setSettings(prev => ({
                        ...prev,
                        contributionStrategy: 'escalating'
                      }));
                    }
                    break;
                }
                
                // Trigger recalculation with the new settings
                handleCalculate();
              }}
              currentSettings={{
                annualContribution: fundingStrategy.annualContribution,
                contributionIncreaseRate: String(settings.escalationRate || 0.02),
                inflationRate: String(settings.inflationRate),
                interestRate: String(settings.interestRate)
              }}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Capital Plan Summary</CardTitle>
              <CardDescription>
                Overview of the project's capital needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <SummaryTooltip
                    label="Total Asset Replacement Cost"
                    description="The total cost to replace all components at current prices (without inflation)"
                    calculation="Sum of the replacement costs of all components in the study"
                    importance="Provides a baseline for understanding the scale of all assets in the property"
                  >
                    <div className="text-sm font-medium">Total Asset Replacement Cost</div>
                  </SummaryTooltip>
                  <div className="text-2xl font-bold">{formatCurrency(totalReplacementCost)}</div>
                </div>
                <div className="space-y-1">
                  <SummaryTooltip
                    label="Total Inflated Replacement Cost"
                    description="The projected future cost of all replacements with inflation applied"
                    calculation={`Current costs increased by inflation (${formatPercentage(settings.inflationRate)}) over each component's remaining life`}
                    importance="Shows the actual amount that will need to be funded over the study period"
                  >
                    <div className="text-sm font-medium">Total Inflated Replacement Cost</div>
                  </SummaryTooltip>
                  <div className="text-2xl font-bold">{formatCurrency(totalInflatedReplacementCost)}</div>
                </div>
                <div className="space-y-1">
                  <SummaryTooltip
                    label="Short-Term Needs (5 Years)"
                    description="Funds required for replacements in the next 5 years"
                    calculation="Sum of inflated costs for all replacements scheduled in the first 5 years"
                    importance="Critical for immediate financial planning and cash flow management"
                  >
                    <div className="text-sm font-medium">Short-Term Needs (5 Years)</div>
                  </SummaryTooltip>
                  <div className="text-2xl font-bold">{formatCurrency(shortTermNeeds)}</div>
                </div>
                <div className="space-y-1">
                  <SummaryTooltip
                    label="Annual Maintenance Cost"
                    description="Estimated yearly expenses for routine maintenance"
                    calculation="Typically 1-3% of replacement cost for each component, summed across all components"
                    importance="These costs are separate from capital replacements and should be budgeted annually"
                  >
                    <div className="text-sm font-medium">Annual Maintenance Cost</div>
                  </SummaryTooltip>
                  <div className="text-2xl font-bold">{formatCurrency(annualMaintenanceCost)}</div>
                </div>
              </div>
              
              {fundingStrategy && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <SummaryTooltip
                        label="Minimum Annual Contribution"
                        description="The minimum contribution required to fund all capital expenses"
                        calculation="Calculated to maintain a non-negative balance throughout the study period"
                        importance="This is the key figure for budget planning - the amount needed each year"
                      >
                        <div className="text-sm font-medium">Minimum Annual Contribution</div>
                      </SummaryTooltip>
                      <div className="text-2xl font-bold text-primary">{formatCurrency(fundingStrategy.annualContribution)}</div>
                    </div>
                    
                    {settings.currentContribution && currentContributionPerformance && (
                      <div className="space-y-1">
                        <SummaryTooltip
                          label="Current Annual Contribution"
                          description="The amount currently being contributed"
                          calculation="This is the value you entered for comparison purposes"
                          importance="Comparing this to the minimum required contribution shows funding adequacy"
                        >
                          <div className="text-sm font-medium">Current Annual Contribution</div>
                        </SummaryTooltip>
                        <div className="text-2xl font-bold">{formatCurrency(settings.currentContribution)}</div>
                        
                        {currentContributionPerformance.minBalance < 0 ? (
                          <Alert variant="destructive" className="mt-2 py-2">
                            <AlertTitle className="text-xs">Warning: Underfunded</AlertTitle>
                            <AlertDescription className="text-xs">
                              Current contribution leads to a negative balance in year {currentYear + currentContributionPerformance.minBalanceYear}.
                            </AlertDescription>
                          </Alert>
                        ) : null}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <SummaryTooltip
                        label="Funding Strategy"
                        description="The approach used to determine contributions over time"
                        calculation={`${settings.contributionStrategy === 'flat' 
                          ? 'Equal contributions each year' 
                          : settings.contributionStrategy === 'escalating' 
                            ? `Contributions increase by ${formatPercentage(fundingStrategy.escalationRate || 0)} annually` 
                            : 'Custom contribution schedule'}`}
                        importance="Different strategies can help balance present vs future funding needs"
                      >
                        <div className="text-sm font-medium">Funding Strategy</div>
                      </SummaryTooltip>
                      <div className="text-xl font-medium">
                        {settings.contributionStrategy === 'flat' 
                          ? 'Flat Rate' 
                          : settings.contributionStrategy === 'escalating' 
                            ? `Escalating (${formatPercentage(fundingStrategy.escalationRate || 0)})` 
                            : 'Custom Schedule'}
                      </div>
                    </div>
                  </div>
                  
                  {settings.currentContribution && fundingStrategy.annualContribution > settings.currentContribution && (
                    <Alert className="mt-4">
                      <AlertTitle>Funding Gap</AlertTitle>
                      <AlertDescription>
                        Current contribution of {formatCurrency(settings.currentContribution)} is {formatCurrency(fundingStrategy.annualContribution - settings.currentContribution)} less than the recommended amount of {formatCurrency(fundingStrategy.annualContribution)}.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Capital Plan</CardTitle>
              <CardDescription>
                Replacements scheduled during the study period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Calendar Year</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Current Cost</TableHead>
                      <TableHead className="text-right">Inflated Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capitalPlan
                      .sort((a, b) => a.year - b.year)
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{currentYear + item.year}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.inflatedAmount || item.amount)}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections">
          {fundingStrategy ? (
            <div className="space-y-4">
              {/* Financial Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Projections</CardTitle>
                  <CardDescription>
                    Projected fund performance over the study period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Reserve Fund Balance Projection</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Year', position: 'insideBottom', offset: -5 }} 
                        />
                        <YAxis 
                          tickFormatter={(value) => `${new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
                          label={{ value: 'Balance (AED)', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value as number)}
                          labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Legend />
                        <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                        
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          name="Recommended Balance" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                        />
                        
                        {settings.currentContribution && (
                          <Area 
                            type="monotone" 
                            dataKey="currentBalance" 
                            name="Current Balance" 
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            fillOpacity={0.2}
                            strokeDasharray="5 5"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Annual Expenditures vs. Contributions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Year', position: 'insideBottom', offset: -5 }} 
                        />
                        <YAxis 
                          tickFormatter={(value) => `${new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
                          label={{ value: 'Amount (AED)', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value as number)}
                          labelFormatter={(label) => `Year: ${label}`}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border rounded p-2 shadow-md">
                                  <p className="font-medium">Year: {label}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} style={{ color: entry.color }}>
                                      {entry.name}: {formatCurrency(entry.value as number)}
                                    </p>
                                  ))}
                                  {settings.contributionStrategy === 'escalating' && 
                                   payload.find(entry => entry.dataKey === 'contribution') && fundingStrategy && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Includes {formatPercentage(fundingStrategy.escalationRate || settings.escalationRate || 0.02)} annual increase
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend formatter={(value) => {
                          if (value === 'Annual Contribution' && settings.contributionStrategy === 'escalating' && fundingStrategy) {
                            return `${value} (${formatPercentage(fundingStrategy.escalationRate || settings.escalationRate || 0.02)} Annual Increase)`;
                          }
                          return value;
                        }} />
                        <Bar dataKey="capitalCost" name="Capital Expenditures" fill="#f97316" />
                        
                        {/* For escalating strategy, show both bar and line for contribution */}
                        {settings.contributionStrategy === 'escalating' ? (
                          <>
                            <Bar dataKey="contribution" name="Annual Contribution" fill="#22c55e" fillOpacity={0.7} />
                            <Line 
                              type="monotone" 
                              dataKey="contribution" 
                              name="Contribution Trend" 
                              stroke="#22c55e" 
                              strokeWidth={2} 
                              dot={{ r: 3 }} 
                              activeDot={{ r: 5 }}
                            />
                          </>
                        ) : (
                          <Bar dataKey="contribution" name="Annual Contribution" fill="#22c55e" />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-md font-medium mb-2">Key Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Study Period:</span>
                          <span className="text-sm font-medium">{settings.studyPeriod} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Capital Costs:</span>
                          <span className="text-sm font-medium">{formatCurrency(totalInflatedReplacementCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Minimum Annual Contribution:</span>
                          <span className="text-sm font-medium">{formatCurrency(fundingStrategy.annualContribution)}</span>
                        </div>
                        {settings.contributionStrategy === 'escalating' && (
                          <div className="flex justify-between">
                            <span className="text-sm">Annual Increase Rate:</span>
                            <span className="text-sm font-medium">{formatPercentage(fundingStrategy.escalationRate || 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Fund Health Indicators</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Ending Fund Balance:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(fundingStrategy.cashflow[fundingStrategy.cashflow.length - 1].endBalance)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(100, Math.max(0, (fundingStrategy.cashflow[fundingStrategy.cashflow.length - 1].endBalance / totalInflatedReplacementCost) * 100))} 
                            className="h-2" 
                          />
                        </div>
                        
                        {summaryStats && summaryStats.minBalance < 0 ? (
                          <div className="text-sm text-red-500">
                            Warning: Fund depleted in year {currentYear + summaryStats.minBalanceYear}
                          </div>
                        ) : (
                          <div className="text-sm text-green-600">
                            Fund maintains positive balance throughout study period
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={exportToPDF}
                    disabled={isExporting}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={exportToExcel}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No projection data</AlertTitle>
              <AlertDescription>
                Please calculate the reserve fund to view financial projections.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Cashflow Tab */}
        <TabsContent value="cashflow">
          {fundingStrategy ? (
            <Card>
              <CardHeader>
                <CardTitle>Cashflow Details</CardTitle>
                <CardDescription>
                  Year-by-year cash flow analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Calendar Year</TableHead>
                        <TableHead className="text-right">Begin Balance</TableHead>
                        <TableHead className="text-right">Contribution</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Capital Cost</TableHead>
                        <TableHead className="text-right">End Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundingStrategy.cashflow.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.year}</TableCell>
                          <TableCell>{currentYear + entry.year}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.beginBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.contribution)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.interest)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.capitalCost)}</TableCell>
                          <TableCell 
                            className={`text-right font-medium ${entry.endBalance < 0 ? 'text-red-600' : ''}`}
                          >
                            {formatCurrency(entry.endBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No cashflow data</AlertTitle>
              <AlertDescription>
                Please calculate the reserve fund to view cashflow details.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
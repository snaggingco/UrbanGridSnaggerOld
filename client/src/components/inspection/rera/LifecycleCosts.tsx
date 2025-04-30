import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  Calendar,
  Check,
  Info as InfoIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Download,
  FileText,
  Filter,
  Loader2,
  PlusCircle,
  Save,
  Settings,
  SlidersHorizontal,
  Trash2,
  X,
  AlertCircle,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { 
  getAssetDefaultValues, 
  calculateRemainingServiceLife, 
  calculateReplacementYear,
  calculateAnnualMaintenance
} from "./nrm3DefaultValues";

interface LifecycleCostsProps {
  projectId: number;
  classifications: any[];
  assessments: any[];
  onSaveSettings?: (settings: any) => void;
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

interface ReserveFundSettings {
  id?: number;
  projectId: number;
  studyPeriod: number;
  startBalance: number;
  interestRate: number;
  inflationRate: number;
  contributionStrategy: 'flat' | 'escalating' | 'custom';
  escalationRate?: number;
  annualContribution?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper formatting functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number | undefined) => {
  if (value === undefined) return '0.00%';
  return (value * 100).toFixed(2) + '%';
};

const currentYear = new Date().getFullYear();

export default function LifecycleCosts({ 
  projectId, 
  classifications,
  assessments
}: LifecycleCostsProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedFundingStrategy, setSelectedFundingStrategy] = useState<'flat' | 'escalating' | 'custom'>('flat');
  const [customContributions, setCustomContributions] = useState<number[]>([]);

  // Reserve Fund Study settings
  const [settings, setSettings] = useState<ReserveFundSettings>({
    projectId,
    studyPeriod: 30,
    startBalance: 100000,
    interestRate: 0.02,
    inflationRate: 0.025,
    contributionStrategy: 'flat',
    escalationRate: 0.02,
  });

  // Strategy results
  const [flatStrategyResult, setFlatStrategyResult] = useState<FundingStrategyResult | null>(null);
  const [escalatingStrategyResult, setEscalatingStrategyResult] = useState<FundingStrategyResult | null>(null);
  const [customStrategyResult, setCustomStrategyResult] = useState<FundingStrategyResult | null>(null);
  
  // Active funding strategy
  const [activeFundingStrategy, setActiveFundingStrategy] = useState<FundingStrategyResult | null>(null);

  // Fetch existing settings
  const { data: existingSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`);
        return response && response.length > 0 ? response[0] : null;
      } catch (error) {
        console.error("Error fetching reserve fund settings:", error);
        return null;
      }
    }
  });
  
  // Update settings when data is loaded
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
      });
      
      setSelectedFundingStrategy(existingSettings.contributionStrategy || 'flat');
    }
  }, [existingSettings, projectId]);
  
  // Save or update settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: ReserveFundSettings) => {
      if (data.id) {
        // Update existing settings
        return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        try {
          // Try to create new settings
          return await apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch (error: any) {
          // If 409 Conflict error (settings already exist), get the existing settings ID and update
          console.log('HTTP Error response:', error);
          
          // The API can return errors in different formats
          if (error.status === 409) {
            // Try to extract the existing settings ID from different error formats
            let existingId;
            
            if (error.data && error.data.existingSettingsId) {
              // Format: { error: "...", existingSettingsId: 123 }
              existingId = error.data.existingSettingsId;
            } else if (error.data && typeof error.data === 'object') {
              // Format: { error: "..." }
              // We need to fetch the existing settings ID separately
              console.log("409 Conflict detected but no existingSettingsId provided");
              
              // Get all settings for this project
              const existingSettings = await apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`);
              if (existingSettings && existingSettings.id) {
                existingId = existingSettings.id;
              }
            }
            
            if (existingId) {
              console.log(`Settings already exist (ID: ${existingId}). Updating instead of creating.`);
              return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings/${existingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({...data, id: existingId}),
              });
            }
          }
          
          // If we can't handle the error or it's not a 409, rethrow it
          throw error;
        }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"] });
      
      toast({
        title: "Settings saved",
        description: "Reserve fund settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save reserve fund settings.",
        variant: "destructive",
      });
    }
  });

  // Generate capital plan from classifications and assessments
  // We'll regenerate this whenever assessments change
  const capitalPlan = useMemo(() => {
    console.log('LifecycleCosts - Regenerating capital plan due to changes in assessments/classifications');
    console.log('LifecycleCosts - Classifications:', classifications);
    console.log('LifecycleCosts - Assessments:', assessments);
    
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
    
    console.log('LifecycleCosts - Assessment Map:', assessmentMap);
    
    if (classifications && classifications.length > 0) {
      classifications.forEach(classification => {
        const assessment = assessmentMap[classification.id];
        
        // We'll now log the specific classification and assessment to debug
        console.log('LifecycleCosts - Processing classification:', classification);
        console.log('LifecycleCosts - Associated assessment:', assessment);
        
        // If there's no assessment for this classification, we'll create a default one
        // This helps generate a capital plan even when assessments are missing
        const useDefaultAssessment = !assessment;
        
        // Get default values based on asset type
        const nrmIdentifier = classification.nrmElement || classification.nrmSubGroup || '';
        console.log('LifecycleCosts - NRM identifier:', nrmIdentifier, 'Group:', classification.nrmGroup);
        
        const defaultValues = getAssetDefaultValues(nrmIdentifier, classification.nrmGroup);
        console.log('LifecycleCosts - Default values for asset:', defaultValues);
        
        // Calculate replacement cost based on quantity and unit rate
        const quantity = parseFloat(classification.quantity || "1");
        const unitCost = defaultValues.replacementCostPerUnit || 500; // Default to 500 AED if not specified
        // Make sure we have valid numbers for calculation
        const validQuantity = !isNaN(quantity) && quantity > 0 ? quantity : 1;
        const validUnitCost = unitCost || 500; // Default to 500 AED if not specified
        const replacementCost = validQuantity * validUnitCost;
        
        console.log('LifecycleCosts - Calculated replacement cost:', replacementCost, 
                   'Quantity:', quantity, 'Unit cost:', unitCost);
        
        // Calculate life expectancy based on default values
        const lifeExpectancy = defaultValues.lifespan;
        
        // For condition assessment, we need valid ratings
        const conditionRating = useDefaultAssessment ? 'C' : (assessment.conditionRating || 'C');
        const priorityRating = useDefaultAssessment ? '3' : (assessment.priorityRating || '3');
        
        console.log('LifecycleCosts - Condition:', conditionRating, 'Priority:', priorityRating);
        
        // Calculate remaining life - use default if assessment is missing
        const remainingLife = calculateRemainingServiceLife(lifeExpectancy, conditionRating);
        console.log('LifecycleCosts - Calculated remaining life:', remainingLife);
        
        // Adjust based on priority rating if it exists
        // Fix the calculation to get years until replacement rather than absolute year
        // Current year is already factored into calculateReplacementYear
        const replacementAbsoluteYear = calculateReplacementYear(remainingLife, priorityRating);
        console.log('LifecycleCosts - Calculated replacement absolute year:', replacementAbsoluteYear);
        
        // Calculate the years from now until replacement (e.g., 5 years from now)
        const currentYear = new Date().getFullYear();
        const yearsUntilReplacement = replacementAbsoluteYear - currentYear;
        console.log('LifecycleCosts - Years until replacement:', yearsUntilReplacement);
        
        // This is what we need for the capital plan - YEARS, not absolute years
        const replacementYear = Math.max(0, Math.floor(yearsUntilReplacement));
        
        // Only add to capital plan if replacement is needed within study period
        if (replacementYear <= settings.studyPeriod) {
          plan.push({
            year: replacementYear,
            amount: replacementCost,
            description: classification.description || 'Asset Replacement',
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
              description: `${classification.description || 'Asset'} Replacement (Cycle)`,
              classificationId: classification.id
            });
            nextCycle += lifeExpectancy;
          }
        }
      });
    }
    
    // Only create default entries if we truly have no classifications or assessments
    // This ensures the calculator always has something to work with, but prefers real data
    if (plan.length === 0 && 
        (!classifications || classifications.length === 0 || 
         !assessments || assessments.length === 0)) {
      console.log('LifecycleCosts - No valid capital plan entries, creating default entries');
      
      // Create some default entries for basic capital plan
      const defaultEntries = [
        { year: 5, amount: 50000, description: 'Default Capital Plan - Entry 1' },
        { year: 10, amount: 75000, description: 'Default Capital Plan - Entry 2' },
        { year: 15, amount: 100000, description: 'Default Capital Plan - Entry 3' },
        { year: 20, amount: 120000, description: 'Default Capital Plan - Entry 4' }
      ];
      
      // Only add entries within the study period
      plan = defaultEntries
        .filter(entry => entry.year <= settings.studyPeriod)
        .map(entry => ({
          year: entry.year,
          amount: entry.amount,
          description: entry.description
        }));
    }
    
    // Apply inflation to all capital costs
    return plan.map(entry => ({
      ...entry,
      inflatedAmount: entry.amount * Math.pow(1 + settings.inflationRate, entry.year)
    })).sort((a, b) => a.year - b.year);
  }, [classifications, assessments, settings.studyPeriod, settings.inflationRate]);
  
  // Calculate total replacement cost (today's dollars)
  const totalReplacementCost = useMemo(() => {
    return capitalPlan.reduce((sum, entry) => sum + entry.amount, 0);
  }, [capitalPlan]);
  
  // Calculate total inflated replacement cost
  const totalInflatedReplacementCost = useMemo(() => {
    return capitalPlan.reduce((sum, entry) => sum + (entry.inflatedAmount || 0), 0);
  }, [capitalPlan]);
  
  // Get the capital costs by year
  const getCapitalCostsByYear = (studyPeriod: number): number[] => {
    const costsByYear: number[] = Array(studyPeriod + 1).fill(0);
    
    capitalPlan.forEach(entry => {
      if (entry.year <= studyPeriod) {
        costsByYear[entry.year] += (entry.inflatedAmount || entry.amount);
      }
    });
    
    return costsByYear;
  };
  
  // Determine target end balance (for costs beyond study period)
  const targetEndBalance = useMemo(() => {
    // If all capital expenses are within the study period, target end balance can be 0
    // But we should maintain a minimum reserve of 10% of total replacement cost
    const minimumReserve = totalReplacementCost * 0.1;
    
    // Check if there are future expenses beyond study period
    const futureCosts = capitalPlan
      .filter(entry => entry.year > settings.studyPeriod)
      .reduce((sum, entry) => sum + (entry.inflatedAmount || entry.amount), 0);
    
    return Math.max(futureCosts, minimumReserve);
  }, [capitalPlan, settings.studyPeriod, totalReplacementCost]);

  // Simulate fund performance with contribution strategy
  const simulateFundPerformance = (
    annualContribution: number,
    strategyType: 'flat' | 'escalating' | 'custom' = 'flat',
    escalationRate: number = 0.02,
    customContributions: number[] = []
  ): { 
    cashflow: CashflowEntry[], 
    minBalance: number, 
    finalBalance: number,
    warnings: string[]
  } => {
    const cashflow: CashflowEntry[] = [];
    const warnings: string[] = [];
    const capitalCostsByYear = getCapitalCostsByYear(settings.studyPeriod);
    
    let currentBalance = settings.startBalance;
    let minBalance = currentBalance;
    let yearlyContribution = annualContribution;
    
    // Check for immediate expense in year 0 when starting balance is very low
    const immediateExpense = capitalCostsByYear[0] || 0;
    let specialFirstYearContribution = 0;
    
    // If we have an immediate expense in year 0 and insufficient balance
    if (immediateExpense > 0 && currentBalance < immediateExpense) {
      // Calculate the special first year contribution needed to cover the expense
      specialFirstYearContribution = immediateExpense - currentBalance + 1000; // Add a small buffer
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
        if (strategyType === 'flat') {
          contribution = yearlyContribution;
        } else if (strategyType === 'escalating') {
          contribution = yearlyContribution * Math.pow(1 + escalationRate, year - 1);
        } else if (strategyType === 'custom') {
          contribution = customContributions[year - 1] || yearlyContribution;
        }
      }
      
      // Add contribution to balance
      currentBalance += contribution;
      
      // More realistic interest calculation
      // First, calculate the capital cost
      const capitalCost = capitalCostsByYear[year] || 0;
      
      // Calculate average balance throughout the year assuming expenses occur mid-year
      // This creates a more realistic model than simply applying interest to beginning balance
      const averageBalance = (currentBalance + (currentBalance - capitalCost / 2)) / 2;
      
      // Only apply interest on positive balances
      const interest = Math.max(0, averageBalance) * settings.interestRate;
      
      // Add interest
      currentBalance += interest;
      
      // Subtract capital expenses for the year
      currentBalance -= capitalCost;
      
      // Track minimum balance
      if (currentBalance < minBalance) {
        minBalance = currentBalance;
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
      finalBalance: currentBalance,
      warnings
    };
  };
  
  // Find minimum annual contribution using binary search
  const calculateMinimumContribution = (
    strategyType: 'flat' | 'escalating' | 'custom' = 'flat',
    escalationRate: number = 0.02
  ): FundingStrategyResult => {
    // Calculate a more accurate initial upper bound
    // This is important so the binary search doesn't start with an unreasonably low value
    // We estimate the upper bound as the average annual cost plus a safety margin
    const avgAnnualCost = totalInflatedReplacementCost / Math.max(settings.studyPeriod, 1);
    const safetyFactor = 1.5; // Increase this for more conservative estimates
    
    // Use binary search to find minimum contribution
    let low = 0;
    let high = Math.max(avgAnnualCost * safetyFactor, totalInflatedReplacementCost / 5);
    let mid: number;
    const tolerance = 1; // AED
    
    let result;
    let iterationCount = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (high - low > tolerance && iterationCount < maxIterations) {
      iterationCount++;
      mid = (high + low) / 2;
      result = simulateFundPerformance(mid, strategyType, escalationRate);
      
      if (result.minBalance < 0 || result.finalBalance < targetEndBalance) {
        // Contribution too low - raise the lower bound
        low = mid;
        
        // If we're close to the upper bound and still not sufficient, expand search range
        if (high - low < tolerance * 10) {
          high = high * 1.5;
        }
      } else {
        // Contribution sufficient, try lower
        high = mid;
      }
    }
    
    // Final simulation with the found contribution amount
    // Add a small buffer to ensure we never go negative
    const buffer = 500; // Add 500 AED buffer for safety
    const finalAmount = Math.ceil(high) + buffer; // Round up to nearest AED
    const finalResult = simulateFundPerformance(finalAmount, strategyType, escalationRate);
    
    // Calculate yearly contributions for the full period
    const contributions: number[] = [];
    for (let year = 1; year <= settings.studyPeriod; year++) {
      if (strategyType === 'flat') {
        contributions.push(finalAmount);
      } else if (strategyType === 'escalating') {
        contributions.push(finalAmount * Math.pow(1 + escalationRate, year - 1));
      }
    }
    
    return {
      strategyType,
      annualContribution: finalAmount,
      escalationRate: strategyType === 'escalating' ? escalationRate : undefined,
      contributions,
      cashflow: finalResult.cashflow,
      warnings: finalResult.warnings
    };
  };
  
  // Calculate funding strategies
  const calculateFundingStrategies = () => {
    setIsCalculating(true);
    
    try {
      // Calculate flat contribution strategy
      const flatResult = calculateMinimumContribution('flat');
      setFlatStrategyResult(flatResult);
      
      // Calculate escalating contribution strategy
      const escalatingResult = calculateMinimumContribution('escalating', settings.escalationRate);
      setEscalatingStrategyResult(escalatingResult);
      
      // Set active strategy based on selected type
      if (selectedFundingStrategy === 'flat') {
        setActiveFundingStrategy(flatResult);
      } else if (selectedFundingStrategy === 'escalating') {
        setActiveFundingStrategy(escalatingResult);
      } else if (selectedFundingStrategy === 'custom' && customContributions.length > 0) {
        // For custom, just simulate with the provided contributions
        const customResult = simulateFundPerformance(
          customContributions[0] || flatResult.annualContribution,
          'custom',
          0,
          customContributions
        );
        
        const customStrategyResult: FundingStrategyResult = {
          strategyType: 'custom',
          annualContribution: customContributions[0] || flatResult.annualContribution,
          contributions: customContributions,
          cashflow: customResult.cashflow,
          warnings: customResult.warnings
        };
        
        setCustomStrategyResult(customStrategyResult);
        setActiveFundingStrategy(customStrategyResult);
      } else {
        // Default to flat if custom is selected but no custom contributions are set
        setActiveFundingStrategy(flatResult);
      }
      
      // Save the results to settings
      const updatedSettings = {
        ...settings,
        contributionStrategy: selectedFundingStrategy,
        annualContribution: selectedFundingStrategy === 'flat' 
          ? flatResult.annualContribution 
          : selectedFundingStrategy === 'escalating'
            ? escalatingResult.annualContribution
            : customContributions[0] || flatResult.annualContribution
      };
      
      setSettings(updatedSettings);
      
      // Auto-save settings if they already exist
      if (settings.id) {
        saveSettingsMutation.mutate(updatedSettings);
      }
      
      toast({
        title: "Calculation complete",
        description: "Reserve fund strategies have been calculated.",
      });
    } catch (error) {
      console.error("Error in calculation:", error);
      toast({
        title: "Calculation error",
        description: "An error occurred during calculation. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle saving settings
  const handleSaveSettings = async () => {
    console.log("Attempting to save settings:", settings);
    
    try {
      // First check if settings already exist
      const existingSettings = await apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`);
      
      if (existingSettings && existingSettings.id) {
        console.log("Existing settings found with ID:", existingSettings.id);
        
        // Update the settings id before saving
        const updatedSettings = {
          ...settings,
          id: existingSettings.id
        };
        
        console.log("Updating existing settings:", updatedSettings);
        saveSettingsMutation.mutate(updatedSettings);
      } else {
        console.log("No existing settings found, creating new");
        saveSettingsMutation.mutate(settings);
      }
    } catch (error) {
      console.error("Error checking existing settings:", error);
      // Try direct save anyway
      saveSettingsMutation.mutate(settings);
    }
  };
  
  // Debounce timer for recalculation
  const [recalculationTimer, setRecalculationTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: number;
    
    // Convert percentage to decimal for interest and inflation rates
    if (name === 'interestRate' || name === 'inflationRate' || name === 'escalationRate') {
      parsedValue = parseFloat(value) / 100;
    } else {
      parsedValue = parseInt(value, 10);
    }
    
    if (!isNaN(parsedValue)) {
      // Update settings with new value
      setSettings(prev => ({
        ...prev,
        [name]: parsedValue
      }));
      
      // Clear any existing timer
      if (recalculationTimer) {
        clearTimeout(recalculationTimer);
      }
      
      // Don't auto-recalculate on every change - wait for user to finish editing
      // Only set up the timer for the next recalculation if needed
      if (name === 'startBalance' || name === 'studyPeriod' || 
          name === 'interestRate' || name === 'inflationRate') {
        console.log(`Setting ${name} changed to ${parsedValue}. Will recalculate after user finishes editing.`);
        
        // Use a longer timeout to allow user to finish making changes
        const timer = setTimeout(() => {
          console.log("Recalculating after settings change");
          calculateFundingStrategies();
        }, 2000); // 2 seconds delay instead of 500ms
        
        setRecalculationTimer(timer);
      }
    }
  };
  
  // Handle strategy change
  const handleStrategyChange = (value: string) => {
    const strategy = value as 'flat' | 'escalating' | 'custom';
    setSelectedFundingStrategy(strategy);
    
    // Update active funding strategy based on selection
    if (strategy === 'flat' && flatStrategyResult) {
      setActiveFundingStrategy(flatStrategyResult);
    } else if (strategy === 'escalating' && escalatingStrategyResult) {
      setActiveFundingStrategy(escalatingStrategyResult);
    } else if (strategy === 'custom' && customStrategyResult) {
      setActiveFundingStrategy(customStrategyResult);
    }
    
    // Update settings
    setSettings(prev => ({
      ...prev,
      contributionStrategy: strategy
    }));
    
    // No automatic recalculation on strategy change - let the user initiate it
    console.log("Strategy changed to", strategy);
  };
  
  // Generate chart data for capital costs
  const capitalCostChartData = useMemo(() => {
    const data: { year: number; cost: number; inflatedCost: number }[] = [];
    
    for (let year = 0; year <= settings.studyPeriod; year++) {
      const yearCosts = capitalPlan.filter(entry => entry.year === year);
      const totalCost = yearCosts.reduce((sum, entry) => sum + entry.amount, 0);
      const totalInflatedCost = yearCosts.reduce((sum, entry) => sum + (entry.inflatedAmount || 0), 0);
      
      data.push({
        year: currentYear + year,
        cost: totalCost,
        inflatedCost: totalInflatedCost
      });
    }
    
    return data;
  }, [capitalPlan, settings.studyPeriod]);
  
  // Generate chart data for fund balance
  const fundBalanceChartData = useMemo(() => {
    if (!activeFundingStrategy) return [];
    
    return activeFundingStrategy.cashflow.map(entry => ({
      year: currentYear + entry.year,
      balance: entry.endBalance,
      contribution: entry.contribution,
      capitalCost: entry.capitalCost
    }));
  }, [activeFundingStrategy]);
  
  // Check if we have valid data to calculate funding strategies
  const hasValidData = useMemo(() => {
    console.log('LifecycleCosts - Checking if data is valid');
    console.log('LifecycleCosts - Capital Plan Length:', capitalPlan?.length || 0);
    
    if (!capitalPlan || capitalPlan.length === 0) {
      console.log('LifecycleCosts - No valid capital plan entries generated');
      
      // Extra debug info to find out why
      console.log('LifecycleCosts - Classifications count:', classifications?.length || 0);
      console.log('LifecycleCosts - Assessments count:', assessments?.length || 0);
      
      if (classifications?.length > 0 && assessments?.length > 0) {
        // We have both classifications and assessments, but no capital plan entries
        // This could be because no assessments match with classifications
        const assessmentIds = assessments.map((a: any) => a.classificationId);
        const classificationIds = classifications.map((c: any) => c.id);
        
        console.log('LifecycleCosts - Assessment classification IDs:', assessmentIds);
        console.log('LifecycleCosts - Classification IDs:', classificationIds);
        
        // Check if there are any matches
        const matches = assessmentIds.filter((id: any) => classificationIds.includes(id));
        console.log('LifecycleCosts - Matching IDs:', matches);
        
        // If there are matches but still no capital plan, the issue might be with
        // the replacement calculation logic
        if (matches.length > 0) {
          console.log('LifecycleCosts - There are matching assessments and classifications, but no capital plan entries');
          // Force return true to allow calculation even with empty plan
          return true;
        }
      }
      
      return false;
    }
    
    return true;
  }, [capitalPlan, classifications, assessments]);
  
  // Create year array for the full study period
  const yearArray = useMemo(() => {
    return Array.from({ length: settings.studyPeriod }, (_, i) => currentYear + i + 1);
  }, [settings.studyPeriod]);
  
  // Initialize custom contributions if needed
  useEffect(() => {
    if (yearArray.length > 0 && customContributions.length === 0) {
      // Initialize with flat contribution amount if available, otherwise a default
      const baseAmount = flatStrategyResult?.annualContribution || 5000;
      setCustomContributions(yearArray.map(() => baseAmount));
    }
  }, [yearArray, customContributions, flatStrategyResult]);
  
  // Recalculate when assessments change
  useEffect(() => {
    if (assessments && assessments.length > 0) {
      console.log('LifecycleCosts - Assessments changed, triggering recalculation');
      // Only recalculate if we have valid capital plan
      if (capitalPlan && capitalPlan.length > 0 && !isCalculating) {
        calculateFundingStrategies();
      }
    }
  }, [assessments]);

  // Update custom strategy when custom contributions change
  useEffect(() => {
    if (selectedFundingStrategy === 'custom' && customContributions.length > 0) {
      const customResult = simulateFundPerformance(
        customContributions[0] || 5000,
        'custom',
        0,
        customContributions
      );
      
      const customStrategyResult: FundingStrategyResult = {
        strategyType: 'custom',
        annualContribution: customContributions[0] || 5000,
        contributions: customContributions,
        cashflow: customResult.cashflow,
        warnings: customResult.warnings
      };
      
      setCustomStrategyResult(customStrategyResult);
      setActiveFundingStrategy(customStrategyResult);
    }
  }, [customContributions, selectedFundingStrategy]);
  
  // Handle custom contribution change
  const handleCustomContributionChange = (year: number, value: string) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      const newContributions = [...customContributions];
      newContributions[year] = parsedValue;
      setCustomContributions(newContributions);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Reserve Fund Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Calculate funding requirements for long-term capital expenditures
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvancedSettings ? "Hide" : "Show"} Advanced Settings
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
          >
            {saveSettingsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isLoadingSettings ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading settings...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <span>Total Replacement Value</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The sum of all asset replacement costs in today's money (without inflation). Represents all capital expenditures needed over the study period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalReplacementCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current-dollar capital expenses over {settings.studyPeriod} years
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <span>Inflated Replacement Value</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The sum of all asset replacement costs adjusted for future inflation. This represents the actual expected costs in future years when replacements occur.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalInflatedReplacementCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Future-dollar capital expenses with {formatPercentage(settings.inflationRate)} inflation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <span>Required Annual Contribution</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The minimum annual contribution required to maintain adequate reserve funds for all planned capital expenditures over the study period. Calculated to ensure the reserve fund never falls below zero.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeFundingStrategy ? 
                    formatCurrency(activeFundingStrategy.annualContribution) : 
                    "Not calculated"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFundingStrategy === 'flat' ? 'Fixed annual contribution' : 
                   selectedFundingStrategy === 'escalating' ? `Starting contribution (${settings.escalationRate ? formatPercentage(settings.escalationRate) : '2.00%'} annual increase)` :
                   'Custom contribution schedule'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <span>Target Fund Balance</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The minimum reserve fund balance that should be maintained at the end of the study period. This ensures there are sufficient funds for future replacements beyond the study period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(targetEndBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required balance at end of study period
                </p>
              </CardContent>
            </Card>
          </div>
          
          {showAdvancedSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure the reserve fund analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studyPeriod">Study Period (Years)</Label>
                    <Input
                      id="studyPeriod"
                      name="studyPeriod"
                      type="number"
                      value={settings.studyPeriod}
                      onChange={handleInputChange}
                      min={5}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of years to analyze (e.g., 30)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startBalance">Initial Balance (AED)</Label>
                    <Input
                      id="startBalance"
                      name="startBalance"
                      type="number"
                      value={settings.startBalance}
                      onChange={handleInputChange}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current balance in the reserve fund
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      name="interestRate"
                      type="number"
                      value={(settings.interestRate * 100).toFixed(2)}
                      onChange={handleInputChange}
                      min={0}
                      max={20}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Expected annual interest rate (e.g., 2%)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Annual Inflation Rate (%)</Label>
                    <Input
                      id="inflationRate"
                      name="inflationRate"
                      type="number"
                      value={(settings.inflationRate * 100).toFixed(2)}
                      onChange={handleInputChange}
                      min={0}
                      max={20}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Expected annual inflation rate (e.g., 2.5%)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contributionStrategy">Contribution Strategy</Label>
                    <Select 
                      value={selectedFundingStrategy} 
                      onValueChange={handleStrategyChange}
                    >
                      <SelectTrigger id="contributionStrategy">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Contribution</SelectItem>
                        <SelectItem value="escalating">Escalating Contribution</SelectItem>
                        <SelectItem value="custom">Custom Contribution</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How contributions will change over time
                    </p>
                  </div>
                  
                  {selectedFundingStrategy === 'escalating' && (
                    <div className="space-y-2">
                      <Label htmlFor="escalationRate">Annual Escalation Rate (%)</Label>
                      <Input
                        id="escalationRate"
                        name="escalationRate"
                        type="number"
                        value={(settings.escalationRate || 0.02) * 100}
                        onChange={handleInputChange}
                        min={0}
                        max={20}
                        step={0.1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Yearly increase in contribution amount (e.g., 2%)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {false && !hasValidData ? ( /* Temporarily disable this check */
            <Alert>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Missing capital cost data</AlertTitle>
              <AlertDescription>
                You need to add NRM3 classifications and assess their condition ratings before you can run the reserve fund analysis.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="overview">Capital Plan Overview</TabsTrigger>
                  <TabsTrigger value="strategies">Funding Strategies</TabsTrigger>
                  <TabsTrigger value="cashflow">Cashflow Projection</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Capital Expenditure Plan</CardTitle>
                      <CardDescription>
                        Projected capital expenses over the study period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={capitalCostChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="year" 
                              angle={-45} 
                              textAnchor="end"
                              tick={{ fontSize: 12 }}
                              interval={Math.ceil(settings.studyPeriod / 15)}
                            />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value).replace('AED', '')}
                            />
                            <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar name="Current Cost" dataKey="cost" fill="#8884d8" />
                            <Bar name="Inflated Cost" dataKey="inflatedCost" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Capital Plan Details</CardTitle>
                      <CardDescription>
                        Scheduled capital expenses by year and asset
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead>Asset</TableHead>
                              <TableHead>Current Cost</TableHead>
                              <TableHead>Inflated Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {capitalPlan.map((entry, index) => (
                              <TableRow key={index}>
                                <TableCell>{currentYear + entry.year}</TableCell>
                                <TableCell>{entry.description}</TableCell>
                                <TableCell>{formatCurrency(entry.amount)}</TableCell>
                                <TableCell>{formatCurrency(entry.inflatedAmount || 0)}</TableCell>
                              </TableRow>
                            ))}
                            {capitalPlan.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                  No capital expenses scheduled
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button 
                        onClick={calculateFundingStrategies}
                        disabled={isCalculating}
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Funding Strategies
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="strategies" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Strategy Comparison</CardTitle>
                      <CardDescription>
                        Analyze and compare different contribution approaches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Strategy Selection */}
                        <div className="grid grid-cols-3 gap-4">
                          <Card className={`relative cursor-pointer ${selectedFundingStrategy === 'flat' ? 'border-primary' : ''}`}
                            onClick={() => handleStrategyChange('flat')}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Flat Contribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-lg font-semibold">
                                {flatStrategyResult ? formatCurrency(flatStrategyResult.annualContribution) : 'Not calculated'}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Same amount every year
                              </p>
                            </CardContent>
                            {selectedFundingStrategy === 'flat' && (
                              <Badge className="absolute top-2 right-2 bg-primary">Selected</Badge>
                            )}
                          </Card>
                          
                          <Card className={`relative cursor-pointer ${selectedFundingStrategy === 'escalating' ? 'border-primary' : ''}`}
                            onClick={() => handleStrategyChange('escalating')}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Escalating Contribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-lg font-semibold">
                                {escalatingStrategyResult 
                                  ? `${formatCurrency(escalatingStrategyResult.annualContribution)} + ${formatPercentage(settings.escalationRate || 0.02)}/yr`
                                  : 'Not calculated'}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Increases annually with inflation
                              </p>
                            </CardContent>
                            {selectedFundingStrategy === 'escalating' && (
                              <Badge className="absolute top-2 right-2 bg-primary">Selected</Badge>
                            )}
                          </Card>
                          
                          <Card className={`relative cursor-pointer ${selectedFundingStrategy === 'custom' ? 'border-primary' : ''}`}
                            onClick={() => handleStrategyChange('custom')}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Custom Contribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-lg font-semibold">
                                {customStrategyResult 
                                  ? `${formatCurrency(customContributions[0] || 0)} (Year 1)`
                                  : 'Not set'}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Customize year by year
                              </p>
                            </CardContent>
                            {selectedFundingStrategy === 'custom' && (
                              <Badge className="absolute top-2 right-2 bg-primary">Selected</Badge>
                            )}
                          </Card>
                        </div>
                        
                        {/* Selected Strategy Details */}
                        {activeFundingStrategy && (
                          <div className="space-y-4">
                            <h4 className="text-md font-medium">Contribution Schedule</h4>
                            
                            {selectedFundingStrategy === 'custom' ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {yearArray.map((year, index) => (
                                  <div key={index} className="space-y-1">
                                    <Label htmlFor={`year-${year}`} className="text-xs">
                                      {year}
                                    </Label>
                                    <Input
                                      id={`year-${year}`}
                                      type="number"
                                      value={customContributions[index] || ''}
                                      onChange={(e) => handleCustomContributionChange(index, e.target.value)}
                                      className="text-xs h-8"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={activeFundingStrategy.cashflow.filter(entry => entry.year > 0).map(entry => ({
                                      year: currentYear + entry.year,
                                      contribution: entry.contribution
                                    }))}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="year" 
                                      angle={-45} 
                                      textAnchor="end"
                                      tick={{ fontSize: 12 }}
                                      interval={Math.ceil(settings.studyPeriod / 15)}
                                    />
                                    <YAxis 
                                      tickFormatter={(value) => formatCurrency(value).replace('AED', '')}
                                    />
                                    <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Line
                                      type="monotone"
                                      name="Annual Contribution"
                                      dataKey="contribution"
                                      stroke="#8884d8"
                                      strokeWidth={2}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            
                            {/* Warnings */}
                            {activeFundingStrategy.warnings.length > 0 && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                  <ul className="list-disc list-inside">
                                    {activeFundingStrategy.warnings.map((warning, index) => (
                                      <li key={index}>{warning}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button 
                        onClick={calculateFundingStrategies}
                        disabled={isCalculating}
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Recalculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Recalculate Strategies
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="cashflow" className="space-y-4 pt-4">
                  {activeFundingStrategy ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Fund Balance Projection</CardTitle>
                          <CardDescription>
                            Projected reserve fund balance over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={fundBalanceChartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="year" 
                                  angle={-45} 
                                  textAnchor="end"
                                  tick={{ fontSize: 12 }}
                                  interval={Math.ceil(settings.studyPeriod / 15)}
                                />
                                <YAxis 
                                  yAxisId="left"
                                  tickFormatter={(value) => formatCurrency(value).replace('AED', '')}
                                />
                                <YAxis 
                                  yAxisId="right"
                                  orientation="right"
                                  tickFormatter={(value) => formatCurrency(value).replace('AED', '')}
                                />
                                <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                                <Bar 
                                  yAxisId="right"
                                  name="Capital Expense" 
                                  dataKey="capitalCost" 
                                  fill="#ff8042" 
                                />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  name="Fund Balance"
                                  dataKey="balance"
                                  stroke="#8884d8"
                                  strokeWidth={2}
                                />
                                <ReferenceLine
                                  y={0}
                                  stroke="red"
                                  yAxisId="left"
                                  strokeWidth={2}
                                  strokeDasharray="3 3"
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Reserve Fund Cashflow Projection</CardTitle>
                          <CardDescription>
                            Year-by-year breakdown of the reserve fund performance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Year</TableHead>
                                  <TableHead>Begin Balance</TableHead>
                                  <TableHead>Contribution</TableHead>
                                  <TableHead>Interest Earned</TableHead>
                                  <TableHead>Capital Expense</TableHead>
                                  <TableHead>End Balance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeFundingStrategy.cashflow.map((entry, index) => (
                                  <TableRow key={index} className={entry.endBalance < 0 ? 'bg-red-100 dark:bg-red-900/20' : ''}>
                                    <TableCell>{currentYear + entry.year}</TableCell>
                                    <TableCell>{formatCurrency(entry.beginBalance)}</TableCell>
                                    <TableCell>{formatCurrency(entry.contribution)}</TableCell>
                                    <TableCell>{formatCurrency(entry.interest)}</TableCell>
                                    <TableCell>
                                      {entry.capitalCost > 0 ? (
                                        <span className="text-destructive font-medium">-{formatCurrency(entry.capitalCost)}</span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className={`font-medium ${entry.endBalance < 0 ? 'text-destructive font-bold' : ''}`}>
                                      {entry.endBalance < 0 ? `(${formatCurrency(Math.abs(entry.endBalance))})` : formatCurrency(entry.endBalance)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4 mr-2" />
                      <AlertTitle>No cashflow data available</AlertTitle>
                      <AlertDescription>
                        Calculate funding strategies first to view cashflow projections.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
}
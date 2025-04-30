import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  AlertCircle,
  Calculator, 
  Loader2, 
  Settings,
  Download,
  InfoIcon,
  RefreshCw,
  Save,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  getAssetDefaultValues, 
  calculateRemainingServiceLife, 
  calculateReplacementYear,
  calculateAnnualMaintenance
} from "./nrm3DefaultValues";

interface ReserveFundCalculatorProps {
  projectId: number;
  classifications: any[];
  assessments: any[];
  onSaveSettings: (settings: any) => void;
}

interface CashflowEntry {
  year: number;
  beginBalance: number;
  contribution: number;
  interest: number;
  expense: number;
  endBalance: number;
}

interface ReserveFundSettings {
  id?: number;
  projectId: number;
  studyPeriod: number;
  startBalance: number;
  interestRate: number;
  inflationRate: number;
  annualContribution?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Helper to format percentage
const formatPercentage = (value: number) => {
  return (value * 100).toFixed(2) + '%';
};

export default function ReserveFundCalculator({ 
  projectId, 
  classifications,
  assessments,
  onSaveSettings
}: ReserveFundCalculatorProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReserveFundSettings>({
    projectId,
    studyPeriod: 30,
    startBalance: 100000,
    interestRate: 0.02,
    inflationRate: 0.03,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [annualContribution, setAnnualContribution] = useState<number | null>(null);
  const [cashflowTable, setCashflowTable] = useState<CashflowEntry[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
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
        inflationRate: existingSettings.inflationRate || 0.03,
      });
      
      if (existingSettings.annualContribution) {
        setAnnualContribution(existingSettings.annualContribution);
      }
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
        // Create new settings
        return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"] });
      
      if (onSaveSettings) {
        onSaveSettings(data);
      }
      
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

  // Prepare capital plan from classifications and assessments data
  const capitalPlan = useMemo(() => {
    if (!classifications || classifications.length === 0 || !assessments || assessments.length === 0) return {};
    
    const plan: Record<number, number> = {};
    const currentYear = new Date().getFullYear();
    
    // Create a map of assessments by classificationId for quick lookup
    const assessmentMap: Record<number, any> = {};
    assessments.forEach(assessment => {
      if (assessment.classificationId) {
        assessmentMap[assessment.classificationId] = assessment;
      }
    });
    
    classifications.forEach(classification => {
      const assessment = assessmentMap[classification.id];
      
      // Skip if no assessment exists for this classification
      if (!assessment) return;
      
      // Get default values based on asset type
      const defaultValues = getAssetDefaultValues(
        classification.nrmElement || classification.nrmSubGroup || '', 
        classification.nrmGroup
      );
      
      // Calculate replacement cost based on quantity and unit rate
      const quantity = parseFloat(classification.quantity || "1");
      const unitCost = defaultValues.replacementCostPerUnit || 500; // Default to 500 AED if not specified
      const replacementCost = !isNaN(quantity) ? quantity * unitCost : unitCost;
      
      // Calculate life expectancy based on default values
      const lifeExpectancy = defaultValues.lifespan;
      let remainingLife = lifeExpectancy;
      
      // Calculate remaining life based on condition rating
      remainingLife = calculateRemainingServiceLife(lifeExpectancy, assessment.conditionRating);
      
      // Adjust further based on priority rating if it exists
      remainingLife = calculateReplacementYear(remainingLife, assessment.priorityRating);
      
      // Calculate the replacement year
      const replacementYear = Math.max(0, Math.floor(remainingLife));
      
      // Add to the capital plan if within study period
      if (replacementYear <= settings.studyPeriod) {
        plan[replacementYear] = (plan[replacementYear] || 0) + replacementCost;
      }
    });
    
    return plan;
  }, [classifications, assessments, settings.studyPeriod]);
  
  // Simulate fund performance for a given annual contribution
  const simulateFund = (annualContribution: number): { cashflow: CashflowEntry[], minBalance: number, finalBalance: number } => {
    const cashflow: CashflowEntry[] = [];
    let currentBalance = settings.startBalance;
    let minBalance = currentBalance;
    let yearlyContribution = annualContribution;
    
    for (let year = 0; year <= settings.studyPeriod; year++) {
      const beginBalance = currentBalance;
      
      // Add contribution (except for year 0, which is just the starting point)
      const contribution = year === 0 ? 0 : yearlyContribution;
      currentBalance += contribution;
      
      // Calculate expenses for this year
      const expense = year === 0 ? 0 : (capitalPlan[year] || 0);
      
      // Calculate interest (based on average balance through the year)
      // This is more realistic than calculating interest on beginning balance
      const averageBalance = (beginBalance + contribution + (currentBalance - expense)) / 2;
      const interest = Math.max(0, averageBalance * settings.interestRate);
      currentBalance += interest;
      
      // Subtract expenses
      currentBalance -= expense;
      
      // Add a safety check to prevent negative balances
      if (currentBalance < 0) {
        console.warn(`Negative balance detected in year ${year}: ${currentBalance}. This indicates insufficient funding.`);
      }
      
      // Track minimum balance
      if (currentBalance < minBalance) {
        minBalance = currentBalance;
      }
      
      // Add to cashflow table
      cashflow.push({
        year: year,
        beginBalance: beginBalance,
        contribution: contribution,
        interest: interest,
        expense: expense,
        endBalance: currentBalance
      });
      
      // Increase annual contribution with inflation (for next year)
      yearlyContribution *= (1 + settings.inflationRate);
    }
    
    return {
      cashflow,
      minBalance,
      finalBalance: currentBalance
    };
  };
  
  // Find minimum annual contribution using binary search
  const calculateMinimumContribution = () => {
    setIsCalculating(true);
    
    // The starting balance significantly impacts the required annual contribution
    console.log("Calculating minimum contribution with balance:", settings.startBalance);
    
    // Use binary search to find minimum contribution
    // For lower starting balances, we may need a higher upper bound
    const upperBoundMultiplier = settings.startBalance <= 50000 ? 3 : 1;
    let low = 0;
    let high = 10000000 * upperBoundMultiplier; // Initial upper bound (adjusted by starting balance)
    let mid;
    const tolerance = 1; // AED precision
    
    let result;
    let iterations = 0;
    const maxIterations = 100; // Safety limit
    
    try {
      while (high - low > tolerance && iterations < maxIterations) {
        iterations++;
        mid = (high + low) / 2;
        result = simulateFund(mid);
        
        console.log(`Iteration ${iterations}: Testing contribution ${mid.toFixed(2)}, min balance: ${result.minBalance.toFixed(2)}`);
        
        if (result.minBalance < 0) {
          // Contribution too low - need more funding
          low = mid;
        } else {
          // Contribution sufficient, try lower
          high = mid;
        }
      }
      
      if (iterations >= maxIterations) {
        console.warn("Maximum iterations reached in binary search!");
      }
      
      // Final simulation with the found contribution amount
      let finalAmount = high; // Use high to ensure requirements are met
      let finalResult = simulateFund(finalAmount);
      
      // Ensure we're not getting a negative balance at any point
      if (finalResult.minBalance < 0) {
        console.warn("Warning: Final solution may still result in negative balance:", finalResult.minBalance);
        // Add a small buffer to the contribution if we're still seeing negative balances
        const buffer = Math.abs(finalResult.minBalance) / settings.studyPeriod * 1.1; // Add 10% buffer
        finalAmount += buffer;
        console.log(`Adding buffer of ${buffer.toFixed(2)} to contribution, new amount: ${finalAmount.toFixed(2)}`);
        
        // Re-run simulation with the buffered amount
        finalResult = simulateFund(finalAmount);
      }
      
      console.log("Final annual contribution:", finalAmount.toFixed(2));
      
      setAnnualContribution(Math.ceil(finalAmount)); // Round up to nearest AED
      setCashflowTable(finalResult.cashflow);
      
      // Save the calculated contribution to settings
      const updatedSettings = {
        ...settings,
        annualContribution: Math.ceil(finalAmount)
      };
      setSettings(updatedSettings);
      
      // Auto-save settings if they already exist
      if (settings.id) {
        saveSettingsMutation.mutate(updatedSettings);
      }
      
      toast({
        title: "Calculation complete",
        description: "Minimum annual contribution has been calculated.",
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
  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: number;
    
    // Convert percentage to decimal for interest and inflation rates
    if (name === 'interestRate' || name === 'inflationRate') {
      parsedValue = parseFloat(value) / 100;
    } else {
      parsedValue = parseInt(value, 10);
    }
    
    if (!isNaN(parsedValue)) {
      setSettings(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    }
  };
  
  // Check if we have valid assessment data to calculate replacements
  const hasValidReplacementData = useMemo(() => {
    // We need classifications with quantity data and corresponding assessments
    // with condition ratings to generate a valid capital plan
    return (
      classifications && 
      classifications.length > 0 && 
      assessments && 
      assessments.length > 0 &&
      assessments.some(assessment => 
        assessment.conditionRating && 
        assessment.classificationId)
    );
  }, [classifications, assessments]);
  
  // Get total replacement cost for the plan
  const totalReplacementCost = useMemo(() => {
    return Object.values(capitalPlan).reduce((sum, cost) => sum + cost, 0);
  }, [capitalPlan]);
  
  // Get highest annual expense for scaling charts
  const highestAnnualExpense = useMemo(() => {
    return Math.max(...Object.values(capitalPlan), 0);
  }, [capitalPlan]);
  
  // Get count of years with expenses
  const yearsWithExpenses = useMemo(() => {
    return Object.keys(capitalPlan).length;
  }, [capitalPlan]);
  
  // Create an array of years for the chart
  const yearLabels = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: settings.studyPeriod + 1 }, (_, i) => currentYear + i);
  }, [settings.studyPeriod]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Reserve Fund Calculator</h3>
          <p className="text-sm text-muted-foreground">
            Calculate minimum annual contribution required for your reserve fund
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
                <CardTitle className="text-sm font-medium">Total Replacement Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalReplacementCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total capital expenses over {settings.studyPeriod} years
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Required Annual Contribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {annualContribution !== null 
                    ? formatCurrency(annualContribution) 
                    : "Not calculated"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum required yearly contribution
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expenditure Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{yearsWithExpenses} years</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Years with scheduled replacement costs
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Interest Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(settings.interestRate)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Annual real interest rate on the fund
                </p>
              </CardContent>
            </Card>
          </div>
          
          {showAdvancedSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure the reserve fund calculation parameters
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
                      min={1}
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
                      Expected annual real interest rate (e.g., 2%)
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
                      Expected annual inflation rate (e.g., 3%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!hasValidReplacementData ? (
            <Alert>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Missing assessment data</AlertTitle>
              <AlertDescription>
                You need to add NRM3 classifications and assess their condition ratings before you can run the reserve fund calculation.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Capital Expenditure Plan</CardTitle>
                  <CardDescription>
                    Projected capital expenses over the study period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px] pt-4">
                    <div className="flex justify-between items-end h-[250px] relative">
                      {/* Y-axis label */}
                      <div className="absolute -left-8 top-1/2 -rotate-90 text-xs text-muted-foreground">
                        Capital Cost (AED)
                      </div>
                      
                      {/* Bars */}
                      {yearLabels.map((year, index) => {
                        const yearOffset = index;
                        const expense = capitalPlan[yearOffset] || 0;
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              style={{ 
                                height: expense > 0 
                                  ? `${Math.max(5, (expense / highestAnnualExpense) * 230)}px` 
                                  : '1px' 
                              }}
                              className={`w-5 bg-primary rounded-t transition-all hover:opacity-80 relative group
                                ${expense > 0 ? 'opacity-100' : 'opacity-0'}`}
                            >
                              {/* Tooltip for bar */}
                              <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                                {year}: {formatCurrency(expense)}
                              </div>
                            </div>
                            <span className={`text-xs mt-1 ${index % 5 === 0 ? 'font-bold' : 'text-muted-foreground'}`}>
                              {index % 5 === 0 ? year : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* X-axis label */}
                    <div className="text-center mt-6 text-xs text-muted-foreground">
                      Year
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={calculateMinimumContribution}
                    disabled={isCalculating || !hasValidReplacementData}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Minimum Annual Contribution
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {cashflowTable.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reserve Fund Cashflow Projection</CardTitle>
                    <CardDescription>
                      Year-by-year breakdown of the reserve fund performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
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
                          {cashflowTable.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{yearLabels[entry.year]}</TableCell>
                              <TableCell>{formatCurrency(entry.beginBalance)}</TableCell>
                              <TableCell>{formatCurrency(entry.contribution)}</TableCell>
                              <TableCell>{formatCurrency(entry.interest)}</TableCell>
                              <TableCell>
                                {entry.expense > 0 ? (
                                  <span className="text-destructive">{formatCurrency(entry.expense)}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(entry.endBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
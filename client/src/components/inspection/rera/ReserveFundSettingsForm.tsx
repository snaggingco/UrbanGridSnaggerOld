import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Calculator, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SummaryTooltip from "./SummaryTooltip";
import FundingAdvisor from "./FundingAdvisor";
import ImpactExplanation from "./ImpactExplanation";

export interface ReserveFundSettings {
  id?: number;
  projectId: number;
  studyPeriod: number;
  startBalance: number;
  interestRate: number;
  inflationRate: number;
  contributionStrategy: 'flat' | 'escalating' | 'custom';
  escalationRate?: number;
  annualContribution?: number;
  currentContribution?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReserveFundSettingsFormProps {
  projectId: number;
  settings: ReserveFundSettings;
  onSettingsChange: (settings: ReserveFundSettings) => void;
  onCalculate: () => void;
  isCalculating: boolean;
  minimumAnnualContribution?: number;
}

export default function ReserveFundSettingsForm({
  projectId,
  settings,
  onSettingsChange,
  onCalculate,
  isCalculating,
  minimumAnnualContribution
}: ReserveFundSettingsFormProps) {
  // Create a local state for form values to avoid excessive API calls
  const [formValues, setFormValues] = useState<ReserveFundSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Update local form when parent settings change
  useEffect(() => {
    setFormValues(settings);
    setHasUnsavedChanges(false);
  }, [settings]);
  
  const queryClient = useQueryClient();

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: ReserveFundSettings) => {
      if (data.id) {
        return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings/${data.id}`, {
          method: "PATCH",
          body: data
        });
      } else {
        return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`, {
          method: "POST",
          body: data
        });
      }
    },
    onSuccess: (data, variables) => {
      // First update the parent component to ensure consistent state
      onSettingsChange(variables);
      
      // Then invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"] });
      
      toast({
        title: "Settings saved",
        description: "Reserve fund settings have been saved successfully.",
      });
      
      setHasUnsavedChanges(false);
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

  // Handle field changes with debouncing
  const handleFieldChange = (field: keyof ReserveFundSettings, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Handle percentage conversions for rate fields
    const finalValue = field.includes('Rate') ? numericValue / 100 : numericValue;
    
    console.log(`Field ${field} changed to ${value}, converted to ${finalValue}`);
    
    setFormValues(prev => ({
      ...prev,
      [field]: finalValue
    }));
    
    setHasUnsavedChanges(true);
  };
  
  // Handle strategy change with special consideration
  const handleStrategyChange = (value: 'flat' | 'escalating' | 'custom') => {
    setFormValues(prev => ({
      ...prev,
      contributionStrategy: value
    }));
    
    setHasUnsavedChanges(true);
  };
  
  // Handle save and calculate
  const handleSaveAndCalculate = () => {
    // First save the settings and update parent state on success via mutation handler
    saveSettingsMutation.mutate(formValues);
    
    // Then trigger calculation
    onCalculate();
  };
  
  // Format percentage for display
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '0.0';
    return (value * 100).toFixed(1);
  };

  // Function to handle quick optimization from advisor
  const handleOptimizeSettings = (optimizedSettings: Partial<ReserveFundSettings>) => {
    setFormValues(prev => ({
      ...prev,
      ...optimizedSettings
    }));
    
    setHasUnsavedChanges(true);
    
    toast({
      title: "Settings optimized",
      description: "Reserve fund settings have been optimized according to industry best practices.",
    });
  };
  
  return (
    <>
      {/* Best Practices Advisory Panel */}
      <FundingAdvisor 
        settings={formValues} 
        onOptimize={handleOptimizeSettings}
        minimumAnnualContribution={minimumAnnualContribution}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Reserve Fund Settings</CardTitle>
          <CardDescription>
            Configure the parameters for your reserve fund analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-1">
              <Label>Funding Strategy</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4">
                    <p className="font-semibold">RERA Best Practice:</p>
                    <p className="text-sm mt-1">Escalating funding is most often recommended as it aligns with inflation and balances the financial burden between current and future owners.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup 
              value={formValues.contributionStrategy} 
              onValueChange={(value: 'flat' | 'escalating' | 'custom') => handleStrategyChange(value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flat" id="flat-strategy" />
                <Label htmlFor="flat-strategy" className="font-normal">
                  <span className="font-medium">Flat Rate</span> - Same contribution amount each year
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="escalating" id="escalating-strategy" />
                <Label htmlFor="escalating-strategy" className="font-normal">
                  <span className="font-medium">Escalating</span> - Annual contribution increases each year
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom-strategy" />
                <Label htmlFor="custom-strategy" className="font-normal">
                  <span className="font-medium">Custom</span> - Manual contribution schedule
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="studyPeriod">Study Period (Years)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Industry Standard:</p>
                      <p className="text-sm mt-1">30 years is the standard study period for most properties. Complex or larger properties might use 40-50 years.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="studyPeriod"
                type="number"
                min="5"
                max="100"
                value={formValues.studyPeriod}
                onChange={(e) => handleFieldChange('studyPeriod', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="startBalance">Initial Balance (AED)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Enter the current reserve fund balance at the start of the study period.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="startBalance"
                type="number"
                min="0"
                value={formValues.startBalance}
                onChange={(e) => handleFieldChange('startBalance', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="currentContribution">Current Annual Contribution (AED)</Label>
                <SummaryTooltip
                  label="Current Annual Contribution"
                  description="The amount currently being contributed annually to the reserve fund"
                  calculation="Enter your current annual contribution to compare with recommendations"
                  importance="Helps evaluate if current funding levels are adequate compared to the recommended amount"
                >
                  <span />
                </SummaryTooltip>
              </div>
              <Input
                id="currentContribution"
                type="number"
                min="0"
                placeholder="Optional"
                value={formValues.currentContribution || ''}
                onChange={(e) => handleFieldChange('currentContribution', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md p-4">
                      <p className="font-semibold">RERA Best Practice:</p>
                      <p className="text-sm mt-1">Use conservative rates between 1.5-2.0% to reduce risk in your financial projections. Using higher rates can lead to underfunding if investment returns don't meet expectations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="interestRate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={formatPercentage(formValues.interestRate)}
                onChange={(e) => handleFieldChange('interestRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="inflationRate">Annual Inflation Rate (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md p-4">
                      <p className="font-semibold">UAE Standard:</p>
                      <p className="text-sm mt-1">For long-term projections in the UAE market, using 3% is the industry standard. This accounts for construction price inflation which often exceeds general inflation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="inflationRate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={formatPercentage(formValues.inflationRate)}
                onChange={(e) => handleFieldChange('inflationRate', e.target.value)}
              />
            </div>
            {formValues.contributionStrategy === 'escalating' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <Label htmlFor="escalationRate">Annual Contribution Increase (%)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md p-4">
                        <p className="font-semibold">Best Practice:</p>
                        <p className="text-sm mt-1">Setting the escalation rate between 2-3% generally aligns with inflation while keeping annual increases manageable for property owners.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="escalationRate"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formatPercentage(formValues.escalationRate || 0.02)}
                  onChange={(e) => handleFieldChange('escalationRate', e.target.value)}
                />
              </div>
            )}
            
            {formValues.contributionStrategy === 'custom' && (
              <div className="space-y-2 col-span-2">
                <Label>Custom Contribution Schedule</Label>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Custom schedule</AlertTitle>
                  <AlertDescription>
                    Custom contribution schedules allow you to manually set contribution amounts for each year.
                    This feature will be available in a future update.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          
          {/* Dynamic Impact Explanation */}
          <ImpactExplanation 
            settings={formValues}
            minimumAnnualContribution={minimumAnnualContribution}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {minimumAnnualContribution && (
              <div className="text-sm">
                Minimum Annual Contribution: <span className="font-bold">{new Intl.NumberFormat('en-AE', {
                  style: 'currency',
                  currency: 'AED',
                  maximumFractionDigits: 0
                }).format(minimumAnnualContribution)}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {hasUnsavedChanges && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // Save settings and prevent race conditions by updating parent state first
                  onSettingsChange(formValues);
                  saveSettingsMutation.mutate(formValues);
                }}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            )}
            <Button 
              onClick={handleSaveAndCalculate} 
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>Calculating...</>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  {hasUnsavedChanges ? "Save & Calculate" : "Calculate"}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
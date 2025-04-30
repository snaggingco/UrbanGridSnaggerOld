import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ReserveFundSettings as ReserveFundSettingsType } from "@shared/schema";
import { 
  Percent, 
  Settings, 
  Calculator,
  Calendar,
  DollarSign,
  ArrowUpRight,
  FileText,
  Edit,
  Save,
  RotateCw,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReserveFundSettingsProps {
  projectId: number;
}

// Currency formatter
const formatCurrency = (value: number | string) => {
  if (typeof value === 'string') value = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function ReserveFundSettings({ projectId }: ReserveFundSettingsProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [interestRate, setInterestRate] = useState<string>("1.5");
  const [inflationRate, setInflationRate] = useState<string>("2.0");
  const [studyPeriodYears, setStudyPeriodYears] = useState<string>("30");
  const [baseYear, setBaseYear] = useState<string>(new Date().getFullYear().toString());
  const [annualContribution, setAnnualContribution] = useState<string>("0");
  const [contributionIncreaseRate, setContributionIncreaseRate] = useState<string>("2.0");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reserve fund settings
  const { 
    data: settings, 
    isLoading: isSettingsLoading, 
    error: settingsError,
    isError: isSettingsError
  } = useQuery<ReserveFundSettingsType>({
    queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"],
    retry: 1, // Don't retry too many times as this might be a legitimate 404
  });

  // Fill the form with existing data when it loads
  useEffect(() => {
    if (settings) {
      setOpeningBalance(settings.openingBalance?.toString() || "0");
      setInterestRate(settings.interestRate || "1.5");
      setInflationRate(settings.inflationRate || "2.0");
      setStudyPeriodYears(settings.studyPeriodYears?.toString() || "30");
      setBaseYear(settings.baseYear?.toString() || new Date().getFullYear().toString());
      setAnnualContribution(settings.annualContribution?.toString() || "0");
      setContributionIncreaseRate(settings.contributionIncreaseRate || "2.0");
      setAdditionalNotes(settings.additionalNotes || "");
    }
  }, [settings]);

  // Create reserve fund settings mutation
  const createSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"] });
      setIsSubmitting(false);
      setIsEditing(false);
      toast({
        title: "Settings saved",
        description: "Reserve fund settings have been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating reserve fund settings:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to create reserve fund settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update reserve fund settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/rera/projects/${projectId}/reserve-fund-settings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "reserve-fund-settings"] });
      setIsSubmitting(false);
      setIsEditing(false);
      toast({
        title: "Settings updated",
        description: "Reserve fund settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating reserve fund settings:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to update reserve fund settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save settings
  const handleSaveSettings = () => {
    // Validation
    if (!openingBalance || !interestRate || !inflationRate || !studyPeriodYears || !baseYear) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const data = {
      projectId,
      openingBalance: parseInt(openingBalance),
      interestRate,
      inflationRate,
      studyPeriodYears: parseInt(studyPeriodYears),
      baseYear: parseInt(baseYear),
      annualContribution: parseInt(annualContribution || "0"),
      contributionIncreaseRate,
      additionalNotes,
    };

    if (settings?.id) {
      // Update existing settings
      updateSettingsMutation.mutate({ id: settings.id, data });
    } else {
      // Create new settings
      createSettingsMutation.mutate(data);
    }
  };

  // Calculate projected fund balance based on settings
  const calculateProjectedBalance = (years: number): number => {
    const openingBalanceNum = parseInt(openingBalance) || 0;
    const annualContributionNum = parseInt(annualContribution) || 0;
    const interestRateNum = parseFloat(interestRate) / 100;
    const contributionIncreaseRateNum = parseFloat(contributionIncreaseRate) / 100;
    
    let balance = openingBalanceNum;
    let yearlyContribution = annualContributionNum;

    for (let i = 0; i < years; i++) {
      // Add annual contribution at the start of the year
      balance += yearlyContribution;
      
      // Add interest accrued during the year
      balance += balance * interestRateNum;
      
      // Increase contribution for next year
      yearlyContribution *= (1 + contributionIncreaseRateNum);
    }

    return Math.round(balance);
  };

  // Generate projection for 10, 20, 30 years
  const shortTermProjection = calculateProjectedBalance(10);
  const midTermProjection = calculateProjectedBalance(20);
  const longTermProjection = calculateProjectedBalance(30);

  // Handle Edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle Cancel button click
  const handleCancelClick = () => {
    // Reset to original values
    if (settings) {
      setOpeningBalance(settings.openingBalance?.toString() || "0");
      setInterestRate(settings.interestRate || "1.5");
      setInflationRate(settings.inflationRate || "2.0");
      setStudyPeriodYears(settings.studyPeriodYears?.toString() || "30");
      setBaseYear(settings.baseYear?.toString() || new Date().getFullYear().toString());
      setAnnualContribution(settings.annualContribution?.toString() || "0");
      setContributionIncreaseRate(settings.contributionIncreaseRate || "2.0");
      setAdditionalNotes(settings.additionalNotes || "");
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reserve Fund Settings</h2>
          <p className="text-muted-foreground">
            Configure the financial parameters for the reserve fund study
          </p>
        </div>

        {!isEditing && (
          <Button onClick={handleEditClick} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            {settings ? "Edit Settings" : "Setup Reserve Fund"}
          </Button>
        )}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Financial Parameters
            </CardTitle>
            <CardDescription>
              Configure the financial parameters for reserve fund calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSettingsLoading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isSettingsError && !settings ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                {isEditing ? (
                  <div className="space-y-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="openingBalance" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Opening Balance
                      </Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        min="0"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Current amount in the reserve fund
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate" className="flex items-center gap-2">
                        <Percent className="h-4 w-4" /> Interest Rate (%)
                      </Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Expected annual interest rate on fund balance
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inflationRate" className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" /> Inflation Rate (%)
                      </Label>
                      <Input
                        id="inflationRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Expected annual inflation rate for cost projections
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baseYear" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Base Year
                      </Label>
                      <Input
                        id="baseYear"
                        type="number"
                        min="2000"
                        max="2100"
                        value={baseYear}
                        onChange={(e) => setBaseYear(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Starting year for calculations
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      No reserve fund settings have been configured yet. Click the "Setup Reserve Fund" button to get started.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="openingBalance" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Opening Balance
                      </Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        min="0"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Current amount in the reserve fund
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate" className="flex items-center gap-2">
                        <Percent className="h-4 w-4" /> Interest Rate (%)
                      </Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Expected annual interest rate on fund balance
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inflationRate" className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" /> Inflation Rate (%)
                      </Label>
                      <Input
                        id="inflationRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Expected annual inflation rate for cost projections
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baseYear" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Base Year
                      </Label>
                      <Input
                        id="baseYear"
                        type="number"
                        min="2000"
                        max="2100"
                        value={baseYear}
                        onChange={(e) => setBaseYear(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Starting year for calculations
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" /> Opening Balance:
                      </div>
                      <div className="text-sm">
                        {formatCurrency(settings?.openingBalance || 0)}
                      </div>

                      <div className="text-sm font-medium flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" /> Interest Rate:
                      </div>
                      <div className="text-sm">
                        {settings?.interestRate || "1.5"}%
                      </div>

                      <div className="text-sm font-medium flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" /> Inflation Rate:
                      </div>
                      <div className="text-sm">
                        {settings?.inflationRate || "2.0"}%
                      </div>

                      <div className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" /> Base Year:
                      </div>
                      <div className="text-sm">
                        {settings?.baseYear || new Date().getFullYear()}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Study Parameters</h4>
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="text-sm font-medium">Study Period:</div>
                        <div className="text-sm">{settings?.studyPeriodYears || 30} years</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - Annual Contributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Annual Contributions
            </CardTitle>
            <CardDescription>
              Configure annual contributions and increase rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSettingsLoading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studyPeriodYears" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Study Period (Years)
                  </Label>
                  <Input
                    id="studyPeriodYears"
                    type="number"
                    min="5"
                    max="50"
                    value={studyPeriodYears}
                    onChange={(e) => setStudyPeriodYears(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of years to project in the study (usually 30)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualContribution" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Annual Contribution
                  </Label>
                  <Input
                    id="annualContribution"
                    type="number"
                    min="0"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount added to the fund each year
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contributionIncreaseRate" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" /> Annual Contribution Increase (%)
                  </Label>
                  <div className="space-y-4">
                    {/* Slider for fine-tuning */}
                    <div className="pt-1 px-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">0%</span>
                        <span className="text-xs font-medium">{contributionIncreaseRate}%</span>
                        <span className="text-xs text-muted-foreground">10%</span>
                      </div>
                      <Slider
                        value={[parseFloat(contributionIncreaseRate)]}
                        min={0}
                        max={10}
                        step={0.1}
                        onValueChange={(values) => {
                          setContributionIncreaseRate(values[0].toFixed(1));
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {/* Input and increment/decrement controls */}
                    <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
                      <Input
                        id="contributionIncreaseRate"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={contributionIncreaseRate}
                        onChange={(e) => setContributionIncreaseRate(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="flex gap-1 items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newValue = Math.max(0, parseFloat(contributionIncreaseRate) - 0.5).toFixed(1);
                            setContributionIncreaseRate(newValue);
                          }}
                          disabled={isSubmitting || parseFloat(contributionIncreaseRate) <= 0}
                        >
                          -
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newValue = Math.min(10, parseFloat(contributionIncreaseRate) + 0.5).toFixed(1);
                            setContributionIncreaseRate(newValue);
                          }}
                          disabled={isSubmitting || parseFloat(contributionIncreaseRate) >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground flex items-center">
                          Annual percentage increase in contribution (0-10%)
                          <Info className="h-3 w-3 inline ml-1" />
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 max-w-xs">
                          <p className="text-xs font-medium">Annual Contribution Increase</p>
                          <p className="text-xs">Controls how much the contribution amount increases each year.</p>
                          <p className="text-xs text-muted-foreground">Higher values ensure better long-term funding but increase financial burden over time.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>



                <div className="space-y-2">
                  <Label htmlFor="additionalNotes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Additional Notes
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Add any additional notes or recommendations..."
                    disabled={isSubmitting}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> Annual Contribution:
                  </div>
                  <div className="text-sm">
                    {formatCurrency(settings?.annualContribution || 0)}
                  </div>

                  <div className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" /> Increase Rate:
                  </div>
                  <div className="text-sm">
                    {settings?.contributionIncreaseRate || "2.0"}%
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Projected Fund Balance</h4>
                  <div className="space-y-5 mt-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">10 Years ({new Date().getFullYear() + 10})</span>
                        <span className="text-sm font-medium">{formatCurrency(shortTermProjection)}</span>
                      </div>
                      <Progress value={(shortTermProjection / longTermProjection) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">20 Years ({new Date().getFullYear() + 20})</span>
                        <span className="text-sm font-medium">{formatCurrency(midTermProjection)}</span>
                      </div>
                      <Progress value={(midTermProjection / longTermProjection) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">30 Years ({new Date().getFullYear() + 30})</span>
                        <span className="text-sm font-medium">{formatCurrency(longTermProjection)}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>
                
                {settings?.additionalNotes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Notes
                    </h4>
                    <p className="text-sm whitespace-pre-line">{settings.additionalNotes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={handleCancelClick}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting && <RotateCw className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, WandSparkles, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAssetDefaultValues, calculateAnnualMaintenance } from "./nrm3DefaultValues";
import { useToast } from "@/hooks/use-toast";

interface AutoGenerateLifecycleCostsProps {
  projectId: number;
  assessments: any[];
  classifications: any[];
  lifecycleCosts: any[];
}

export default function AutoGenerateLifecycleCosts({
  projectId,
  assessments,
  classifications,
  lifecycleCosts,
}: AutoGenerateLifecycleCostsProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generateOptions, setGenerateOptions] = useState({
    replaceExisting: false,
    addMissingOnly: true,
  });

  // Count how many new lifecycle costs would be created
  const getAssessedAssetsWithoutLifecycleCosts = () => {
    // First, identify which assessments already have lifecycle costs
    const assessmentIdsWithCosts = new Set(
      lifecycleCosts
        .filter(cost => cost.assessmentId)
        .map(cost => cost.assessmentId)
    );

    // Find assessments that don't have lifecycle costs yet
    return assessments.filter(assessment => 
      !assessmentIdsWithCosts.has(assessment.id)
    );
  };

  const missingCostsCount = getAssessedAssetsWithoutLifecycleCosts().length;

  // Create mutation for bulk creation of lifecycle costs
  const generateLifecycleCostsMutation = useMutation({
    mutationFn: async (data: any[]) => {
      // Create all costs in sequence (we could do parallel but sequence is safer)
      const results = [];
      for (const costData of data) {
        const result = await apiRequest(`/api/rera/projects/${projectId}/lifecycle-costs`, {
          method: "POST",
          body: costData,
        });
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      // Invalidate the lifecycle costs query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/rera/projects`, projectId, "lifecycle-costs"] });
      toast({
        title: "Lifecycle costs generated",
        description: "All lifecycle costs have been automatically generated.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error generating lifecycle costs:", error);
      toast({
        title: "Error",
        description: "Failed to generate lifecycle costs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateLifecycleCosts = async () => {
    // Get the current year for calculations
    const currentYear = new Date().getFullYear();
    
    // Get assessments without lifecycle costs
    const assessmentsToProcess = generateOptions.addMissingOnly 
      ? getAssessedAssetsWithoutLifecycleCosts()
      : assessments;
    
    if (assessmentsToProcess.length === 0) {
      toast({
        description: "No assessments found without lifecycle costs.",
      });
      setIsDialogOpen(false);
      return;
    }
    
    // Prepare the lifecycle costs data
    const lifecostsToCreate = assessmentsToProcess.map(assessment => {
      // Get the classification for this assessment
      const classification = classifications.find(c => c.id === assessment.classificationId);
      if (!classification) return null;
      
      // Get default values based on the classification
      const defaultValues = getAssetDefaultValues(
        classification.nrmElement || "",
        classification.nrmGroup
      );
      
      // Calculate derived values
      const installedYear = currentYear - 5; // Assumption: installed 5 years ago
      const replacementYear = installedYear + defaultValues.lifespan;
      
      // Default replacement cost based on quantity if available
      let replacementCost = 100000; // Default fallback value
      if (defaultValues.replacementCostPerUnit && assessment.quantity) {
        const quantity = parseFloat(assessment.quantity);
        if (!isNaN(quantity)) {
          replacementCost = defaultValues.replacementCostPerUnit * quantity;
        }
      }
      
      // Calculate annual maintenance cost
      const annualMaintenanceCost = calculateAnnualMaintenance(
        replacementCost, 
        defaultValues.maintenancePercentage
      );
      
      return {
        projectId,
        assessmentId: assessment.id,
        classificationId: assessment.classificationId,
        locationId: assessment.locationId,
        replacementYear,
        replacementCost,
        estimatedLifeExpectancy: defaultValues.lifespan,
        installationYear: installedYear,
        lastRenovationYear: null,
        remainingServiceLife: defaultValues.lifespan - 5, // 5 years already passed
        annualMaintenanceCost,
        inflationAdjustment: null,
        conditionAdjustment: null,
        notes: `Auto-generated based on ${classification.description}`,
      };
    }).filter(Boolean); // Remove any null values
    
    // Generate the lifecycle costs
    generateLifecycleCostsMutation.mutate(lifecostsToCreate);
  };

  return (
    <>
      <Button 
        variant="default" 
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
      >
        <WandSparkles className="h-4 w-4" />
        <span>Auto-Generate Lifecycle Costs</span>
        {missingCostsCount > 0 && (
          <Badge variant="outline" className="ml-2">
            {missingCostsCount} missing
          </Badge>
        )}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auto-Generate Lifecycle Costs</AlertDialogTitle>
            <AlertDialogDescription>
              This will automatically create lifecycle costs for all assessed assets using 
              industry-standard default values based on the NRM3 classification.
              <div className="mt-4 space-y-3">
                <p><strong>Assets to add:</strong> {missingCostsCount}</p>
                <p>
                  Default values will be used for replacement costs, lifespans, and maintenance costs
                  based on the NRM3 category of each asset. You can edit these values afterward if needed.
                </p>
                <div className="text-sm flex items-center gap-2 mt-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Values will include quantity information where available</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleGenerateLifecycleCosts();
              }}
              disabled={generateLifecycleCostsMutation.isPending}
            >
              {generateLifecycleCostsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4 mr-2" />
                  Generate Lifecycle Costs
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
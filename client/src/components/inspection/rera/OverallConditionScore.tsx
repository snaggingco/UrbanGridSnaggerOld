import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Gauge, Save, Info, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OverallConditionScoreProps {
  projectId: number;
  assetConditions: {
    condition: string;
    count: number;
  }[];
  onSaveScore: (score: number, calculationMethod: string) => Promise<void>;
  savedScore?: number;
  savedCalculationMethod?: string;
}

interface ConditionWeight {
  condition: string;
  weight: number;
  description: string;
}

// Condition weights for calculation
const conditionWeights: ConditionWeight[] = [
  { condition: "excellent", weight: 90, description: "Asset is like new with no visible issues" },
  { condition: "good", weight: 70, description: "Asset shows minimal wear and maintains full functionality" },
  { condition: "fair", weight: 50, description: "Asset has noticeable wear but functions adequately" },
  { condition: "poor", weight: 30, description: "Asset shows significant deterioration affecting function" },
  { condition: "critical", weight: 10, description: "Asset requires immediate replacement or major repair" }
];

export default function OverallConditionScore({
  projectId,
  assetConditions,
  onSaveScore,
  savedScore,
  savedCalculationMethod = "automatic"
}: OverallConditionScoreProps) {
  const [score, setScore] = useState<number>(savedScore || 0);
  const [calculationMethod, setCalculationMethod] = useState<"automatic" | "manual">(
    savedCalculationMethod as "automatic" | "manual" || "automatic"
  );
  const [manualScore, setManualScore] = useState<number>(savedScore || 50);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Calculate score automatically based on asset conditions
  useEffect(() => {
    if (calculationMethod === "automatic" && assetConditions.length > 0) {
      let totalWeightedScore = 0;
      let totalAssets = 0;
      
      assetConditions.forEach(({ condition, count }) => {
        const weightObj = conditionWeights.find(w => 
          w.condition.toLowerCase() === condition.toLowerCase()
        );
        
        if (weightObj) {
          totalWeightedScore += weightObj.weight * count;
          totalAssets += count;
        }
      });
      
      const calculatedScore = totalAssets > 0 
        ? Math.round(totalWeightedScore / totalAssets) 
        : 0;
      
      setScore(calculatedScore);
    }
  }, [assetConditions, calculationMethod]);

  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const finalScore = calculationMethod === "automatic" ? score : manualScore;
      await onSaveScore(finalScore, calculationMethod);
      
      toast({
        title: "Score Saved",
        description: `Overall condition score of ${finalScore} has been saved.`,
        variant: "default",
      });
      
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error Saving Score",
        description: "There was a problem saving the overall condition score.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-300";
    if (score >= 60) return "from-emerald-500 to-emerald-300";
    if (score >= 40) return "from-amber-500 to-amber-300";
    if (score >= 20) return "from-orange-500 to-orange-300";
    return "from-red-500 to-red-300";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Poor";
    return "Critical";
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Overall Condition Score</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDialog(true)}
            >
              {savedScore ? "Update Score" : "Set Score"}
            </Button>
          </div>
          <CardDescription>
            Combined assessment of all assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedScore ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div 
                  className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 bg-gradient-to-br ${getScoreGradient(savedScore)}`}
                >
                  <span className="text-2xl font-bold text-white">{savedScore}</span>
                  <span className="text-xs font-medium text-white">/ 100</span>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className={`text-lg font-semibold ${getScoreColor(savedScore)}`}>
                  {getScoreLabel(savedScore)}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculation: {savedCalculationMethod === "automatic" ? "Weighted Average" : "Manual Input"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-center space-y-2">
              <Gauge className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No overall condition score has been set
              </p>
              <p className="text-xs text-muted-foreground">
                Set a score to include it in the final report
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Overall Condition Score</DialogTitle>
            <DialogDescription>
              The overall condition score reflects the general state of the assessed property.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={calculationMethod === "automatic" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalculationMethod("automatic")}
                className="flex-1"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Automatic
              </Button>
              <Button
                variant={calculationMethod === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalculationMethod("manual")}
                className="flex-1"
              >
                <Gauge className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>
            
            {calculationMethod === "automatic" ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Calculated Score</Label>
                    <span className={`text-base font-semibold ${getScoreColor(score)}`}>
                      {score} - {getScoreLabel(score)}
                    </span>
                  </div>
                  <Progress value={score} max={100} className="h-2" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium flex items-center">
                    <Info className="h-3.5 w-3.5 mr-1.5" />
                    Calculation Method
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The score is calculated as a weighted average of all asset conditions.
                    Each condition level has a predefined weight:
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {conditionWeights.map((cw) => (
                      <li key={cw.condition} className="flex items-center justify-between">
                        <span className="capitalize">{cw.condition}:</span>
                        <span>{cw.weight} points</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Manual Score</Label>
                  <span className={`text-base font-semibold ${getScoreColor(manualScore)}`}>
                    {manualScore} - {getScoreLabel(manualScore)}
                  </span>
                </div>
                <Slider
                  value={[manualScore]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setManualScore(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Critical</span>
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && (
                <span className="mr-2 h-4 w-4 animate-spin">◌</span>
              )}
              Save Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { FileDownIcon, PrinterIcon, FileTextIcon, RefreshCwIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface ReportGeneratorProps {
  contractId: number;
  projectId: number;
  entities: any[];
  allocations: any[];
  selectedBudgetItems: Record<number, any>;
  onBack: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  contractId,
  projectId,
  entities,
  allocations,
  selectedBudgetItems,
  onBack
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportOptions, setReportOptions] = useState({
    includeEntityBreakdown: true,
    includeRatioDetails: true,
    includeCharts: true,
    format: 'pdf',
    orientation: 'portrait'
  });

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 15;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 1000);

      // Make API call to generate the report
      const response = await fetch(`/api/amc/contracts/${contractId}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportOptions)
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportUrl(data.reportUrl);
      setProgress(100);

      toast({
        title: "Report Generated",
        description: "Your cost allocation report has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error Generating Report",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">6</div>
          <CardTitle>Generate Allocation Report</CardTitle>
        </div>
        <CardDescription>
          Step 6: Create and download the final cost allocation report with all supporting details
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Options */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Report Contents</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="entity-breakdown" 
                    checked={reportOptions.includeEntityBreakdown}
                    onCheckedChange={(checked) => 
                      setReportOptions({...reportOptions, includeEntityBreakdown: !!checked})
                    }
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor="entity-breakdown">Entity Breakdown</Label>
                    <p className="text-sm text-muted-foreground">
                      Include detailed cost breakdown for each entity
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="ratio-details" 
                    checked={reportOptions.includeRatioDetails}
                    onCheckedChange={(checked) => 
                      setReportOptions({...reportOptions, includeRatioDetails: !!checked})
                    }
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor="ratio-details">Ratio Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Include allocation ratios and calculation methods
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={reportOptions.includeCharts}
                    onCheckedChange={(checked) => 
                      setReportOptions({...reportOptions, includeCharts: !!checked})
                    }
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor="charts">Charts and Visualizations</Label>
                    <p className="text-sm text-muted-foreground">
                      Include visual representations of allocations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Report Format</h3>
              <RadioGroup 
                value={reportOptions.format}
                onValueChange={(value) => setReportOptions({...reportOptions, format: value})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF Format</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel">Excel Spreadsheet</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Page Orientation</h3>
              <RadioGroup 
                value={reportOptions.orientation}
                onValueChange={(value) => setReportOptions({...reportOptions, orientation: value})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {/* Report Preview */}
          <div className="border rounded-lg p-6 flex flex-col items-center justify-center">
            {reportUrl ? (
              <div className="text-center space-y-4">
                <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                  <FileDownIcon className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-green-700">Report Ready</h3>
                <p className="text-sm text-slate-600 max-w-md">
                  Your cost allocation report has been generated and is ready to download.
                </p>
                <Button onClick={downloadReport} className="mt-4">
                  Download Report
                </Button>
                <Button variant="outline" onClick={handleGenerateReport} className="mt-2">
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            ) : isGenerating ? (
              <div className="text-center space-y-4 w-full">
                <div className="mx-auto h-24 w-24 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin" />
                <h3 className="text-lg font-medium">Generating Report...</h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-slate-500">
                  Processing data and creating your report. This may take a moment.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
                  <FileTextIcon className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium">Ready to Generate</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Select your report options and click the Generate Report button to create your allocation report.
                </p>
                <Button onClick={handleGenerateReport} className="mt-4">
                  Generate Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Summary
        </Button>
        {reportUrl && (
          <Button onClick={downloadReport}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator;
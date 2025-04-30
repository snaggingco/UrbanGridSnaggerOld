import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Loader2, 
  AlertTriangle, 
  Info, 
  FileText, 
  Download, 
  Printer, 
  FileCheck,
  Send,
  Settings,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ReportPreviewProps {
  projectId: number;
  auditType?: "condition_survey" | "reserve_fund_study";
}

export default function ReportPreview({ projectId, auditType }: ReportPreviewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportSettings, setReportSettings] = useState({
    includeImages: true,
    includeExecutiveSummary: true,
    includeAssetConditionTables: true,
    includeLifecycleTables: true,
    includeRecommendations: true,
    coverLogo: true,
    coverPageTitle: "",
    clientName: "",
    preparedBy: "",
    reportDate: new Date().toISOString().split("T")[0],
  });
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  interface Project {
  id: number;
  name: string;
  clientName: string;
  reraAuditType: 'condition_survey' | 'reserve_fund_study';
  capitalPlan?: any;
  summaryStats?: any;
  [key: string]: any;
}

// Fetch project details
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  // Generate Preview mutation
  const generatePreviewMutation = useMutation({
    mutationFn: async (settings: any) => {
      setPreviewLoading(true);
      
      // Ensure we have at least basic settings
      const reportSettings = {
        reportType: project?.reraAuditType || 'reserve_fund_study',
        settings: {
          coverPageTitle: settings.coverPageTitle || `${project?.reraAuditType === "condition_survey" ? "Condition Survey" : "Reserve Fund Study"} Report`,
          clientName: settings.clientName || project?.clientName || "",
          preparedBy: settings.preparedBy || "Snagging By UrbanGrid",
          ...settings
        }
      };
      
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch(`/api/rera/projects/${projectId}/rera-reports/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reportSettings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate preview");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // After successfully submitting, fetch the preview HTML
      setTimeout(() => {
        fetchPreviewHtml();
      }, 500);
    },
    onError: (error) => {
      setPreviewLoading(false);
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: `Failed to generate report preview: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate and download report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (settings: any) => {
      setIsGenerating(true);
      
      // Ensure we have at least basic settings
      const reportSettings = {
        reportType: project?.reraAuditType || 'reserve_fund_study',
        settings: {
          coverPageTitle: settings.coverPageTitle || `${project?.reraAuditType === "condition_survey" ? "Condition Survey" : "Reserve Fund Study"} Report`,
          clientName: settings.clientName || project?.clientName || "",
          preparedBy: settings.preparedBy || "Snagging By UrbanGrid",
          ...settings
        },
        capitalPlan: project?.capitalPlan || {},
        summaryStats: project?.summaryStats || {}
      };
      
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch(`/api/rera/projects/${projectId}/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reportSettings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      
      // If there's a URL in the response, open it to download the PDF
      if (data && data.fileUrl) {
        window.open(data.fileUrl, '_blank');
        toast({
          title: "Report Generated",
          description: "Your RERA report has been generated successfully.",
        });
      } else if (data && data.reportUrl) {
        window.open(data.reportUrl, '_blank');
        toast({
          title: "Report Generated",
          description: "Your RERA report has been generated successfully.",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Couldn't get the download URL for the report.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: `Failed to generate the report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Fetch preview HTML
  const fetchPreviewHtml = async () => {
    try {
      const response = await fetch(`/api/rera/projects/${projectId}/rera-reports/preview`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch preview");
      
      const data = await response.text();
      setPreviewHtml(data);
    } catch (error) {
      console.error("Error fetching preview:", error);
      toast({
        title: "Error",
        description: "Failed to load report preview.",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Initialize report settings when project loads
  useEffect(() => {
    if (project) {
      setReportSettings({
        ...reportSettings,
        coverPageTitle: `${project.reraAuditType === "condition_survey" ? "Condition Survey" : "Reserve Fund Study"} Report`,
        clientName: project.clientName,
        preparedBy: "Snagging By UrbanGrid",
      });
    }
  }, [project]);

  // Handle report settings change
  const handleSettingsChange = (setting: string, value: any) => {
    setReportSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle preview generation
  const handleGeneratePreview = () => {
    generatePreviewMutation.mutate(reportSettings);
  };

  // Handle report generation and download
  const handleGenerateReport = () => {
    generateReportMutation.mutate(reportSettings);
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading project details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RERA Audit Report</h2>
          <p className="text-muted-foreground">
            Preview and generate the final report for your {project?.reraAuditType === "condition_survey" ? "Condition Survey" : "Reserve Fund Study"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGeneratePreview} disabled={previewLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Refresh Preview
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">
            <FileText className="mr-2 h-4 w-4" />
            Report Preview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Report Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {previewLoading ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Generating Preview</h3>
                <p className="text-sm text-muted-foreground max-w-md text-center mt-2">
                  We're preparing your report preview. This may take a moment as we process all asset data and images.
                </p>
              </CardContent>
            </Card>
          ) : previewHtml ? (
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="border rounded-md">
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: "100%", height: "75vh", border: "none" }}
                    title="Report Preview"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[60vh]">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Preview Available</h3>
                <p className="text-sm text-muted-foreground max-w-md text-center mt-2 mb-4">
                  Click 'Refresh Preview' to generate a preview of your RERA report based on the current assessment data.
                </p>
                <Button onClick={handleGeneratePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Generate Preview
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>
                Customize how your report is generated and what information to include
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Page Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cover Page</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverPageTitle">Report Title</Label>
                    <Input
                      id="coverPageTitle"
                      value={reportSettings.coverPageTitle}
                      onChange={(e) => handleSettingsChange("coverPageTitle", e.target.value)}
                      placeholder="e.g., RERA Condition Survey Report"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={reportSettings.clientName}
                      onChange={(e) => handleSettingsChange("clientName", e.target.value)}
                      placeholder="Client name as it will appear on the report"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preparedBy">Prepared By</Label>
                    <Input
                      id="preparedBy"
                      value={reportSettings.preparedBy}
                      onChange={(e) => handleSettingsChange("preparedBy", e.target.value)}
                      placeholder="e.g., Snagging By UrbanGrid"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportDate">Report Date</Label>
                    <Input
                      id="reportDate"
                      type="date"
                      value={reportSettings.reportDate}
                      onChange={(e) => handleSettingsChange("reportDate", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coverLogo"
                    checked={reportSettings.coverLogo}
                    onCheckedChange={(checked) => handleSettingsChange("coverLogo", checked)}
                  />
                  <Label htmlFor="coverLogo">Include company logo on cover page</Label>
                </div>
              </div>
              
              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Sections</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeExecutiveSummary"
                      checked={reportSettings.includeExecutiveSummary}
                      onCheckedChange={(checked) => handleSettingsChange("includeExecutiveSummary", checked)}
                    />
                    <Label htmlFor="includeExecutiveSummary">Include Executive Summary</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeAssetConditionTables"
                      checked={reportSettings.includeAssetConditionTables}
                      onCheckedChange={(checked) => handleSettingsChange("includeAssetConditionTables", checked)}
                    />
                    <Label htmlFor="includeAssetConditionTables">Include Asset Condition Tables</Label>
                  </div>
                  
                  {project?.reraAuditType === "reserve_fund_study" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeLifecycleTables"
                        checked={reportSettings.includeLifecycleTables}
                        onCheckedChange={(checked) => handleSettingsChange("includeLifecycleTables", checked)}
                      />
                      <Label htmlFor="includeLifecycleTables">Include Lifecycle Cost Tables</Label>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRecommendations"
                      checked={reportSettings.includeRecommendations}
                      onCheckedChange={(checked) => handleSettingsChange("includeRecommendations", checked)}
                    />
                    <Label htmlFor="includeRecommendations">Include Recommendations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeImages"
                      checked={reportSettings.includeImages}
                      onCheckedChange={(checked) => handleSettingsChange("includeImages", checked)}
                    />
                    <Label htmlFor="includeImages">Include Asset Images</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab("preview")}>
                  Cancel
                </Button>
                <Button onClick={handleGeneratePreview}>
                  Apply Settings & Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
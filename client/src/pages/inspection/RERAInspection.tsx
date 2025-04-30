import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Building,
  BarChart3,
  ClipboardList,
  Construction,
  FileText,
  Loader2,
  ArrowLeft,
  FileCheck,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import InspectionLayout from "@/components/layouts/InspectionLayout";
import SimpleAssetLocationManager from "@/components/inspection/rera/SimpleAssetLocationManager";
import NRM3Framework from "@/components/inspection/rera/NRM3Framework";
import ConditionAssessment from "@/components/inspection/rera/ConditionAssessment";
// LifecycleCosts has been removed as it's now integrated into ConditionAssessment
import ReportPreview from "@/components/inspection/rera/ReportPreview";

interface RERAInspectionProps {}

export default function RERAInspection(props: RERAInspectionProps) {
  const { id } = useParams<{ id: string }>();
  
  // Check URL for tab parameter
  const getInitialTabFromURL = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab");
      if (tabParam && ["dashboard", "locations", "classifications", "assessment", "reports"].includes(tabParam)) {
        return tabParam;
      }
    }
    return "dashboard";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTabFromURL());
  const [nrm3Categories, setNrm3Categories] = useState<any[]>([]);
  const [isLoadingNrm3, setIsLoadingNrm3] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [projectFormData, setProjectFormData] = useState<any>({});
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  
  // Toast setup
  const { toast } = useToast();

  // Fetch project details
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ["/api/projects", parseInt(id, 10)],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      const response = await fetch(`/api/projects/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch project details");
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch asset locations for this project
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery({
    queryKey: ["/api/projects", parseInt(id, 10), "locations"],
  });

  // Fetch NRM3 classifications for this project
  const { data: classifications = [], isLoading: isClassificationsLoading } = useQuery({
    queryKey: ["/api/projects", parseInt(id, 10), "classifications"],
  });

  // Fetch condition assessments for this project
  const { data: assessments = [], isLoading: isAssessmentsLoading } = useQuery({
    queryKey: ["/api/projects", parseInt(id, 10), "condition-assessments"],
  });

  // Fetch lifecycle costs for this project (for reserve fund studies)
  const { data: lifecycleCosts = [], isLoading: isLifecycleCostsLoading } = useQuery({
    queryKey: ["/api/projects", parseInt(id, 10), "lifecycle-costs"],
  });

  // Load NRM3 classification data using React Query
  const { data: nrm3CategoriesData, isLoading: isLoadingNrm3Categories } = useQuery({
    queryKey: ["/api/nrm3-categories"],
  });
  
  // Update local state when data is loaded
  useEffect(() => {
    if (nrm3CategoriesData && Array.isArray(nrm3CategoriesData)) {
      setNrm3Categories(nrm3CategoriesData);
      setIsLoadingNrm3(false);
    }
  }, [nrm3CategoriesData]);

  // Check if this is a valid RERA audit project
  const isValidProject = project && project.projectType === "rera_audit";
  const isReserveFundStudy = project?.reraAuditType === "reserve_fund_study";
  const isConditionSurvey = project?.reraAuditType === "condition_survey";
  
  // Calculate data points for dashboard - ensure they're project-specific
  const assessmentCount = Array.isArray(assessments) && project?.id 
    ? assessments.filter(assessment => assessment.projectId === project.id).length 
    : 0;
  
  const assetLocationCount = Array.isArray(locations) && project?.id
    ? locations.filter(location => location.projectId === project.id).length
    : 0;
  
  const classificationCount = Array.isArray(classifications) && project?.id
    ? classifications.filter(classification => classification.projectId === project.id).length
    : 0;
  
  const lifecycleCostCount = Array.isArray(lifecycleCosts) && project?.id
    ? lifecycleCosts.filter(cost => cost.projectId === project.id).length
    : 0;

  // Calculate condition ratings distribution
  const calculateConditionDistribution = () => {
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return { A: 0, B: 0, C: 0, D: 0 };
    }
    
    // Filter for project-specific assessments
    const projectAssessments = assessments.filter(assessment => 
      assessment.projectId === project.id);
    
    if (projectAssessments.length === 0) {
      return { A: 0, B: 0, C: 0, D: 0 };
    }
    
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    projectAssessments.forEach((assessment: any) => {
      if (assessment.conditionRating in counts) {
        counts[assessment.conditionRating as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  // Calculate priority distribution
  const calculatePriorityDistribution = () => {
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return { "1": 0, "2": 0, "3": 0, "4": 0 };
    }
    
    // Filter for project-specific assessments
    const projectAssessments = assessments.filter(assessment => 
      assessment.projectId === project.id);
    
    if (projectAssessments.length === 0) {
      return { "1": 0, "2": 0, "3": 0, "4": 0 };
    }
    
    const counts = { "1": 0, "2": 0, "3": 0, "4": 0 };
    projectAssessments.forEach((assessment: any) => {
      if (assessment.priorityRating in counts) {
        counts[assessment.priorityRating as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  // Calculate total replacement cost for Reserve Fund Study
  const calculateTotalReplacementCost = () => {
    if (!Array.isArray(lifecycleCosts) || lifecycleCosts.length === 0) return 0;
    
    // Filter for project-specific lifecycle costs
    const projectLifecycleCosts = lifecycleCosts.filter(cost => 
      cost.projectId === project.id);
    
    if (projectLifecycleCosts.length === 0) return 0;
    
    return projectLifecycleCosts.reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
  };

  // Calculate annual maintenance cost
  const calculateAnnualMaintenanceCost = () => {
    if (!Array.isArray(lifecycleCosts) || lifecycleCosts.length === 0) return 0;
    
    // Filter for project-specific lifecycle costs
    const projectLifecycleCosts = lifecycleCosts.filter(cost => 
      cost.projectId === project.id);
    
    if (projectLifecycleCosts.length === 0) return 0;
    
    return projectLifecycleCosts.reduce((sum: number, cost: any) => sum + (parseInt(cost.annualMaintenanceCost) || 0), 0);
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Determine overall building condition
  const getOverallCondition = () => {
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return { label: "Not Assessed", color: "bg-gray-200 text-gray-800" };
    }
    
    // Filter for project-specific assessments 
    const projectAssessments = assessments.filter(assessment => 
      assessment.projectId === project.id);
    
    if (projectAssessments.length === 0) {
      return { label: "Not Assessed", color: "bg-gray-200 text-gray-800" };
    }
    
    const conditionScores = {
      'A': 4,
      'B': 3,
      'C': 2,
      'D': 1
    };
    
    const totalScore = projectAssessments.reduce((sum: number, assessment: any) => {
      return sum + (conditionScores[assessment.conditionRating as keyof typeof conditionScores] || 0);
    }, 0);
    
    const averageScore = totalScore / projectAssessments.length;
    
    if (averageScore >= 3.5) return { label: "Good", color: "bg-green-100 text-green-800" };
    if (averageScore >= 2.5) return { label: "Satisfactory", color: "bg-blue-100 text-blue-800" };
    if (averageScore >= 1.5) return { label: "Poor", color: "bg-amber-100 text-amber-800" };
    return { label: "Bad", color: "bg-red-100 text-red-800" };
  };

  // Get most problematic NRM category
  const getMostProblematicCategory = () => {
    if (!Array.isArray(assessments) || assessments.length === 0 || !Array.isArray(classifications)) {
      return { name: "N/A", count: 0 };
    }
    
    // Filter for project-specific assessments
    const projectAssessments = assessments.filter(assessment => 
      assessment.projectId === project.id);
    
    if (projectAssessments.length === 0) {
      return { name: "N/A", count: 0 };
    }
    
    const categoryCounts: Record<string, { count: number, name: string }> = {};
    
    // Only count poor (C) and bad (D) condition ratings
    projectAssessments.forEach((assessment: any) => {
      if (assessment.conditionRating === 'C' || assessment.conditionRating === 'D') {
        const classification = classifications.find((c: any) => c.id === assessment.classificationId);
        if (classification) {
          const groupCode = classification.nrmGroup;
          const category = nrm3Categories.find(c => c.code === groupCode);
          const categoryName = category ? category.name : groupCode;
          
          if (!categoryCounts[groupCode]) {
            categoryCounts[groupCode] = { count: 0, name: categoryName };
          }
          categoryCounts[groupCode].count++;
        }
      }
    });
    
    // Find the category with the highest count
    let maxCount = 0;
    let maxCategory = { name: "N/A", count: 0 };
    
    Object.values(categoryCounts).forEach(category => {
      if (category.count > maxCount) {
        maxCount = category.count;
        maxCategory = category;
      }
    });
    
    return maxCategory;
  };

  // Determine assessment completion percentage 
  const getAssessmentCompletionPercentage = () => {
    if (!Array.isArray(classifications) || classifications.length === 0) return 0;
    if (!Array.isArray(assessments)) return 0;
    
    // Filter for project-specific classifications
    const projectClassifications = classifications.filter(classification => 
      classification.projectId === project.id);
    
    if (projectClassifications.length === 0) return 0;
    
    // Filter for project-specific assessments
    const projectAssessments = assessments.filter(assessment => 
      assessment.projectId === project.id);
    
    return Math.min(100, Math.round((projectAssessments.length / projectClassifications.length) * 100));
  };

  // Calculate short-term and long-term replacement costs
  const getReplacementCostsByTimeframe = () => {
    if (!Array.isArray(lifecycleCosts) || lifecycleCosts.length === 0) {
      return { shortTerm: 0, mediumTerm: 0, longTerm: 0 };
    }
    
    // Filter for project-specific lifecycle costs
    const projectLifecycleCosts = lifecycleCosts.filter(cost => 
      cost.projectId === project.id);
    
    if (projectLifecycleCosts.length === 0) {
      return { shortTerm: 0, mediumTerm: 0, longTerm: 0 };
    }
    
    const currentYear = new Date().getFullYear();
    
    const shortTerm = projectLifecycleCosts
      .filter((cost: any) => cost.replacementYear >= currentYear && cost.replacementYear < currentYear + 5)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
      
    const mediumTerm = projectLifecycleCosts
      .filter((cost: any) => cost.replacementYear >= currentYear + 5 && cost.replacementYear < currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
      
    const longTerm = projectLifecycleCosts
      .filter((cost: any) => cost.replacementYear >= currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    return { shortTerm, mediumTerm, longTerm };
  };

  // Get completed data for dashboard
  const conditionDistribution = calculateConditionDistribution();
  const priorityDistribution = calculatePriorityDistribution();
  const totalReplacementCost = calculateTotalReplacementCost();
  const annualMaintenanceCost = calculateAnnualMaintenanceCost();
  const overallCondition = getOverallCondition();
  const mostProblematicCategory = getMostProblematicCategory();
  const assessmentCompletion = getAssessmentCompletionPercentage();
  const replacementCostsByTimeframe = getReplacementCostsByTimeframe();

  // Handle category selection
  const handleCategorySelect = (categoryCode: string) => {
    setActiveCategory(categoryCode);
    setActiveTab('assessment');
  };
  
  // Setup query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Handle saving project properties
  const handleSaveProjectProperties = async () => {
    if (!project || Object.keys(projectFormData).length === 0) return;
    
    setIsUpdatingProject(true);
    
    try {
      // Call the API to update the project
      const updatedProject = await apiRequest(`/api/projects/${id}`, {
        method: 'PATCH',
        body: projectFormData
      });
      
      // Invalidate the project cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/projects", parseInt(id, 10)] });
      
      // Show success message
      toast({
        title: "Success",
        description: "Project properties saved successfully",
        variant: "default",
      });
      
      // Clear form data
      setProjectFormData({});
    } catch (error) {
      console.error("Error updating project:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to save project properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProject(false);
    }
  };

  if (isProjectLoading) {
    return (
      <InspectionLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading project details...</span>
        </div>
      </InspectionLayout>
    );
  }

  if (projectError || !project) {
    return (
      <InspectionLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load project details. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </InspectionLayout>
    );
  }

  if (!isValidProject) {
    return (
      <InspectionLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Invalid Project Type</AlertTitle>
          <AlertDescription>
            This project is not a RERA Audit project. Please navigate to the appropriate inspection interface.
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = `/inspection/project/${id}`}>
          Go to Standard Inspection
        </Button>
      </InspectionLayout>
    );
  }

  return (
    <InspectionLayout>
      {/* Project header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge className={`${isReserveFundStudy ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
              {isReserveFundStudy ? 'Reserve Fund Study' : 'Condition Survey'}
            </Badge>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            Client: {project.clientName} | Location: {project.location} | Property: {project.propertyType}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/inspection/dashboard"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="default" size="sm" onClick={() => setActiveTab("reports")}>
            <FileCheck className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Dashboard</span>
            <span className="inline md:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="locations">
            <Building className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Asset Locations</span>
            <span className="inline md:hidden">Locations</span>
          </TabsTrigger>
          <TabsTrigger value="framework">
            <ClipboardList className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">NRM3 Framework</span>
            <span className="inline md:hidden">NRM3</span>
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <Construction className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Assessment</span>
            <span className="inline md:hidden">Assess</span>
          </TabsTrigger>
          <TabsTrigger value="reports" disabled={assessmentCount === 0}>
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Reports</span>
            <span className="inline md:hidden">Reports</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Project Properties Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Project Properties</CardTitle>
              <CardDescription>
                Essential information about this {isReserveFundStudy ? 'Reserve Fund Study' : 'Condition Survey'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="yearOfConstruction">Year of Construction</Label>
                  <Input 
                    id="yearOfConstruction" 
                    type="number" 
                    placeholder="e.g. 2010"
                    value={projectFormData.yearOfConstruction !== undefined 
                      ? projectFormData.yearOfConstruction || ""
                      : project.yearOfConstruction || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        yearOfConstruction: value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buildingType">Building Type</Label>
                  <Select 
                    value={projectFormData.buildingType !== undefined 
                      ? projectFormData.buildingType || "" 
                      : project.buildingType || ""}
                    onValueChange={(value) => {
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        buildingType: value
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed">Mixed Use</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalArea">Total Area (sqft)</Label>
                  <Input 
                    id="totalArea" 
                    type="number" 
                    placeholder="e.g. 10000"
                    value={projectFormData.totalArea !== undefined 
                      ? projectFormData.totalArea || "" 
                      : project.totalArea || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        totalArea: value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numberOfFloors">Number of Floors</Label>
                  <Input 
                    id="numberOfFloors" 
                    type="number" 
                    placeholder="e.g. 5"
                    value={projectFormData.numberOfFloors !== undefined 
                      ? projectFormData.numberOfFloors || "" 
                      : project.numberOfFloors || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        numberOfFloors: value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="constructionType">Construction Type</Label>
                  <Input 
                    id="constructionType" 
                    placeholder="e.g. Reinforced Concrete"
                    value={projectFormData.constructionType !== undefined 
                      ? projectFormData.constructionType || "" 
                      : project.constructionType || ""}
                    onChange={(e) => {
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        constructionType: e.target.value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastMajorRenovation">Last Major Renovation</Label>
                  <Input 
                    id="lastMajorRenovation" 
                    type="number" 
                    placeholder="e.g. 2018"
                    value={projectFormData.lastMajorRenovation !== undefined 
                      ? projectFormData.lastMajorRenovation || "" 
                      : project.lastMajorRenovation || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      setProjectFormData((prev: Record<string, any>) => ({
                        ...prev,
                        lastMajorRenovation: value
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline"
                  onClick={handleSaveProjectProperties}
                  disabled={isUpdatingProject}
                >
                  {isUpdatingProject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Project Properties"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex justify-between items-center">
                  <span>Project Status</span>
                  <Badge variant="outline" className="ml-2">{assessmentCompletion}% Complete</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{assetLocationCount}</span>
                      <span className="text-xs text-muted-foreground">Asset Locations</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{classificationCount}</span>
                      <span className="text-xs text-muted-foreground">Assets</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{assessmentCount}</span>
                      <span className="text-xs text-muted-foreground">Assessments</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{isReserveFundStudy ? lifecycleCostCount : '-'}</span>
                      <span className="text-xs text-muted-foreground">Lifecycle Costs</span>
                    </div>
                  </div>
                  
                  <Progress value={assessmentCompletion} className="h-2" />
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {assessmentCompletion === 100 
                      ? "All assets have been assessed" 
                      : "Continue assessment to complete the survey"}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex justify-between items-center">
                  <span>Building Condition</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${overallCondition.color}`}>
                    {overallCondition.label}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Grade A (Good)</span>
                    <span>{conditionDistribution.A}</span>
                  </div>
                  <Progress value={(conditionDistribution.A / Math.max(1, assessmentCount)) * 100} className="h-1 bg-gray-100" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Grade B (Satisfactory)</span>
                    <span>{conditionDistribution.B}</span>
                  </div>
                  <Progress value={(conditionDistribution.B / Math.max(1, assessmentCount)) * 100} className="h-1 bg-gray-100" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Grade C (Poor)</span>
                    <span>{conditionDistribution.C}</span>
                  </div>
                  <Progress value={(conditionDistribution.C / Math.max(1, assessmentCount)) * 100} className="h-1 bg-gray-100" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Grade D (Bad)</span>
                    <span>{conditionDistribution.D}</span>
                  </div>
                  <Progress value={(conditionDistribution.D / Math.max(1, assessmentCount)) * 100} className="h-1 bg-gray-100" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="flex justify-between w-full text-xs">
                      <span>Priority 1 (Urgent)</span>
                      <span className="font-medium">{priorityDistribution["1"]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <div className="flex justify-between w-full text-xs">
                      <span>Priority 2 (Essential)</span>
                      <span className="font-medium">{priorityDistribution["2"]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <div className="flex justify-between w-full text-xs">
                      <span>Priority 3 (Desirable)</span>
                      <span className="font-medium">{priorityDistribution["3"]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <div className="flex justify-between w-full text-xs">
                      <span>Priority 4 (Long-term)</span>
                      <span className="font-medium">{priorityDistribution["4"]}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => setActiveTab('assessment')}
                    disabled={assessmentCount === 0}
                  >
                    View Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {isReserveFundStudy ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reserve Fund
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{formatCurrency(totalReplacementCost)}</div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Short Term (0-5 yrs)</span>
                      <span className="font-medium">{formatCurrency(replacementCostsByTimeframe.shortTerm)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Medium Term (5-15 yrs)</span>
                      <span className="font-medium">{formatCurrency(replacementCostsByTimeframe.mediumTerm)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Long Term (15+ yrs)</span>
                      <span className="font-medium">{formatCurrency(replacementCostsByTimeframe.longTerm)}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => setActiveTab('assessment')}
                      disabled={lifecycleCostCount === 0}
                    >
                      View Lifecycle Costs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(assessments) && assessments
                      .filter((assessment: any) => assessment.conditionRating === 'D' || assessment.priorityRating === '1')
                      .slice(0, 3)
                      .map((assessment: any, index: number) => {
                        const classification = Array.isArray(classifications) 
                          ? classifications.find((c: any) => c.id === assessment.classificationId) 
                          : null;
                        return (
                          <div key={index} className="border rounded-md p-2 text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium truncate max-w-[70%]" title={classification?.description || 'Unknown Asset'}>
                                {classification?.description || 'Unknown Asset'}
                              </span>
                              <Badge variant={assessment.conditionRating === 'D' ? 'destructive' : 'outline'}>
                                {assessment.conditionRating}-{assessment.priorityRating}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    
                    {(!Array.isArray(assessments) || assessments.filter((a: any) => a.conditionRating === 'D' || a.priorityRating === '1').length === 0) && (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No critical issues detected
                      </div>
                    )}
                    
                    {Array.isArray(assessments) && assessments.filter((a: any) => a.conditionRating === 'D' || a.priorityRating === '1').length > 3 && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('assessment')}>
                        View All Issues
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Asset Locations Tab */}
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Asset Locations Management</CardTitle>
              <CardDescription>
                Define the specific areas where assets are located within the property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleAssetLocationManager projectId={parseInt(id, 10)} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* NRM3 Framework Tab */}
        <TabsContent value="framework">
          <Card>
            <CardHeader>
              <CardTitle>NRM3 Classification Framework</CardTitle>
              <CardDescription>
                Select and classify assets according to the NRM3 standard and assign them to asset locations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <NRM3Framework 
                projectId={parseInt(id, 10)}
                yearOfConstruction={project?.yearOfConstruction}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Asset Condition Assessment</CardTitle>
              <CardDescription>
                Evaluate the condition and priority of each asset
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isReserveFundStudy ? (
                <div className="space-y-8">
                  <ConditionAssessment 
                    projectId={parseInt(id, 10)} 
                    auditType={project.reraAuditType as "reserve_fund_study" | "condition_survey"}
                  />
                  
                  {/* Reserve Fund Analysis is now handled directly in ConditionAssessment component */}
                </div>
              ) : (
                <ConditionAssessment 
                  projectId={parseInt(id, 10)} 
                  auditType={project.reraAuditType as "reserve_fund_study" | "condition_survey"}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>
                Generate and preview project reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPreview 
                projectId={parseInt(id, 10)} 
                auditType={project.reraAuditType as "reserve_fund_study" | "condition_survey"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </InspectionLayout>
  );
}
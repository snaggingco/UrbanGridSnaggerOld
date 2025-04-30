import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Project, Defect, Image as ImageType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import ReportEditor from "@/components/inspection/reports/ReportEditor";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertCircle,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  Clock,
  Clipboard,
  Download,
  FileText,
  Home,
  Info,
  Layers,
  List,
  Loader2,
  MapPin,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  User,
  X,
} from "lucide-react";

import InspectionLayout from "@/components/layouts/InspectionLayout";
import { Location as UILocation } from "@/components/inspection/snags/LocationTree";
import LocationTree from "@/components/inspection/snags/LocationTree";
import SnagList from "@/components/inspection/snags/SnagList";
import IntegratedSnagForm from "@/components/inspection/snags/IntegratedSnagForm";
import PhotoUploader from "@/components/inspection/snags/PhotoUploader";
import { Location as DBLocation } from "@shared/schema";

export default function ProjectDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [snagFormOpen, setSnagFormOpen] = useState(false);
  const [selectedSnagId, setSelectedSnagId] = useState<number | undefined>(undefined);
  const [photoUploaderOpen, setPhotoUploaderOpen] = useState(false);
  const [selectedDefectId, setSelectedDefectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportEditorOpen, setReportEditorOpen] = useState(false);
  const projectId = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setLocation("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId && !!user,
  });

  // Fetch defects
  const { data: defects, isLoading: defectsLoading } = useQuery<Defect[]>({
    queryKey: [`/api/projects/${projectId}/defects`],
    enabled: !!projectId && !!user,
  });

  // Fetch images
  const { data: images, isLoading: imagesLoading } = useQuery<ImageType[]>({
    queryKey: [`/api/projects/${projectId}/images`],
    enabled: !!projectId && !!user,
  });
  
  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery<DBLocation[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
    enabled: !!projectId && !!user,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest<Project>(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Status updated",
        description: "Project status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/projects/${projectId}/generate-report`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Report generated",
        description: "Inspection report has been generated successfully",
      });

      // Download the PDF report
      const reportUrl = `/api/generate-project-pdf/${projectId}`;
      window.open(reportUrl, "_blank");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate report",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setLocation("/login");
  }

  function formatDate(dateInput: string | Date | undefined | null) {
    if (!dateInput) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, options);
  }

  const handleAddSnag = () => {
    setSelectedSnagId(undefined);
    setSnagFormOpen(true);
  };

  const handleEditSnag = (snagId: number) => {
    setSelectedSnagId(snagId);
    setSnagFormOpen(true);
  };

  const handleUploadImages = (defectId: number) => {
    setSelectedDefectId(defectId);
    setPhotoUploaderOpen(true);
  };

  const handleLocationSelect = (locationId: string | number | null) => {
    setActiveLocationId(locationId as string);
    // Switch to the Snags tab when a location is selected on mobile
    if (isMobile) {
      setActiveTab("snags");
    }
  };

  // Calculate project stats
  const projectStats = defects ? {
    totalDefects: defects.length,
    openDefects: defects.filter(d => d.status === 'open').length,
    inProgressDefects: defects.filter(d => d.status === 'in_progress').length,
    resolvedDefects: defects.filter(d => d.status === 'resolved').length,
    criticalDefects: defects.filter(d => d.severity === 'critical').length,
    majorDefects: defects.filter(d => d.severity === 'major').length,
    minorDefects: defects.filter(d => d.severity === 'minor').length,
    totalPhotos: images?.length || 0,
    roomsWithIssues: new Set(defects.map(d => d.locationId).filter(Boolean)).size,
    totalRooms: locations?.length || 0,
  } : {
    totalDefects: 0,
    openDefects: 0,
    inProgressDefects: 0,
    resolvedDefects: 0,
    criticalDefects: 0,
    majorDefects: 0,
    minorDefects: 0,
    totalPhotos: 0,
    roomsWithIssues: 0,
    totalRooms: 0,
  };

  // Calculate progress percentage
  const progressPercentage = projectStats.totalDefects > 0
    ? Math.round((projectStats.resolvedDefects / projectStats.totalDefects) * 100)
    : 0;

  const getStatusColor = (status: string | undefined | null) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  // Convert DB locations to UI locations structure
  const hierarchicalLocations = useMemo(() => {
    if (!locations) return [];
    
    // Create UILocation objects with snag counts
    const locationsList: UILocation[] = locations.map(loc => {
      // Count snags for this location
      const snagCount = defects?.filter(d => {
        if ('locationId' in d && d.locationId) {
          return d.locationId === loc.id;
        } else {
          return d.location === loc.name;
        }
      }).length || 0;
      
      return {
        id: loc.id,
        name: loc.name,
        type: loc.type || "room",
        projectId: loc.projectId,
        parentId: loc.parentId,
        createdAt: loc.createdAt,
        snagCount
      };
    });
    
    return locationsList;
  }, [locations, defects]);
  
  const isLoading = projectLoading || defectsLoading || imagesLoading || locationsLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Create action button for generating report
  const actionButton = (
    <Button
      variant="default"
      size="sm"
      className="gap-1 bg-green-600 hover:bg-green-700"
      onClick={() => setReportEditorOpen(true)}
      disabled={projectStats.totalDefects === 0}
    >
      <FileText className="h-4 w-4 mr-1" />
      Generate Report
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>
          {project ? `${project.name} - Inspection` : "Project Details - UrbanGrid"}
        </title>
        <meta
          name="description"
          content="UrbanGrid inspection project details and defect management"
        />
      </Helmet>

      <InspectionLayout 
        title={project ? project.name : "Project Details"} 
        description={project ? `${project.propertyType} in ${project.location}` : "Loading project details..."}
        showBackButton={true}
        backUrl="/inspection"
        actionButton={actionButton}
      >
        {/* Project status information */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {project && (
                <Badge className={getStatusColor(project.status)}>
                  {project.status === "in_progress" 
                    ? "In Progress" 
                    : project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || "Pending"}
                </Badge>
              )}
              
              {project && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200 hover:bg-gray-100">
                      <Settings className="h-4 w-4 mr-2 text-gray-600" />
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => statusMutation.mutate("pending")}
                      disabled={statusMutation.isPending || project.status === "pending"}
                    >
                      <Clock className="h-4 w-4 mr-2 text-amber-500" />
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => statusMutation.mutate("in_progress")}
                      disabled={statusMutation.isPending || project.status === "in_progress"}
                    >
                      <Pencil className="h-4 w-4 mr-2 text-blue-500" />
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => statusMutation.mutate("completed")}
                      disabled={statusMutation.isPending || project.status === "completed"}
                    >
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={handleAddSnag}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Snag
              </Button>
            </div>
            
            {/* Project metadata in a cleaner, more branded arrangement */}
            {project && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">{project.clientName}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{formatDate(project.date)}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-gray-700">{project.location}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                  <Building className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-700">{project.propertyType}</span>
                </div>
              </div>
            )}
        </div>

            {isLoading ? (
              <div className="h-6 w-64 bg-gray-200 animate-pulse rounded"></div>
            ) : project ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status === "in_progress" 
                        ? "In Progress" 
                        : project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || "Pending"}
                    </Badge>
                  </div>
                  
                  {/* Project metadata in a cleaner, more branded arrangement */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">{project.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{formatDate(project.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                      <Building className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-700">{project.propertyType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200 hover:bg-gray-100">
                        <Settings className="h-4 w-4 mr-2 text-gray-600" />
                        Project Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => statusMutation.mutate("pending")}
                        disabled={statusMutation.isPending || project.status === "pending"}
                      >
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => statusMutation.mutate("in_progress")}
                        disabled={statusMutation.isPending || project.status === "in_progress"}
                      >
                        <Pencil className="h-4 w-4 mr-2 text-blue-500" />
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => statusMutation.mutate("completed")}
                        disabled={statusMutation.isPending || project.status === "completed"}
                      >
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={handleAddSnag}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Snag
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setReportEditorOpen(true)}
                    disabled={projectStats.totalDefects === 0}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Generate Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <p>Project not found or you don't have access.</p>
              </div>
            )}

        {/* Project Progress Bar - Enhanced with gradient and visuals */}
        {project && (
          <div className="bg-white border-b shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Inspection Progress</span>
                  <Badge variant="outline" 
                    className={`text-xs font-medium ${
                      progressPercentage > 75 ? 'bg-green-50 text-green-700 border-green-200' : 
                      progressPercentage > 30 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {progressPercentage}% Complete
                  </Badge>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-50 text-gray-700">
                  {projectStats.resolvedDefects} of {projectStats.totalDefects} issues resolved
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className={`h-2.5 ${
                  progressPercentage > 75 ? 'bg-green-100' : 
                  progressPercentage > 30 ? 'bg-blue-100' : 
                  'bg-amber-100'
                }`} 
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : project ? (
            <>
              {/* Mobile tabs navigation */}
              {isMobile && (
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="overview">
                      <Info className="h-4 w-4 mr-1" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="rooms">
                      <Home className="h-4 w-4 mr-1" />
                      Rooms
                    </TabsTrigger>
                    <TabsTrigger value="snags">
                      <List className="h-4 w-4 mr-1" />
                      Snags
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Improved main content layout - fluid and responsive */}
              <div className="flex flex-col space-y-6">
                {/* Project quick info card - improved layout with visual grouping */}
                <Card className="overflow-hidden border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 py-3 px-4 border-b border-gray-100">
                    <CardTitle className="text-sm text-gray-600">Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {/* Project Location prominently displayed */}
                      <div className="col-span-2 md:col-span-3 lg:col-span-2 p-3 bg-blue-50 rounded-md border border-blue-100 shadow-sm">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="font-medium text-blue-800">Project Location</span>
                        </div>
                        <p className="text-sm ml-5 text-blue-700">{project.location}</p>
                      </div>
                      
                      {/* Key project info with enhanced visual styling */}
                      <div className="flex flex-col justify-center p-2 bg-gray-50 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Client</span>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-blue-500 mr-1.5" />
                          <span className="text-sm font-medium text-gray-800 truncate">{project.clientName}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center p-2 bg-gray-50 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Property Type</span>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-purple-500 mr-1.5" />
                          <span className="text-sm font-medium text-gray-800 truncate">{project.propertyType}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center p-2 bg-gray-50 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Inspection Date</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-green-500 mr-1.5" />
                          <span className="text-sm font-medium text-gray-800">{formatDate(project.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center p-2 bg-gray-50 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Status</span>
                        <Badge className={`${getStatusColor(project.status)} font-medium py-1`}>
                          {project.status === "in_progress" 
                            ? "In Progress" 
                            : project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Main content flex layout - adapts to screen size with better proportions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left sidebar with combined project stats and locations - increased width */}
                  <div className={cn(
                    "lg:col-span-4 space-y-6",
                    isMobile && (activeTab !== "overview" && activeTab !== "rooms") && "hidden"
                  )}>
                    {/* Project Stats Card - enhanced with better visual hierarchy */}
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 bg-gray-50 py-4 px-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-gray-600">Inspection Summary</CardTitle>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 py-1">
                            {projectStats.totalDefects} Total Snags
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-5 px-5">
                        {/* Progress bar with enhanced styling */}
                        <div className="mb-5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                              Completion
                            </span>
                            <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-gray-100">
                              {projectStats.totalDefects > 0 
                                ? Math.round((projectStats.resolvedDefects / projectStats.totalDefects) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={projectStats.totalDefects > 0 
                              ? (projectStats.resolvedDefects / projectStats.totalDefects) * 100 
                              : 0} 
                            className={`h-2.5 ${
                              progressPercentage > 75 ? 'bg-green-100' : 
                              progressPercentage > 30 ? 'bg-blue-100' : 
                              'bg-amber-100'
                            }`} 
                          />
                        </div>
                        
                        {/* Snag counts with improved visual structure */}
                        <div className="mb-5">
                          <h3 className="text-sm font-medium mb-3 flex items-center">
                            <Layers className="h-4 w-4 mr-1.5 text-gray-600" />
                            Snag Status
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex items-center p-3 rounded-md border border-gray-100 bg-gray-50">
                              <div className="w-3.5 h-3.5 rounded-full bg-gray-500 mr-2.5"></div>
                              <span className="text-sm font-medium text-gray-700">Total</span>
                              <Badge variant="secondary" className="ml-auto text-sm shadow-sm">{projectStats.totalDefects}</Badge>
                            </div>
                            <div className="flex items-center p-3 rounded-md border border-red-100 bg-red-50">
                              <div className="w-3.5 h-3.5 rounded-full bg-red-500 mr-2.5"></div>
                              <span className="text-sm font-medium text-red-700">Open</span>
                              <Badge variant="outline" className="ml-auto text-sm bg-white text-red-700 border-red-200">{projectStats.openDefects}</Badge>
                            </div>
                            <div className="flex items-center p-3 rounded-md border border-blue-100 bg-blue-50">
                              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 mr-2.5"></div>
                              <span className="text-sm font-medium text-blue-700">In Progress</span>
                              <Badge variant="outline" className="ml-auto text-sm bg-white text-blue-700 border-blue-200">{projectStats.inProgressDefects}</Badge>
                            </div>
                            <div className="flex items-center p-3 rounded-md border border-green-100 bg-green-50">
                              <div className="w-3.5 h-3.5 rounded-full bg-green-500 mr-2.5"></div>
                              <span className="text-sm font-medium text-green-700">Resolved</span>
                              <Badge variant="outline" className="ml-auto text-sm bg-white text-green-700 border-green-200">{projectStats.resolvedDefects}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Severity distribution with enhanced visuals */}
                        <div>
                          <h3 className="text-sm font-medium mb-3 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1.5 text-gray-600" />
                            Severity
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center p-3 py-4 rounded-md border border-red-200 bg-red-50">
                              <span className="text-sm text-red-700 font-medium">Critical</span>
                              <span className="text-2xl font-bold text-red-800 mt-2">{projectStats.criticalDefects}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 py-4 rounded-md border border-amber-200 bg-amber-50">
                              <span className="text-sm text-amber-700 font-medium">Major</span>
                              <span className="text-2xl font-bold text-amber-800 mt-2">{projectStats.majorDefects}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 py-4 rounded-md border border-green-200 bg-green-50">
                              <span className="text-sm text-green-700 font-medium">Minor</span>
                              <span className="text-2xl font-bold text-green-800 mt-2">{projectStats.minorDefects}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Room stats card - enhanced with visual improvements */}
                    <Card className="mt-6 border-gray-200 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 bg-gray-50 py-4 px-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-gray-600 flex items-center">
                            <Home className="h-4 w-4 mr-1.5 text-blue-500" />
                            Rooms & Areas
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveLocationId(null)}
                            className="h-7 px-2 text-xs"
                            disabled={!activeLocationId}
                          >
                            <X className={`h-3.5 w-3.5 mr-1 ${!activeLocationId ? 'text-gray-400' : 'text-gray-600'}`} />
                            Clear Filter
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-5 px-5">
                        <div className="mb-5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-4 rounded-md text-center border border-blue-100 shadow-sm">
                              <div className="text-3xl font-bold text-blue-800">{projectStats.totalRooms}</div>
                              <div className="text-xs font-medium text-blue-600 mt-2">Total Rooms</div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-md text-center border border-amber-100 shadow-sm">
                              <div className="text-3xl font-bold text-amber-800">{projectStats.roomsWithIssues}</div>
                              <div className="text-xs font-medium text-amber-600 mt-2">With Issues</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Divider before location tree */}
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-xs text-gray-500">Select to filter</span>
                          </div>
                        </div>
                        
                        {/* Location tree with improved styling and increased padding */}
                        <div className={cn(
                          "mt-2 border border-gray-200 rounded-md p-4 bg-white shadow-sm",
                          isMobile && activeTab !== "rooms" && "hidden"
                        )}>
                          <LocationTree 
                            locations={hierarchicalLocations} 
                            activeLocationId={activeLocationId}
                            onSelectLocation={handleLocationSelect}
                            projectId={projectId}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main snag list - expanded to take more space with enhanced styling */}
                  <div className={cn(
                    "lg:col-span-8",
                    isMobile && activeTab !== "snags" && "hidden"
                  )}>
                    {/* Snag list card container with header */}
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 bg-gray-50 py-4 px-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-gray-600 flex items-center">
                            <Clipboard className="h-4 w-4 mr-1.5 text-purple-500" />
                            Inspection Snags
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            onClick={handleAddSnag}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Snag
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {/* Selected location indicator - enhanced visual */}
                      {activeLocationId && hierarchicalLocations.length > 0 && (
                        <div className="mx-5 mt-5 p-3 bg-blue-50 rounded-md border border-blue-100 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                Viewing snags in: <span className="font-semibold">{
                                  hierarchicalLocations.find(l => l.id.toString() === activeLocationId)?.name ||
                                  "Selected Room"
                                }</span>
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setActiveLocationId(null)}
                              className="h-7 px-2 text-blue-700 hover:bg-blue-100"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Clear
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <CardContent className={`p-0 ${activeLocationId ? 'pt-0' : 'pt-5'}`}>
                        <div className="px-5 pb-5 pt-5">
                          <SnagList 
                            projectId={projectId}
                            location={activeLocationId}
                            onAddSnag={handleAddSnag}
                            onEditSnag={handleEditSnag}
                            onUploadImages={handleUploadImages}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
              <p className="text-gray-600 text-center max-w-md mb-6">
                The project you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => setLocation("/inspection")}>
                Back to Projects
              </Button>
            </div>
          )}
        </main>
      </InspectionLayout>

      {/* Integrated Snag form dialog */}
      <IntegratedSnagForm
        open={snagFormOpen}
        onOpenChange={setSnagFormOpen}
        projectId={projectId}
        snagId={selectedSnagId}
        locations={hierarchicalLocations}
      />

      {/* Photo uploader dialog */}
      <PhotoUploader
        open={photoUploaderOpen}
        onOpenChange={setPhotoUploaderOpen}
        projectId={projectId}
        defectId={selectedDefectId}
      />

      {/* Report Editor dialog */}
      {project && (
        <ReportEditor
          open={reportEditorOpen}
          onOpenChange={setReportEditorOpen}
          projectId={projectId}
          projectName={project.name}
        />
      )}
    </>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Project } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

// Import our new SimpleProjectDialog component instead of the separate ones
import SimpleProjectDialog from "@/components/inspection/SimpleProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  FileText,
  Home,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Building,
  CheckCircle,
  Clipboard,
  ClipboardList,
  Edit,
} from "lucide-react";
import InspectionLayout from "@/components/layouts/InspectionLayout";

export default function ProjectsPage() {
  const [location, setLocation] = useLocation();
  const [simpleProjectDialogOpen, setSimpleProjectDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  
  // State for edit project dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [statusValue, setStatusValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check URL parameters to see if we should auto-open the project creation dialog
  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldCreate = url.searchParams.get("create") === "true";
    
    if (shouldCreate) {
      // Open the simplified project dialog directly
      setSimpleProjectDialogOpen(true);
      
      // Clean up the URL (remove the parameters without triggering a page reload)
      window.history.replaceState({}, document.title, "/inspection/projects");
    }
  }, [location]);
  
  // Fetch projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  function formatDate(dateInput: string | Date | undefined | null) {
    if (!dateInput) return "Not set";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, options);
  }
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: {id: number, status: string}) => {
      return apiRequest(`/api/projects/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: data.status }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Project status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditDialogOpen(false);
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
      setIsUpdating(false);
      console.error("Error updating project:", error);
    },
  });
  
  // Handle edit project dialog
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setStatusValue(project.status);
    setEditDialogOpen(true);
  };
  
  // Handle update project
  const handleUpdateProject = () => {
    if (!currentProject) return;
    
    setIsUpdating(true);
    updateProjectMutation.mutate({
      id: currentProject.id,
      status: statusValue
    });
  };
  
  // Handle generate report
  const handleGenerateReport = (project: Project) => {
    // Redirect to the appropriate report page based on project type
    if (project.projectType === "rera_audit") {
      // For RERA audit projects, navigate to the project page with reports tab active
      setLocation(`/inspection/rera-project/${project.id}?tab=reports`);
    } else {
      // Open report in new tab for regular projects
      window.open(`/api/generate-project-pdf/${project.id}`, "_blank");
    }
  };
  
  // Filter projects
  const filteredProjects = projects
    ? projects
        .filter(project => {
          // Status filter
          if (statusFilter !== "all" && project.status !== statusFilter) {
            return false;
          }
          
          // Property type filter
          if (propertyTypeFilter !== "all" && project.propertyType !== propertyTypeFilter) {
            return false;
          }
          
          // Search query
          if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
              project.name.toLowerCase().includes(query) ||
              project.clientName.toLowerCase().includes(query) ||
              project.location.toLowerCase().includes(query) ||
              project.propertyType.toLowerCase().includes(query)
            );
          }
          
          return true;
        })
    : [];
    
  // Get unique property types
  const propertyTypes = projects 
    ? Array.from(new Set(projects.map(p => p.propertyType)))
    : [];
    
  return (
    <InspectionLayout>
      <SEO
        title="Projects - Inspection System"
        description="Manage property inspection projects with our powerful inspection system for surveyors and property inspectors."
        noIndex={true}
        canonicalUrl="https://www.snagging.me/inspection/projects"
      />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage all your property inspection projects
            </p>
          </div>
          
          <Button 
            onClick={() => setSimpleProjectDialogOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Projects</CardTitle>
            <CardDescription>
              Narrow down projects by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder="Search by name, client, location..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={propertyTypeFilter} 
                onValueChange={setPropertyTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Property Types</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              {filteredProjects.length} projects found
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPropertyTypeFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
        
        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Project List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading projects...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Failed to load projects</h3>
                <p className="text-gray-500">Please try again or contact support</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/projects"] })}
                >
                  Retry
                </Button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {searchQuery || statusFilter !== "all" || propertyTypeFilter !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium">No matching projects</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setPropertyTypeFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium">No projects found</h3>
                    <p className="text-gray-500 mb-4">Create your first inspection project to get started</p>
                    <Button onClick={() => setSimpleProjectDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> New Project
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inspection Type</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow 
                        key={project.id}
                        onClick={() => {
                          // Route based on project type and RERA audit subtype
                          if (project.projectType === "rera_audit") {
                            // For AMC Cost Allocation projects, use the AMC allocation route
                            if (project.reraAuditType === "amc_cost_allocation") {
                              setLocation(`/inspection/amc-allocation/${project.id}`);
                            } else {
                              // For other RERA audit types, use the standard RERA project route
                              setLocation(`/inspection/rera-project/${project.id}`);
                            }
                          } else {
                            // For standard snagging inspections
                            setLocation(`/inspection/project/${project.id}`);
                          }
                        }}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                            {project.propertyType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {project.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(project.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              project.status === "completed" ? "default" :
                              project.status === "in_progress" ? "secondary" : 
                              "outline"
                            }
                          >
                            {project.status === "in_progress" ? "In Progress" : 
                              project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.projectType === "rera_audit" ? (
                            <Badge variant="outline" className="font-medium">
                              {project.reraAuditType === "reserve_fund_study" && "Reserve Fund Study"}
                              {project.reraAuditType === "condition_survey" && "Condition Survey"}
                              {project.reraAuditType === "amc_cost_allocation" && "AMC Cost Allocation"}
                              {!project.reraAuditType && "RERA Audit"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-medium">
                              Snagging Inspection
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                // Route to the correct inspection interface based on project type
                                if (project.projectType === "rera_audit") {
                                  setLocation(`/inspection/rera-project/${project.id}`);
                                } else {
                                  setLocation(`/inspection/project/${project.id}`);
                                }
                              }}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateReport(project);
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Simple project dialog that combines project type selection and form */}
      <SimpleProjectDialog 
        open={simpleProjectDialogOpen} 
        onOpenChange={(open) => {
          setSimpleProjectDialogOpen(open);
          
          if (!open) {
            // Clean up URL when dialog is closed
            window.history.replaceState({}, document.title, "/inspection/projects");
          }
        }}
      />
      
      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project status and information
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentProject && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{currentProject.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentProject.clientName} | {currentProject.location}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusValue} onValueChange={setStatusValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InspectionLayout>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Project, Defect } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowUpRight,
  Building,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  LineChart,
  Loader2,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import InspectionLayout from "@/components/layouts/InspectionLayout";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewProjectDialog from "@/components/inspection/NewProjectDialog";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [projectTypeDialogOpen, setProjectTypeDialogOpen] = useState(false);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Fetch recent defects
  const { data: recentDefects, isLoading: defectsLoading } = useQuery<Defect[]>({
    queryKey: ["/api/defects", { limit: 5 }],
  });
  
  // Calculate project statistics
  const projectStats = {
    total: projects?.length || 0,
    pending: projects?.filter(p => p.status === "pending").length || 0,
    inProgress: projects?.filter(p => p.status === "in_progress").length || 0,
    completed: projects?.filter(p => p.status === "completed").length || 0,
    rera: projects?.filter(p => p.projectType === "rera_audit").length || 0,
    snagging: projects?.filter(p => p.projectType === "snagging").length || 0,
  };
  
  // Calculate completion percentage
  const completionPercentage = 
    projectStats.total > 0 
      ? Math.round((projectStats.completed / projectStats.total) * 100) 
      : 0;
  
  // Format dates
  function formatDate(dateInput: string | Date | undefined | null) {
    if (!dateInput) return "Not set";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, options);
  }
  
  // Get recent projects (up to 5)
  const recentProjects = projects
    ? [...projects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];
  
  return (
    <InspectionLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your inspection projects and activities
            </p>
          </div>
          
          <Button 
            onClick={() => setProjectTypeDialogOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <h3 className="text-3xl font-bold">{projectStats.total}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-2 text-xs items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-500">Snagging: {projectStats.snagging}</span>
                </div>
                <div className="flex space-x-2 text-xs items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-500">RERA: {projectStats.rera}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <h3 className="text-3xl font-bold">{projectStats.pending}</h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={projectStats.total > 0 ? (projectStats.pending / projectStats.total) * 100 : 0} 
                  className="h-2 bg-yellow-100"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <h3 className="text-3xl font-bold">{projectStats.inProgress}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={projectStats.total > 0 ? (projectStats.inProgress / projectStats.total) * 100 : 0} 
                  className="h-2 bg-blue-100"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <h3 className="text-3xl font-bold">{projectStats.completed}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={projectStats.total > 0 ? (projectStats.completed / projectStats.total) * 100 : 0}
                  className="h-2 bg-green-100" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Completion Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Progress</CardTitle>
            <CardDescription>Overall progress of inspection projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Projects and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your most recently created inspection projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No projects created yet</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setProjectTypeDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center space-x-4 cursor-pointer rounded-md p-2 hover:bg-muted transition-colors"
                      onClick={() => {
                        if (project.projectType === "rera_audit") {
                          setLocation(`/inspection/rera-audit/${project.id}`);
                        } else {
                          setLocation(`/inspection/project/${project.id}`);
                        }
                      }}
                    >
                      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                        {project.projectType === "rera_audit" ? (
                          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-purple-600" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <Badge variant={
                            project.status === "completed" ? "default" :
                            project.status === "in_progress" ? "secondary" : 
                            "outline"
                          }>
                            {project.status === "in_progress" ? "In Progress" : 
                              project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {formatDate(project.date)}
                          <MapPin className="h-3.5 w-3.5 ml-3 mr-1.5" />
                          <span className="truncate">{project.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setLocation("/inspection/projects")}
                  >
                    View All Projects <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Defects */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Defects</CardTitle>
              <CardDescription>
                Recently reported issues across your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {defectsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !recentDefects || recentDefects.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No defects reported yet</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setLocation("/inspection/defects")}
                  >
                    View Defects
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDefects.map((defect) => (
                    <div 
                      key={defect.id}
                      className="flex items-start space-x-4 cursor-pointer rounded-md p-2 hover:bg-muted transition-colors"
                      onClick={() => setLocation(`/inspection/defect/${defect.id}`)}
                    >
                      <div className="h-10 w-10 bg-red-100 rounded-full flex-shrink-0 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium line-clamp-1">{defect.title}</p>
                          <Badge 
                            variant="outline"
                            className="ml-2 flex-shrink-0"
                          >
                            {defect.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{defect.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <span>
                            Project: {projects?.find(p => p.id === defect.projectId)?.name.substring(0, 30) || `Project #${defect.projectId}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setLocation("/inspection/defects")}
                  >
                    View All Defects <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <NewProjectDialog 
        open={projectTypeDialogOpen}
        onOpenChange={setProjectTypeDialogOpen}
      />
    </InspectionLayout>
  );
}
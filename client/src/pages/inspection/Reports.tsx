import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Project, Report } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Building,
  Calendar,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Printer,
  Search,
  Share2,
  ClipboardList,
  FileCheck,
  FileSpreadsheet,
} from "lucide-react";
import InspectionLayout from "@/components/layouts/InspectionLayout";

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  
  // Fetch reports and projects
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });
  
  const { data: projects } = useQuery<Project[]>({
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
  
  // Find project info
  const getProjectInfo = (projectId: number) => {
    const project = projects?.find(p => p.id === projectId);
    return {
      name: project ? project.name : `Project #${projectId}`,
      type: project?.projectType || "snagging",
      reraAuditType: project?.reraAuditType || null
    };
  };
  
  // Filter reports
  const filteredReports = reports
    ? reports
        .filter(report => {
          // Project filter
          if (projectFilter !== "all" && report.projectId.toString() !== projectFilter) {
            return false;
          }
          
          // Search query
          if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const projectInfo = getProjectInfo(report.projectId);
            const projectName = projectInfo.name.toLowerCase();
            
            return (
              projectName.includes(query) ||
              report.id.toString().includes(query)
            );
          }
          
          return true;
        })
    : [];
    
  return (
    <InspectionLayout>
      <Helmet>
        <title>Reports - Inspection System</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              View, download and share your inspection reports
            </p>
          </div>
          
          <Button 
            onClick={() => setLocation("/inspection/report-settings")}
            variant="outline"
            className="shrink-0"
          >
            Report Settings
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Find Reports</CardTitle>
            <CardDescription>
              Search and filter through your generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder="Search by project name or report ID..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={projectFilter} 
                onValueChange={setProjectFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              {filteredReports.length} reports found
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setProjectFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
        
        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>
              Inspection reports ready for download or sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading reports...</span>
              </div>
            ) : reportsError ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Failed to load reports</h3>
                <p className="text-gray-500">Please try again or contact support</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/reports"] })}
                >
                  Retry
                </Button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {searchQuery || projectFilter !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium">No matching reports</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setProjectFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium">No reports found</h3>
                    <p className="text-gray-500 mb-4">Complete a project inspection and generate a report to get started</p>
                    <Button onClick={() => setLocation("/inspection/projects")}>
                      Go to Projects
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Date Generated</TableHead>
                      <TableHead>Defects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow 
                        key={report.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {projects?.find(p => p.id === report.projectId)?.projectType === "rera_audit" ? (
                              <ClipboardList className="h-4 w-4 mr-2 text-purple-600" />
                            ) : (
                              <Building className="h-4 w-4 mr-2 text-blue-600" />
                            )}
                            {getProjectInfo(report.projectId).name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(report.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const project = projects?.find(p => p.id === report.projectId);
                            if (project?.projectType === "rera_audit") {
                              return (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                  {project.reraAuditType === "condition_survey" ? "Condition Survey" : "Reserve Fund Study"}
                                </Badge>
                              );
                            } else {
                              return (
                                <Badge variant="outline">
                                  {project?.defectCount || "N/A"} defects
                                </Badge>
                              );
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="default"
                          >
                            {report.status === "draft" ? "Draft" : "Final"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/api/reports/${report.id}/download`, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(`/inspection/report/${report.id}/preview`, '_blank')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`/api/reports/${report.id}/print`, '_blank')}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Need to customize your reports?</h3>
                <p className="text-muted-foreground mb-4">
                  Adjust your report templates, branding, and content settings to create professional reports that represent your business.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/inspection/report-settings")}
                >
                  Customize Report Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InspectionLayout>
  );
}
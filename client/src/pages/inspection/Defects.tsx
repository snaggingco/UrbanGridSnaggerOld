import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Defect } from "@shared/schema";
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
  AlertTriangle,
  Building,
  Calendar,
  EyeIcon,
  FileText,
  Home,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ThumbsUp,
} from "lucide-react";
import InspectionLayout from "@/components/layouts/InspectionLayout";

export default function DefectsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Fetch defects
  const { data: defects, isLoading, error } = useQuery<Defect[]>({
    queryKey: ["/api/defects"],
  });
  
  // Filter defects
  const filteredDefects = defects
    ? defects
        .filter(defect => {
          // Status filter
          if (statusFilter !== "all" && defect.status !== statusFilter) {
            return false;
          }
          
          // Severity filter
          if (severityFilter !== "all" && defect.severity !== severityFilter) {
            return false;
          }
          
          // Category filter
          if (categoryFilter !== "all" && categoryFilter !== defect.category) {
            return false;
          }
          
          // Search query
          if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
              defect.title.toLowerCase().includes(query) ||
              defect.description.toLowerCase().includes(query) ||
              defect.location.toLowerCase().includes(query)
            );
          }
          
          return true;
        })
    : [];
    
  // Get unique categories
  const categories = defects 
    ? Array.from(new Set(defects
        .filter(d => d.category !== null)
        .map(d => d.category as string)))
    : [];
    
  return (
    <InspectionLayout>
      <Helmet>
        <title>Defects - Inspection System</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Defects</h1>
            <p className="text-muted-foreground">
              Track and manage property defects across all projects
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Defects</CardTitle>
            <CardDescription>
              Narrow down defects by status, severity, and category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder="Search defects..." 
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={severityFilter} 
                onValueChange={setSeverityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              {filteredDefects.length} defects found
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSeverityFilter("all");
                setCategoryFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Defects</p>
                  <h3 className="text-3xl font-bold">{defects?.length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Open</p>
                  <h3 className="text-3xl font-bold">{defects?.filter(d => d.status === "open").length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <h3 className="text-3xl font-bold">{defects?.filter(d => d.status === "in_progress").length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                  <h3 className="text-3xl font-bold">{defects?.filter(d => d.status === "resolved").length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Defects Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Defects</CardTitle>
            <CardDescription>
              View and manage defects from all inspection projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading defects...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Failed to load defects</h3>
                <p className="text-gray-500">Please try again or contact support</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/defects"] })}
                >
                  Retry
                </Button>
              </div>
            ) : filteredDefects.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {searchQuery || statusFilter !== "all" || severityFilter !== "all" || categoryFilter !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium">No matching defects</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSeverityFilter("all");
                        setCategoryFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium">No defects found</h3>
                    <p className="text-gray-500 mb-4">Create a new project and add defects to get started</p>
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
                      <TableHead>Title</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDefects.map((defect) => (
                      <TableRow 
                        key={defect.id}
                        onClick={() => setLocation(`/inspection/defect/${defect.id}`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{defect.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            Project #{defect.projectId}
                          </div>
                        </TableCell>
                        <TableCell>{defect.location}</TableCell>
                        <TableCell>
                          {defect.category 
                            ? defect.category.charAt(0).toUpperCase() + defect.category.slice(1) 
                            : "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              defect.severity === "critical" ? "destructive" :
                              defect.severity === "high" ? "destructive" :
                              defect.severity === "medium" ? "secondary" : 
                              "outline"
                            }
                          >
                            {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              defect.status === "resolved" ? "default" :
                              defect.status === "in_progress" ? "secondary" : 
                              "outline"
                            }
                          >
                            {defect.status === "in_progress" ? "In Progress" : 
                              defect.status.charAt(0).toUpperCase() + defect.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{defect.photoUrls?.length || 0}</span>
                          </div>
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
                                setLocation(`/inspection/defect/${defect.id}`);
                              }}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Defect
                              </DropdownMenuItem>
                              {defect.status !== "resolved" && (
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                              )}
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
    </InspectionLayout>
  );
}
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArchiveIcon,
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Hammer,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Project } from "@shared/schema";

// This would come from your API
export interface Snag {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'requires_contractor' | 'completed' | 'rejected' | string;
  severity: 'critical' | 'major' | 'minor' | 'cosmetic' | string;
  category: string;
  location: string;
  locationId?: number | null; // Reference to the location/room ID
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  // Advanced Snagging Module fields
  priority?: 'high' | 'medium' | 'low' | string;
  assignedTeam?: string;
  estimatedCost?: string;
  subCategory?: string;
  remedialAction?: string;
  inspectorNotes?: string;
  clientVisible?: boolean;
  images?: Array<{
    id: number;
    url: string;
    isAnnotated?: boolean;
  }>;
}

interface SnagListProps {
  projectId: number;
  location?: string | number | null;
  onAddSnag: () => void;
  onEditSnag: (snagId: number) => void;
  onUploadImages: (snagId: number) => void;
}

export default function SnagList({
  projectId,
  location,
  onAddSnag,
  onEditSnag,
  onUploadImages
}: SnagListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reference to the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Add scroll event listener to show/hide the top shadow
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const topShadow = scrollContainer.parentElement?.querySelector('.scroll-shadow-top') as HTMLElement;
      if (topShadow) {
        if (scrollContainer.scrollTop > 20) {
          topShadow.style.opacity = '1';
        } else {
          topShadow.style.opacity = '0';
        }
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch snags data
  const { data: snags, isLoading, error } = useQuery<Snag[]>({
    queryKey: [`/api/projects/${projectId}/defects`, { location: location }],
    enabled: !!projectId,
  });

  // Get project details to know the project location
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  // Mutation for updating snag status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ defectId, status }: { defectId: number, status: string }) => {
      return apiRequest(`/api/projects/${projectId}/defects/${defectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // Invalidate cached snag list to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/defects`] 
      });
    },
    onError: (error) => {
      console.error('Failed to update status:', error);
      toast({
        title: 'Status update failed',
        description: 'The snag status could not be updated. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Function to handle status change from dropdown menu
  const handleStatusChange = (defectId: number, newStatus: string) => {
    toast({
      title: `Updating status to ${formatStatus(newStatus)}`,
      description: 'Please wait...',
    });
    
    updateStatusMutation.mutate({ defectId, status: newStatus }, {
      onSuccess: (data) => {
        toast({
          title: 'Status updated',
          description: `Snag is now ${formatStatus(newStatus)}`,
          variant: 'default',
        });
      }
    });
  };

  // Filter snags based on search and filters
  const filteredSnags = snags
    ? snags.filter(snag => {
        // If location ID is specified, only show defects for that room
        if (location) {
          // Skip the filter if we don't have location info in the defect
          if (!snag.locationId && !snag.location) {
            return false;
          }
          
          // Check by locationId if available
          if (snag.locationId !== undefined && snag.locationId !== null) {
            return snag.locationId.toString() === location.toString();
          }
          
          // Fallback to location name matching (legacy)
          return snag.location === location;
        }
        
        // Status filter
        if (statusFilter !== "all" && snag.status !== statusFilter) {
          return false;
        }
        
        // Severity filter
        if (severityFilter !== "all" && snag.severity !== severityFilter) {
          return false;
        }
        
        // Category filter
        if (categoryFilter !== "all" && snag.category !== categoryFilter) {
          return false;
        }
        
        // Tab filter
        if (currentTab === "open" && snag.status === "resolved") {
          return false;
        }
        if (currentTab === "resolved" && snag.status !== "resolved") {
          return false;
        }
        
        // Search query
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          return (
            snag.title.toLowerCase().includes(query) ||
            snag.description.toLowerCase().includes(query) ||
            snag.category.toLowerCase().includes(query) ||
            (snag.location && snag.location.toLowerCase().includes(query))
          );
        }
        
        return true;
      })
    : [];

  // Calculate statistics
  const stats = snags ? {
    total: snags.length,
    open: snags.filter(s => s.status === "open").length,
    inProgress: snags.filter(s => s.status === "in_progress").length,
    resolved: snags.filter(s => s.status === "resolved").length,
    critical: snags.filter(s => s.severity === "critical").length,
    major: snags.filter(s => s.severity === "major").length,
    minor: snags.filter(s => s.severity === "minor").length,
  } : {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    major: 0,
    minor: 0,
  };

  // Progress percentage
  const progressPercentage = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  function getSeverityColor(severity: string | undefined | null) {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "minor":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cosmetic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusColor(status: string | undefined | null) {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "requires_contractor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusIcon(status: string | undefined | null) {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "requires_contractor":
        return <SlidersHorizontal className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <Trash2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  }
  
  function formatSeverity(severity: string | undefined | null) {
    if (!severity) return "Unknown";
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }
  
  function formatStatus(status: string | undefined | null) {
    if (!status) return "Unknown";
    return status === "in_progress" 
      ? "In Progress" 
      : status.charAt(0).toUpperCase() + status.slice(1);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Generate unique categories for filter
  const categories = snags
    ? Array.from(new Set(snags.map(s => s.category)))
    : [];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Snags</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ArchiveIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold">{stats.open + stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Critical Issues</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-medium">Resolution Progress</h3>
              <p className="text-xs text-gray-500">
                {stats.resolved} of {stats.total} snags resolved
              </p>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search snags..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="requires_contractor">Requires Contractor</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Severity</SelectLabel>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="cosmetic">Cosmetic</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" className="gap-1" onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setSeverityFilter("all");
            setCategoryFilter("all");
          }}>
            <Filter className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Tabs and Add Snag Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="all">All Snags</TabsTrigger>
            <TabsTrigger value="open">Open ({stats.open + stats.inProgress})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button className="mt-3 sm:mt-0 gap-1" onClick={onAddSnag}>
          <Plus className="h-4 w-4" />
          Add Snag
        </Button>
      </div>

      {/* Snags List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load snags</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              There was an error loading the snag data. Please try again or contact support.
            </p>
            <Button variant="outline">Retry</Button>
          </CardContent>
        </Card>
      ) : filteredSnags.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
            <ArchiveIcon className="h-10 w-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all" || categoryFilter !== "all"
                ? "No matching snags found"
                : location
                  ? "No snags in this location"
                  : "No snags recorded yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Start by adding snags to track issues and defects"}
            </p>
            <div className="flex gap-2">
              {(searchQuery || statusFilter !== "all" || severityFilter !== "all" || categoryFilter !== "all") && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSeverityFilter("all");
                  setCategoryFilter("all");
                }}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={onAddSnag}>
                <Plus className="h-4 w-4 mr-1" />
                Add Snag
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden h-full shadow-md">
          <CardHeader className="py-4 border-b sticky top-0 z-10 bg-white">
            <CardTitle className="text-lg">Snags List</CardTitle>
            <CardDescription className="flex items-center">
              <span className="mr-2">Total: {filteredSnags.length}</span>
              {stats.total > 0 && (
                <span className="text-xs text-gray-500">{progressPercentage}% completed</span>
              )}
            </CardDescription>
          </CardHeader>
          <div className="relative">
            {/* Scroll indicator - top shadow when scrolled */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white to-transparent z-10 opacity-0 transition-opacity duration-200 scroll-shadow-top"></div>
            
            {/* Scroll indicator - bottom shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
            
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent hover:scrollbar-thumb-gray-300"
            >
              <div className="grid grid-cols-1 gap-4 p-4">
              {filteredSnags.map(snag => (
                <Card key={snag.id} className="overflow-hidden border-l-4" 
                  style={{ borderLeftColor: snag.severity === 'critical' ? '#ef4444' : 
                                           snag.severity === 'major' ? '#f97316' : 
                                           snag.severity === 'minor' ? '#eab308' : '#3b82f6' }}>
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{snag.title}</CardTitle>
                        <CardDescription>
                          {snag.location || "No location"} | ID: #{snag.id}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEditSnag(snag.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Snag
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUploadImages(snag.id)}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload Photos
                          </DropdownMenuItem>
                          {/* Status change options */}
                          {snag.status === 'open' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(snag.id, 'in_progress')}>
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as In-Progress
                            </DropdownMenuItem>
                          )}
                          
                          {snag.status !== 'resolved' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(snag.id, 'resolved')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          )}
                          
                          {snag.status !== 'open' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(snag.id, 'open')}>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark as Open
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Snag
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p className="text-sm text-gray-700 mb-4">
                      {snag.description || "No description provided"}
                    </p>
                
                {/* Images preview */}
                {snag.images && snag.images.length > 0 && (
                  <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 -mx-2 px-2">
                    {snag.images.map(image => (
                      <div 
                        key={image.id} 
                        className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border relative"
                      >
                        <img 
                          src={image.url} 
                          alt={`Snag ${snag.id} image`} 
                          className="w-full h-full object-cover"
                        />
                        {image.isAnnotated && (
                          <div className="absolute bottom-0 right-0 bg-yellow-500 text-white rounded-tl-md p-0.5">
                            <Edit className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="flex-shrink-0 w-20 h-20 border rounded-md flex flex-col items-center justify-center text-gray-500"
                      onClick={() => onUploadImages(snag.id)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs mt-1">Add</span>
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(snag.status)}>
                    <div className="flex items-center">
                      {getStatusIcon(snag.status)}
                      <span className="ml-1">
                        {formatStatus(snag.status)}
                      </span>
                    </div>
                  </Badge>
                  
                  <Badge className={getSeverityColor(snag.severity)}>
                    {formatSeverity(snag.severity)}
                  </Badge>
                  
                  <Badge variant="outline">
                    {snag.category || "Uncategorized"}
                  </Badge>
                  
                  {snag.assignedTo && (
                    <Badge variant="outline" className="bg-blue-50">
                      Assigned: {snag.assignedTo}
                    </Badge>
                  )}
                  
                  {snag.dueDate && (
                    <Badge variant="outline" className="bg-purple-50">
                      Due: {formatDate(snag.dueDate)}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="py-3 text-xs text-gray-500 flex justify-between">
                <span>Created: {formatDate(snag.createdAt)}</span>
                {snag.updatedAt && snag.updatedAt !== snag.createdAt && (
                  <span>Updated: {formatDate(snag.updatedAt)}</span>
                )}
              </CardFooter>
            </Card>
              ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
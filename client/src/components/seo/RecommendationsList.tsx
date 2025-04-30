import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SeoRecommendation, SeoCompetitorAnalysis } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lightbulb, 
  Plus, 
  MoreVertical, 
  Edit,
  Trash,
  CheckCircle,
  ChevronDown,
  Filter,
  ArrowUpDown,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NewRecommendationForm from "./NewRecommendationForm";

export default function RecommendationsList() {
  const [isNewRecommendationOpen, setIsNewRecommendationOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all competitor analyses (for the dropdown)
  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['/api/seo-intelligence/competitor-analysis'],
  }) as { data: SeoCompetitorAnalysis[] | undefined, isLoading: boolean };
  
  // Fetch all recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/seo-intelligence/recommendations'],
    select: (data: SeoRecommendation[]) => {
      // Filter recommendations based on selected filters
      let filtered = [...data];
      
      if (selectedAnalysisId !== null) {
        filtered = filtered.filter(rec => rec.analysisId === selectedAnalysisId);
      }
      
      if (categoryFilter) {
        filtered = filtered.filter(rec => rec.category === categoryFilter);
      }
      
      if (priorityFilter) {
        filtered = filtered.filter(rec => rec.priority === priorityFilter);
      }
      
      if (statusFilter) {
        filtered = filtered.filter(rec => {
          if (statusFilter === "completed") return rec.completed === true;
          if (statusFilter === "pending") return rec.completed !== true;
          return true;
        });
      }
      
      // Sort recommendations
      filtered.sort((a, b) => {
        if (sortBy === "priority") {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
          return sortOrder === "asc" ? aPriority - bPriority : bPriority - aPriority;
        }
        
        if (sortBy === "category") {
          return sortOrder === "asc" 
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        
        if (sortBy === "date") {
          return sortOrder === "asc" 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        return 0;
      });
      
      return filtered;
    },
  });
  
  // Mark recommendation as completed mutation
  const markAsCompleted = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/seo-intelligence/recommendations/${id}/complete`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recommendation updated",
        description: "The recommendation has been marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/recommendations'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the recommendation.",
      });
    },
  });
  
  // Delete recommendation mutation
  const deleteRecommendation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/seo-intelligence/recommendations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recommendation deleted",
        description: "The recommendation has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/recommendations'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the recommendation.",
      });
    },
  });
  
  // Function to handle marking as completed
  const handleMarkAsCompleted = (id: number) => {
    markAsCompleted.mutate(id);
  };
  
  // Function to handle recommendation deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this recommendation?")) {
      deleteRecommendation.mutate(id);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter(null);
    setPriorityFilter(null);
    setStatusFilter(null);
    setSelectedAnalysisId(null);
  };
  
  // Toggle sort order or change sort column
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  // Format date to a more readable format
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge>Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  // Get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "keywords":
        return <Badge variant="outline">Keywords</Badge>;
      case "on-page":
        return <Badge variant="outline">On-Page</Badge>;
      case "off-page":
        return <Badge variant="outline">Off-Page</Badge>;
      case "technical":
        return <Badge variant="outline">Technical</Badge>;
      case "content":
        return <Badge variant="outline">Content</Badge>;
      case "backlinks":
        return <Badge variant="outline">Backlinks</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">SEO Recommendations</h2>
          <p className="text-muted-foreground">
            Implement targeted SEO recommendations to improve your search rankings
          </p>
        </div>
        <Button onClick={() => setIsNewRecommendationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Recommendation
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Filters & Sorting</CardTitle>
          <CardDescription>
            Filter and sort recommendations by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="analysisFilter">Analysis</Label>
              <Select
                value={selectedAnalysisId?.toString() || ""}
                onValueChange={(value) => setSelectedAnalysisId(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="analysisFilter">
                  <SelectValue placeholder="All analyses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All analyses</SelectItem>
                  {analyses?.map((analysis: SeoCompetitorAnalysis) => (
                    <SelectItem key={analysis.id} value={analysis.id.toString()}>
                      {analysis.targetDomain.replace(/(^\w+:|^)\/\//, '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="categoryFilter">Category</Label>
              <Select
                value={categoryFilter || ""}
                onValueChange={(value) => setCategoryFilter(value || null)}
              >
                <SelectTrigger id="categoryFilter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="keywords">Keywords</SelectItem>
                  <SelectItem value="on-page">On-Page</SelectItem>
                  <SelectItem value="off-page">Off-Page</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="backlinks">Backlinks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priorityFilter">Priority</Label>
              <Select 
                value={priorityFilter || ""}
                onValueChange={(value) => setPriorityFilter(value || null)}
              >
                <SelectTrigger id="priorityFilter">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {recommendationsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead className="w-[200px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      Category
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead className="w-[120px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("priority")}
                    >
                      Priority
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.map((recommendation: SeoRecommendation) => (
                  <TableRow key={recommendation.id}>
                    <TableCell>
                      <Checkbox 
                        checked={recommendation.completed === true}
                        onCheckedChange={() => {
                          if (!recommendation.completed) {
                            handleMarkAsCompleted(recommendation.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{getCategoryBadge(recommendation.category)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{recommendation.recommendation}</div>
                      <div className="text-sm text-muted-foreground">
                        {recommendation.impact}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(recommendation.priority)}</TableCell>
                    <TableCell>{formatDate(recommendation.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!recommendation.completed && (
                            <DropdownMenuItem onClick={() => handleMarkAsCompleted(recommendation.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(recommendation.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations yet</CardTitle>
            <CardDescription>
              Start by creating a new SEO recommendation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={() => setIsNewRecommendationOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Recommendation
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* New Recommendation Dialog */}
      <Dialog open={isNewRecommendationOpen} onOpenChange={setIsNewRecommendationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New SEO Recommendation</DialogTitle>
            <DialogDescription>
              Add a recommendation based on SEO analysis results
            </DialogDescription>
          </DialogHeader>
          <NewRecommendationForm 
            onClose={() => setIsNewRecommendationOpen(false)} 
            analyses={analyses || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
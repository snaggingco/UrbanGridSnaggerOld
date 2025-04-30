import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SeoCompetitorAnalysis } from "@shared/schema";
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
import { 
  ChevronDown, 
  Globe, 
  Plus, 
  RefreshCw, 
  MoreVertical, 
  Edit,
  Trash,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import NewAnalysisForm from "./NewAnalysisForm";
import AnalysisResults from "./AnalysisResults";

export default function CompetitorAnalysis() {
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SeoCompetitorAnalysis | null>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all competitor analyses
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['/api/seo-intelligence/competitor-analysis'],
    refetchInterval: 30000, // Refetch every 30 seconds to check for updates
  });
  
  // Delete analysis mutation
  const deleteAnalysis = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/seo-intelligence/competitor-analysis/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis deleted",
        description: "The competitor analysis has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/competitor-analysis'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the analysis.",
      });
    },
  });
  
  // Function to handle analysis deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis.mutate(id);
    }
  };
  
  // View analysis results
  const handleViewResults = (analysis: SeoCompetitorAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsResultsDialogOpen(true);
  };
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Competitor Analysis</h2>
          <p className="text-muted-foreground">
            Analyze how your website performs against competitors
          </p>
        </div>
        <Button onClick={() => setIsNewAnalysisOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>
      
      {isLoading ? (
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
      ) : analyses && analyses.length > 0 ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target Domain</TableHead>
                    <TableHead>Competitors</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis: SeoCompetitorAnalysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        <a 
                          href={analysis.targetDomain} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {analysis.targetDomain.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      </TableCell>
                      <TableCell>{analysis.competitorDomains.length} domains</TableCell>
                      <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(analysis.status)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewResults(analysis)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Results
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(analysis.id)}>
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
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No analyses yet</CardTitle>
            <CardDescription>
              Start by creating a new competitor analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={() => setIsNewAnalysisOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* New Analysis Dialog */}
      <Dialog open={isNewAnalysisOpen} onOpenChange={setIsNewAnalysisOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Competitor Analysis</DialogTitle>
            <DialogDescription>
              Set up a new SEO competitor analysis by providing your website and competitors.
            </DialogDescription>
          </DialogHeader>
          <NewAnalysisForm onClose={() => setIsNewAnalysisOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* View Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analysis Results</DialogTitle>
            <DialogDescription>
              {selectedAnalysis ? `Results for ${selectedAnalysis.targetDomain}` : "Loading results..."}
            </DialogDescription>
          </DialogHeader>
          {selectedAnalysis && (
            <AnalysisResults analysis={selectedAnalysis} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
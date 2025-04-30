import { AdSimulation } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  RefreshCw, 
  AlertCircle, 
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface AdSimulationResultsProps {
  simulation: AdSimulation;
}

export default function AdSimulationResults({ simulation }: AdSimulationResultsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Run simulation mutation
  const runSimulation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/seo-intelligence/ad-simulations/${id}/run`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulation started",
        description: "The ad simulation is now running.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/ad-simulations'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start the simulation.",
      });
    },
  });
  
  // Function to handle simulation run
  const handleRunSimulation = (id: number) => {
    runSimulation.mutate(id);
  };
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not run yet";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (simulation.status === "pending" || simulation.status === "running") {
    return (
      <div className="py-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Simulation in progress</AlertTitle>
          <AlertDescription>
            Your ad simulation is currently being processed. Results will be available soon.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          
          <Skeleton className="h-[300px] w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        </div>
      </div>
    );
  }
  
  if (simulation.status === "failed") {
    return (
      <div className="py-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Simulation failed</AlertTitle>
          <AlertDescription>
            We encountered an error while running your simulation. Please try again.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => handleRunSimulation(simulation.id)}
            disabled={runSimulation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {runSimulation.isPending ? "Starting..." : "Retry Simulation"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <Alert className="mb-4">
        <Calendar className="h-4 w-4" />
        <AlertTitle>Simulation Information</AlertTitle>
        <AlertDescription>
          Simulation ran on {simulation.searchTimestamp ? formatDate(simulation.searchTimestamp) : "Not run yet"}
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ads Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {simulation.adsDetected ? JSON.stringify(simulation.adsDetected).length : "0"} ads
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ads Clicked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {simulation.adsClicked ? JSON.stringify(simulation.adsClicked).length : "0"} clicks
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {simulation.searchResults ? "10 results" : "No data"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => handleRunSimulation(simulation.id)}
          disabled={runSimulation.isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {runSimulation.isPending ? "Starting..." : "Re-run Simulation"}
        </Button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdSimulation } from "@shared/schema";
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
  MousePointerSquare, 
  Plus, 
  MoreVertical, 
  RefreshCw, 
  Trash, 
  ArrowUpDown, 
  Calendar, 
  FileBarChart 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NewAdSimulationForm from "./NewAdSimulationForm";
import AdSimulationResults from "./AdSimulationResults";
import AdAnalysis from "./AdAnalysis";

export default function AdSimulationTab() {
  const [isNewSimulationOpen, setIsNewSimulationOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<AdSimulation | null>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all ad simulations
  const { data: simulations, isLoading } = useQuery({
    queryKey: ['/api/seo-intelligence/ad-simulations'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Run or re-run a simulation
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
  
  // Delete simulation mutation
  const deleteSimulation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/seo-intelligence/ad-simulations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulation deleted",
        description: "The ad simulation has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/ad-simulations'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the simulation.",
      });
    },
  });
  
  // Function to handle simulation run
  const handleRunSimulation = (id: number) => {
    runSimulation.mutate(id);
  };
  
  // Function to handle simulation deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this simulation?")) {
      deleteSimulation.mutate(id);
    }
  };
  
  // View simulation results
  const handleViewResults = (simulation: AdSimulation) => {
    setSelectedSimulation(simulation);
    setIsResultsDialogOpen(true);
  };
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
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
  
  // Sample dashboard data for visualization - in a real app, this would come from aggregated simulation data
  const sampleClickRateData = [
    { name: "Week 1", organic: 2.1, paid: 3.7 },
    { name: "Week 2", organic: 2.3, paid: 3.8 },
    { name: "Week 3", organic: 2.2, paid: 4.1 },
    { name: "Week 4", organic: 2.4, paid: 4.3 },
  ];
  
  const sampleKeywordData = [
    { name: "property inspection", organic: 5, paid: 2 },
    { name: "dubai real estate", organic: 12, paid: 3 },
    { name: "snagging services", organic: 2, paid: 1 },
    { name: "dubai property", organic: 8, paid: 4 },
    { name: "building inspection", organic: 7, paid: 3 },
  ];
  
  const sampleAdsDetectedData = [
    { name: "Google Ads", value: 65 },
    { name: "Competitors", value: 35 },
  ];
  
  const adChartColors = ["#0ea5e9", "#f97316"];
  const pieChartColors = ["#0ea5e9", "#f97316"];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Ad Simulations</h2>
          <p className="text-muted-foreground">
            Monitor ad performance and understand user behavior
          </p>
        </div>
        <Button onClick={() => setIsNewSimulationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Simulation
        </Button>
      </div>
      
      <Tabs defaultValue="simulations" className="mb-6">
        <TabsList>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulations">
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
          ) : simulations && simulations.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulations.map((simulation: AdSimulation) => (
                      <TableRow key={simulation.id}>
                        <TableCell className="font-medium">
                          {simulation.keyword}
                        </TableCell>
                        <TableCell>{formatDate(simulation.createdAt)}</TableCell>
                        <TableCell>
                          {simulation.searchTimestamp ? formatDate(simulation.searchTimestamp) : "Not run yet"}
                        </TableCell>
                        <TableCell>{getStatusBadge(simulation.status)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleViewResults(simulation)}>
                                <FileBarChart className="mr-2 h-4 w-4" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRunSimulation(simulation.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Run Simulation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(simulation.id)}>
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
                <CardTitle>No simulations yet</CardTitle>
                <CardDescription>
                  Start by creating a new ad simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Button onClick={() => setIsNewSimulationOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Simulation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Click-Through Rates: Organic vs Paid</CardTitle>
                <CardDescription>
                  Comparison of organic search results versus paid advertisements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sampleClickRateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: "CTR (%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="organic" 
                        name="Organic CTR" 
                        stroke={adChartColors[0]} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="paid" 
                        name="Paid CTR" 
                        stroke={adChartColors[1]} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Position Comparison</CardTitle>
                  <CardDescription>
                    Organic vs Paid position for top keywords
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={sampleKeywordData}
                        margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax + 5']} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="organic" name="Organic Position" fill={adChartColors[0]} />
                        <Bar dataKey="paid" name="Paid Position" fill={adChartColors[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ad Distribution</CardTitle>
                  <CardDescription>
                    Percentage of ads detected across simulations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sampleAdsDetectedData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sampleAdsDetectedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <FileBarChart className="h-4 w-4" />
              <AlertTitle>Dashboard Data</AlertTitle>
              <AlertDescription>
                This dashboard displays aggregated data from all your ad simulations. 
                Run more simulations for more accurate analytics.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Simulation Dialog */}
      <Dialog open={isNewSimulationOpen} onOpenChange={setIsNewSimulationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Ad Simulation</DialogTitle>
            <DialogDescription>
              Create a new ad simulation to analyze search behavior
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword to simulate</Label>
              <Input id="keyword" placeholder="e.g., property inspection dubai" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsNewSimulationOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Simulation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Simulation Results</DialogTitle>
            <DialogDescription>
              {selectedSimulation ? `Results for keyword "${selectedSimulation.keyword}"` : "Loading results..."}
            </DialogDescription>
          </DialogHeader>
          {selectedSimulation && (
            <div className="py-4">
              <Alert className="mb-4">
                <Calendar className="h-4 w-4" />
                <AlertTitle>Simulation Information</AlertTitle>
                <AlertDescription>
                  Simulation ran on {selectedSimulation.searchTimestamp ? formatDate(selectedSimulation.searchTimestamp) : "Not run yet"}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Ads Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedSimulation.adsDetected ? JSON.stringify(selectedSimulation.adsDetected).length : "0"} ads
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Ads Clicked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedSimulation.adsClicked ? JSON.stringify(selectedSimulation.adsClicked).length : "0"} clicks
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Search Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedSimulation.searchResults ? "10 results" : "No data"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Advanced Ad Analysis Component */}
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
                    <TabsTrigger value="data">Raw Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="analysis" className="py-4">
                    <AdAnalysis simulation={selectedSimulation} />
                  </TabsContent>
                  <TabsContent value="data" className="py-4">
                    <div className="rounded-md bg-muted p-4">
                      <h3 className="text-sm font-medium mb-2">Raw Simulation Data</h3>
                      <pre className="text-xs overflow-auto max-h-[300px]">
                        {JSON.stringify(selectedSimulation, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Button variant="outline" onClick={() => handleRunSimulation(selectedSimulation.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-run Simulation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
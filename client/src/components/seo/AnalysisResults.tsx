import { useState } from "react";
import { SeoCompetitorAnalysis } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  ChevronRight, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import PredictiveAnalytics from "./PredictiveAnalytics";

interface AnalysisResultsProps {
  analysis: SeoCompetitorAnalysis;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Check if analysis has any results
  const hasResults = analysis.results !== null;
  
  // Sample data for visualizations - in a real app, this would come from analysis.results
  const sampleKeywordData = [
    { keyword: "property inspection", yourRanking: 5, competitorAvg: 3 },
    { keyword: "dubai real estate", yourRanking: 12, competitorAvg: 8 },
    { keyword: "snagging services", yourRanking: 2, competitorAvg: 6 },
    { keyword: "dubai property inspection", yourRanking: 7, competitorAvg: 9 },
    { keyword: "property snagging dubai", yourRanking: 3, competitorAvg: 7 },
  ];
  
  const sampleTrafficData = [
    { month: "Jan", you: 3200, competitor1: 4500, competitor2: 2800 },
    { month: "Feb", you: 3800, competitor1: 4600, competitor2: 2900 },
    { month: "Mar", you: 4100, competitor1: 4700, competitor2: 3200 },
    { month: "Apr", you: 4600, competitor1: 4800, competitor2: 3500 },
    { month: "May", you: 5000, competitor1: 4900, competitor2: 3800 },
    { month: "Jun", you: 5500, competitor1: 5000, competitor2: 4200 },
  ];
  
  const sampleBacklinkData = [
    { name: "Your Site", value: 245 },
    { name: "Competitor 1", value: 567 },
    { name: "Competitor 2", value: 398 },
  ];
  
  const keywordChartColors = ["#0ea5e9", "#64748b"];
  const trafficChartColors = ["#0ea5e9", "#f97316", "#8b5cf6"];
  const backlinkChartColors = ["#0ea5e9", "#f97316", "#8b5cf6"];
  
  if (analysis.status === "pending" || analysis.status === "in_progress") {
    return (
      <div className="py-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis in progress</AlertTitle>
          <AlertDescription>
            Your competitor analysis is currently being processed. Results will be available soon.
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
  
  if (analysis.status === "failed") {
    return (
      <div className="py-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis failed</AlertTitle>
          <AlertDescription>
            We encountered an error while analyzing your competitors. Please try again later.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-6">
          <Button variant="outline">
            Retry Analysis
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      {hasResults ? (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Analysis complete</AlertTitle>
          <AlertDescription>
            Your competitor analysis has been completed successfully.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            This analysis hasn't generated any results yet. You can manually add recommendations based on your own research.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Analysis Overview</h3>
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{analysis.targetDomain}</span>
          <Badge variant="outline">{analysis.status}</Badge>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Competitor Domains</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.competitorDomains.map((domain, index) => (
              <Badge key={index} variant="secondary">
                {domain.replace(/(^\w+:|^)\/\//, '')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-1">Target Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">{keyword}</Badge>
            ))}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="predictive">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Predictive
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.keywords.length}</div>
                  <p className="text-xs text-muted-foreground">Across all domains</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Keyword Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {hasResults ? "12.4 avg" : "No data"}
                  </div>
                  <p className="text-xs text-muted-foreground">Average position</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Content Gap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {hasResults ? "43 keywords" : "No data"}
                  </div>
                  <p className="text-xs text-muted-foreground">Missing from your site</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Keyword Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sampleKeywordData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="keyword" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yourRanking" name="Your Ranking" fill={keywordChartColors[0]} />
                      <Bar dataKey="competitorAvg" name="Competitor Avg" fill={keywordChartColors[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={sampleKeywordData}
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 20]} />
                      <YAxis dataKey="keyword" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yourRanking" name="Your Ranking" fill={keywordChartColors[0]} />
                      <Bar dataKey="competitorAvg" name="Competitor Avg" fill={keywordChartColors[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estimated Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sampleTrafficData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="you" 
                        name="Your Site" 
                        stroke={trafficChartColors[0]} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="competitor1" 
                        name="Competitor 1" 
                        stroke={trafficChartColors[1]} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="competitor2" 
                        name="Competitor 2" 
                        stroke={trafficChartColors[2]} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Backlink Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sampleBacklinkData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Backlinks" fill={backlinkChartColors[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictive" className="space-y-4">
            {hasResults ? (
              <PredictiveAnalytics analysis={analysis} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Analysis Required</AlertTitle>
                <AlertDescription>
                  Predictive analytics requires completed analysis data. Please run a full competitor analysis to access AI-powered predictions.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Info,
  ShoppingCart,
  Map,
  PieChart as PieChartIcon,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  PanelTop,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

export default function SearchIntentAnalysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedKeyword, setAnalyzedKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch search intent analysis for a keyword
  const { data: intentAnalysis, isLoading, isError } = useQuery({
    queryKey: [`/api/seo-intelligence/search-intent/${analyzedKeyword}`],
    enabled: !!analyzedKeyword,
    retry: 1,
    onError: () => {
      setError("Could not retrieve search intent analysis data. Please try again.");
    }
  } as any);
  
  // Run search intent analysis
  const analyzeIntent = useMutation({
    mutationFn: async (keyword: string) => {
      setError(null);
      return apiRequest('/api/seo-intelligence/search-intent/analyze', {
        method: "POST",
        body: JSON.stringify({ 
          keyword,
          targetDomain: window.location.hostname 
        }),
      });
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      setAnalyzedKeyword(searchTerm);
      toast({
        title: "Analysis complete",
        description: "Search intent analysis has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/seo-intelligence/search-intent/${searchTerm}`] });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      setError(error?.message || "Failed to analyze search intent");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze search intent. Please try again.",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsAnalyzing(true);
    analyzeIntent.mutate(searchTerm);
  };
  
  // Intent types with corresponding colors and icons
  const intentTypes = [
    { 
      type: "informational", 
      label: "Informational", 
      color: "#3b82f6", 
      icon: <Info className="h-4 w-4" />,
      description: "Users looking for information or answers to questions" 
    },
    { 
      type: "navigational", 
      label: "Navigational", 
      color: "#8b5cf6", 
      icon: <Map className="h-4 w-4" />,
      description: "Users searching for a specific website or page" 
    },
    { 
      type: "commercial", 
      label: "Commercial", 
      color: "#ec4899", 
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Users researching products before making a purchase" 
    },
    { 
      type: "transactional", 
      label: "Transactional", 
      color: "#10b981", 
      icon: <ShoppingCart className="h-4 w-4" />,
      description: "Users ready to purchase or complete an action" 
    },
  ];
  
  // Sample data to display while loading or as fallback
  const sampleIntentData = {
    keyword: analyzedKeyword || "property inspection dubai",
    intentType: "informational",
    intentScore: 0.85,
    intentDistribution: [
      { name: "Informational", value: 70 },
      { name: "Navigational", value: 10 },
      { name: "Commercial", value: 15 },
      { name: "Transactional", value: 5 },
    ],
    volumeMetrics: {
      searchVolume: 720,
      difficulty: 46,
      cpc: 2.35,
    },
    contentRecommendations: [
      "Create a comprehensive guide about property inspection process",
      "Include a FAQ section addressing common concerns",
      "Add visual elements like infographics explaining the inspection workflow",
      "Create a checklist that users can download",
      "Include expert tips and insights about Dubai property regulations"
    ],
    relatedKeywords: [
      { keyword: "property inspection checklist dubai", volume: 320, intentType: "informational" },
      { keyword: "dubai property inspection cost", volume: 210, intentType: "commercial" },
      { keyword: "best property inspection companies dubai", volume: 190, intentType: "commercial" },
      { keyword: "property inspection report sample", volume: 170, intentType: "informational" },
      { keyword: "book property inspection dubai", volume: 110, intentType: "transactional" },
    ],
    serp: {
      topResults: [
        { title: "Dubai Property Inspection: The Complete Guide", type: "guide" },
        { title: "10 Things to Look for in a Property Inspection", type: "list" },
        { title: "Property Inspection Services in Dubai - Expert Inspectors", type: "service" },
        { title: "Property Inspection Checklist for Dubai Real Estate", type: "checklist" },
      ]
    }
  };
  
  // Define the type for the intent analysis data
  interface IntentAnalysisData {
    keyword: string;
    intentType: string;
    intentScore: number;
    intentDistribution: { name: string; value: number }[];
    volumeMetrics: {
      searchVolume: number;
      difficulty: number;
      cpc: number;
    };
    contentRecommendations: string[];
    relatedKeywords: { keyword: string; volume: number; intentType: string }[];
    serp: {
      topResults: { title: string; type: string }[];
    };
  }
    
  // Use actual data if available, otherwise use sample data
  const data: IntentAnalysisData = intentAnalysis as IntentAnalysisData || sampleIntentData;
  
  // Get the color for the dominant intent type
  const getDominantIntentColor = () => {
    const intentType = intentTypes.find(i => i.type === data.intentType);
    return intentType ? intentType.color : "#3b82f6";
  };
  
  // Get icon for the dominant intent type
  const getDominantIntentIcon = () => {
    const intentType = intentTypes.find(i => i.type === data.intentType);
    return intentType ? intentType.icon : <Info className="h-4 w-4" />;
  };
  
  // Get description for the dominant intent type
  const getDominantIntentDescription = () => {
    const intentType = intentTypes.find(i => i.type === data.intentType);
    return intentType ? intentType.description : "";
  };
  
  // Get colors for the pie chart
  const getPieChartColors = () => {
    return intentTypes.map(intent => intent.color);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Search Intent Analysis</h2>
          <p className="text-muted-foreground">
            Analyze search intent patterns to optimize content strategy
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analyze Keyword Intent</CardTitle>
          <CardDescription>
            Enter a keyword to analyze its search intent and get content recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter a keyword (e.g., property inspection dubai)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <Button type="submit" disabled={isAnalyzing || !searchTerm.trim()}>
              {isAnalyzing ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Intent
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {analyzedKeyword && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <span>Keyword: {data.keyword}</span>
                    <Badge className="ml-3" style={{ backgroundColor: getDominantIntentColor(), color: "white" }}>
                      {getDominantIntentIcon()}
                      <span className="ml-1">{data.intentType.charAt(0).toUpperCase() + data.intentType.slice(1)}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {getDominantIntentDescription()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-medium mb-2">Intent Distribution</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Breakdown of search intent types for this keyword
                      </p>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.intentDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {data.intentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getPieChartColors()[index % getPieChartColors().length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Search Metrics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Search Volume</span>
                            <span className="text-sm font-medium">{data.volumeMetrics.searchVolume}/mo</span>
                          </div>
                          <Progress value={Math.min(data.volumeMetrics.searchVolume / 10, 100)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Keyword Difficulty</span>
                            <span className="text-sm font-medium">{data.volumeMetrics.difficulty}/100</span>
                          </div>
                          <Progress value={data.volumeMetrics.difficulty} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">CPC (Cost Per Click)</span>
                            <span className="text-sm font-medium">${data.volumeMetrics.cpc}</span>
                          </div>
                          <Progress value={Math.min(data.volumeMetrics.cpc * 10, 100)} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Intent Confidence</h3>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                            <div 
                              className="h-4 rounded-full" 
                              style={{
                                width: `${data.intentScore * 100}%`,
                                backgroundColor: getDominantIntentColor()
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(data.intentScore * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Recommendations</CardTitle>
                    <CardDescription>
                      Optimized content strategies based on search intent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.contentRecommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-500" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Related Keywords</CardTitle>
                    <CardDescription>
                      Keywords with similar intent and search patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.relatedKeywords.map((keyword, index) => {
                        const intentType = intentTypes.find(i => i.type === keyword.intentType);
                        return (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-2 rounded border hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              {intentType && (
                                <div 
                                  className="w-2 h-2 rounded-full mr-2"
                                  style={{ backgroundColor: intentType.color }}
                                ></div>
                              )}
                              <span>{keyword.keyword}</span>
                            </div>
                            <Badge variant="outline">{keyword.volume}/mo</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>SERP Analysis</CardTitle>
                  <CardDescription>
                    Analysis of top-ranking content for this keyword
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Content Types in Top Results
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {data.serp.topResults.map((result, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 rounded border">
                              {result.type === "guide" && <PanelTop className="h-4 w-4 text-blue-500" />}
                              {result.type === "list" && <PieChartIcon className="h-4 w-4 text-green-500" />}
                              {result.type === "service" && <ShoppingCart className="h-4 w-4 text-purple-500" />}
                              {result.type === "checklist" && <TrendingUp className="h-4 w-4 text-orange-500" />}
                              <div>
                                <p className="font-medium">{result.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle>Content Optimization Strategy</AlertTitle>
                <AlertDescription>
                  Based on the search intent analysis, focus on creating {data.intentType} content
                  that addresses user questions and provides comprehensive information.
                  Implement the recommended content types to maximize visibility for this keyword.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      )}
    </div>
  );
}
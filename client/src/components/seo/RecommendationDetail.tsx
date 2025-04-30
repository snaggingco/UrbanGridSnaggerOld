import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SeoRecommendation } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer 
} from "recharts";
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  LightbulbIcon,
  AlertCircle,
  CheckSquare,
  ArrowUpRight,
  Zap,
  Rocket
} from "lucide-react";

interface RecommendationDetailProps {
  recommendation: SeoRecommendation;
  onClose: () => void;
}

export default function RecommendationDetail({ recommendation, onClose }: RecommendationDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("steps");
  const [implementing, setImplementing] = useState<boolean>(false);
  const [implementProgress, setImplementProgress] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recommendation implementation steps
  const { data: steps, isLoading: stepsLoading } = useQuery({
    queryKey: [`/api/seo-intelligence/recommendations/${recommendation.id}/steps`],
    enabled: activeTab === "steps",
  });

  // Fetch recommendation impact analysis
  const { data: impact, isLoading: impactLoading } = useQuery({
    queryKey: [`/api/seo-intelligence/recommendations/${recommendation.id}/impact`],
    enabled: activeTab === "impact",
  });

  // Mark recommendation as completed mutation
  const markAsCompleted = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/seo-intelligence/recommendations/${recommendation.id}/complete`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recommendation updated",
        description: "The recommendation has been marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/recommendations'] });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the recommendation.",
      });
    },
  });

  // Implement automatically mutation
  
  const implementAutomatically = useMutation({
    mutationFn: async () => {
      setImplementing(true);
      setImplementProgress(10);
      
      // Simulate progress
      const updateProgress = () => {
        setImplementProgress(prev => {
          const increment = Math.floor(Math.random() * 15) + 5;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      };
      
      // Simulate steps of implementation with progress updates
      await new Promise(resolve => setTimeout(() => {
        updateProgress();
        resolve(null);
      }, 1000));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress();
        resolve(null);
      }, 1500));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress();
        resolve(null);
      }, 1200));
      
      // Final API call to actually implement the recommendation
      return apiRequest(`/api/seo-intelligence/recommendations/${recommendation.id}/implement`, {
        method: "POST",
        body: {
          analysisId: recommendation.analysisId,
          category: recommendation.category
        }
      });
    },
    onSuccess: (data) => {
      setImplementProgress(100);
      setTimeout(() => {
        setImplementing(false);
        toast({
          title: "Implementation successful",
          description: "The SEO improvement has been automatically implemented on your website.",
        });
        
        // Mark as completed after implementing
        markAsCompleted.mutate();
      }, 500);
    },
    onError: (error) => {
      setImplementing(false);
      toast({
        variant: "destructive",
        title: "Implementation error",
        description: "Failed to automatically implement the SEO recommendation. Please try again.",
      });
    },
  });

  // Function to handle marking as completed
  const handleMarkAsCompleted = () => {
    markAsCompleted.mutate();
  };
  
  // Function to handle automated implementation
  const handleImplementAutomatically = () => {
    implementAutomatically.mutate();
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>;
      case "low":
        return <Badge>Low Priority</Badge>;
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

  // Default AI-generated steps if actual API response isn't loaded yet
  const defaultSteps = [
    "Analyzing current keyword rankings",
    "Identifying keyword gaps with competitors",
    "Generating content recommendations",
    "Evaluating SEO performance impact",
    "Creating implementation timeline"
  ];

  // Default impact data for visualization
  const defaultImpactData = {
    expectedTimeInvestment: "4-6 hours",
    difficultyLevel: "Medium",
    projectedImpactScore: 75,
    keyMetricsImpact: [
      { metric: "Organic Traffic", impact: 25 },
      { metric: "Search Visibility", impact: 30 },
      { metric: "Click-Through Rate", impact: 15 },
      { metric: "Conversion Rate", impact: 10 },
      { metric: "Keyword Rankings", impact: 20 }
    ],
    timelineData: [
      { period: "1 Week", improvement: 5 },
      { period: "2 Weeks", improvement: 15 },
      { period: "1 Month", improvement: 40 },
      { period: "3 Months", improvement: 75 },
      { period: "6 Months", improvement: 100 }
    ]
  };

  // Determine which steps to show - API response or fallback
  const implementationSteps = steps?.steps || recommendation.aiGeneratedSteps || defaultSteps;
  
  // Determine impact data to show
  const impactData = impact || 
    (recommendation.projectedImpact ? JSON.parse(recommendation.projectedImpact as string) : defaultImpactData);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-xl font-semibold">{recommendation.recommendation}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {getCategoryBadge(recommendation.category)}
          {getPriorityBadge(recommendation.priority)}
          {recommendation.completed && (
            <Badge variant="outline" className="bg-green-50">
              <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
              Completed
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{recommendation.impact}</p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="steps">Implementation Steps</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4 py-4">
          <div className="space-y-4">
            {stepsLoading ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Loading</AlertTitle>
                <AlertDescription>
                  Loading AI-generated implementation steps...
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Implementation Guide</CardTitle>
                    <CardDescription>
                      Follow these steps to implement this recommendation effectively
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 mt-2">
                      {implementationSteps.map((step, index) => (
                        <li key={index} className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-grow pt-1">
                            <p>{step}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Implementation Requirements</CardTitle>
                    <CardDescription>
                      Resources and skills needed for this recommendation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Estimated Time</h4>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {recommendation.estimatedTimeInvestment || "3-5 hours"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Difficulty</h4>
                        <div className="flex items-center">
                          <Badge variant={
                            recommendation.implementationDifficulty === "high" ? "destructive" :
                            recommendation.implementationDifficulty === "medium" ? "secondary" : "default"
                          }>
                            {recommendation.implementationDifficulty || "Medium"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4 py-4">
          {impactLoading ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>
                Loading AI-generated impact analysis...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Projected Impact</CardTitle>
                  <CardDescription>
                    Expected improvements and timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center pb-4">
                    <div className="relative w-32 h-32 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">
                          {impactData.projectedImpactScore}%
                        </span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${impactData.projectedImpactScore}, 100`}
                        />
                      </svg>
                    </div>
                    <div className="text-center mb-6">
                      <p className="text-lg font-medium">Overall Impact Score</p>
                      <p className="text-sm text-muted-foreground">
                        Based on AI analysis of similar implementations
                      </p>
                    </div>
                  </div>

                  <h4 className="font-medium mb-2">Key Metrics Impact</h4>
                  <div className="space-y-3 mb-6">
                    {impactData.keyMetricsImpact.map((metric, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{metric.metric}</span>
                          <span className="font-medium">{metric.impact}%</span>
                        </div>
                        <Progress value={metric.impact} className="h-2" />
                      </div>
                    ))}
                  </div>

                  <h4 className="font-medium mb-2">Expected Timeline</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={impactData.timelineData}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Improvement']} />
                        <Line
                          type="monotone"
                          dataKey="improvement"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <AlertTitle>Implementation Strategy</AlertTitle>
                <AlertDescription>
                  For optimal results, implement this recommendation within the next 2 weeks. 
                  The projected impact considers market trends and competitor activities.
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Implementation Progress */}
      {implementing && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Implementation Progress</h4>
          <div className="space-y-2">
            <Progress value={implementProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Implementing changes...</span>
              <span>{implementProgress}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        {!recommendation.completed && !implementing && (
          <>
            <Button variant="outline" onClick={handleMarkAsCompleted}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
            
            <Button 
              onClick={handleImplementAutomatically}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Implement Automatically
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
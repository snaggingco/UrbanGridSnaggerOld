import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SeoCompetitorAnalysis } from "@shared/schema";
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
  ScatterChart,
  Scatter,
  ZAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  TrendingUp, 
  BarChart as BarChartIcon, 
  RefreshCw, 
  AlertCircle,
  LineChart as LineChartIcon,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";

interface PredictiveAnalyticsProps {
  analysis: SeoCompetitorAnalysis;
}

export default function PredictiveAnalytics({ analysis }: PredictiveAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("rankings");
  
  // Fetch predictive analytics data
  const { data: predictiveData, isLoading } = useQuery({
    queryKey: [`/api/seo-intelligence/competitor-analysis/${analysis.id}/predictive`],
    enabled: !!analysis.id,
  });
  
  // Sample data - would be replaced by actual API data
  const sampleData = {
    rankingPredictions: [
      { month: "Jan", predicted: 15, actual: 14 },
      { month: "Feb", predicted: 13, actual: 12 },
      { month: "Mar", predicted: 11, actual: 10 },
      { month: "Apr", predicted: 9, actual: 8 },
      { month: "May", predicted: 7, actual: 6 },
      { month: "Jun", predicted: 5, predicted_only: true },
      { month: "Jul", predicted: 4, predicted_only: true },
      { month: "Aug", predicted: 3, predicted_only: true },
    ],
    trafficPredictions: [
      { month: "Jan", predicted: 4200, actual: 4100 },
      { month: "Feb", predicted: 4500, actual: 4400 },
      { month: "Mar", predicted: 4800, actual: 4700 },
      { month: "Apr", predicted: 5200, actual: 5000 },
      { month: "May", predicted: 5600, actual: 5500 },
      { month: "Jun", predicted: 6100, predicted_only: true },
      { month: "Jul", predicted: 6800, predicted_only: true },
      { month: "Aug", predicted: 7500, predicted_only: true },
    ],
    opportunityScores: [
      { keyword: "property inspection", difficulty: 35, opportunity: 85, volume: 720 },
      { keyword: "dubai property snagging", difficulty: 25, opportunity: 90, volume: 480 },
      { keyword: "property inspection cost", difficulty: 40, opportunity: 75, volume: 650 },
      { keyword: "real estate inspection", difficulty: 60, opportunity: 65, volume: 850 },
      { keyword: "home inspection dubai", difficulty: 30, opportunity: 80, volume: 520 },
    ],
    competitiveAnalysis: [
      { metric: "Organic Traffic", your_score: 65, competitor_avg: 72 },
      { metric: "Keyword Coverage", your_score: 58, competitor_avg: 67 },
      { metric: "Backlinks Quality", your_score: 73, competitor_avg: 68 },
      { metric: "Content Volume", your_score: 62, competitor_avg: 70 },
      { metric: "Page Speed", your_score: 85, competitor_avg: 76 },
      { metric: "Mobile Usability", your_score: 90, competitor_avg: 82 },
    ],
    growthOpportunities: [
      { category: "Content", opportunity: 85, implementation: 65, impact: 80 },
      { category: "On-Page SEO", opportunity: 75, implementation: 60, impact: 75 },
      { category: "Technical SEO", opportunity: 65, implementation: 40, impact: 70 },
      { category: "Backlinks", opportunity: 90, implementation: 30, impact: 85 },
      { category: "Local SEO", opportunity: 70, implementation: 50, impact: 65 },
    ]
  };
  
  // Use the fetched data or sample data
  const data = predictiveData || sampleData;
  
  // Chart colors
  const chartColors = {
    predicted: "#3b82f6",
    actual: "#64748b",
    opportunity: "#10b981",
    difficulty: "#f97316",
    yourScore: "#0ea5e9",
    competitorAvg: "#f43f5e",
    volume: "#8b5cf6",
    implementation: "#6366f1",
    impact: "#ec4899"
  };
  
  // Get prediction trend (up or down)
  const getPredictionTrend = (dataArray: any[], key: string) => {
    if (!dataArray || dataArray.length < 2) return "neutral";
    
    const firstValue = dataArray[0][key];
    const lastValue = dataArray[dataArray.length - 1][key];
    
    if (key === "predicted" && lastValue < firstValue) {
      // For rankings, lower is better
      return "positive";
    } else if (key === "predicted" && lastValue > firstValue) {
      return "negative";
    } else if (lastValue > firstValue) {
      // For traffic, higher is better
      return "positive";
    } else {
      return "negative";
    }
  };
  
  const getTrendBadge = (trend: string) => {
    if (trend === "positive") {
      return <Badge className="bg-green-100 text-green-800">Positive Trend</Badge>;
    } else if (trend === "negative") {
      return <Badge variant="destructive">Negative Trend</Badge>;
    } else {
      return <Badge variant="outline">Neutral</Badge>;
    }
  };
  
  // Get average opportunity score
  const getAverageOpportunity = () => {
    if (!data.opportunityScores || data.opportunityScores.length === 0) return 0;
    
    const sum = data.opportunityScores.reduce((acc, curr) => acc + curr.opportunity, 0);
    return Math.round(sum / data.opportunityScores.length);
  };
  
  // Get competitive advantage areas
  const getCompetitiveAdvantages = () => {
    if (!data.competitiveAnalysis) return [];
    
    return data.competitiveAnalysis
      .filter(item => item.your_score > item.competitor_avg)
      .sort((a, b) => (b.your_score - b.competitor_avg) - (a.your_score - a.competitor_avg))
      .slice(0, 3);
  };
  
  // Get improvement areas
  const getImprovementAreas = () => {
    if (!data.competitiveAnalysis) return [];
    
    return data.competitiveAnalysis
      .filter(item => item.competitor_avg > item.your_score)
      .sort((a, b) => (b.competitor_avg - b.your_score) - (a.competitor_avg - a.your_score))
      .slice(0, 3);
  };
  
  // Get top growth opportunities
  const getTopGrowthOpportunities = () => {
    if (!data.growthOpportunities) return [];
    
    return data.growthOpportunities
      .sort((a, b) => b.opportunity - a.opportunity)
      .slice(0, 3);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-6 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <Skeleton className="h-[200px]" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Predictive Analytics</h3>
        <p className="text-muted-foreground">
          AI-powered predictions and insights for your SEO strategy
        </p>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <AlertTitle>Predictive Insights</AlertTitle>
        <AlertDescription>
          Based on historical data and AI analysis, we've generated predictions for your 
          SEO performance over the next 3 months. Use these insights to refine your strategy.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="rankings">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Rankings
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <Lightbulb className="mr-2 h-4 w-4" />
            Opportunities
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rankings" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Keyword Ranking Predictions</CardTitle>
                {getTrendBadge(getPredictionTrend(data.rankingPredictions, "predicted"))}
              </div>
              <CardDescription>
                Predicted ranking positions for your top keywords (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.rankingPredictions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 'dataMax + 5']} reversed />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Position"
                      stroke={chartColors.actual}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Predicted Position"
                      stroke={chartColors.predicted}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Competitive Ranking Analysis</CardTitle>
                <CardDescription>
                  Your performance compared to competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.competitiveAnalysis}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Your Score"
                        dataKey="your_score"
                        stroke={chartColors.yourScore}
                        fill={chartColors.yourScore}
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Competitor Average"
                        dataKey="competitor_avg"
                        stroke={chartColors.competitorAvg}
                        fill={chartColors.competitorAvg}
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Strategic Insights</CardTitle>
                <CardDescription>
                  Key takeaways from ranking predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Competitive Advantages</h4>
                  <ul className="space-y-1">
                    {getCompetitiveAdvantages().map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                        <span>
                          <strong>{item.metric}:</strong> {item.your_score - item.competitor_avg}% above average
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {getImprovementAreas().map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ChevronDown className="h-4 w-4 mr-2 text-red-500" />
                        <span>
                          <strong>{item.metric}:</strong> {item.competitor_avg - item.your_score}% below average
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="traffic" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Organic Traffic Predictions</CardTitle>
                {getTrendBadge(getPredictionTrend(data.trafficPredictions, "predicted"))}
              </div>
              <CardDescription>
                Predicted organic traffic volume for the next 3 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.trafficPredictions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="Actual Traffic"
                      stroke={chartColors.actual}
                      fill={chartColors.actual}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      name="Predicted Traffic"
                      stroke={chartColors.predicted}
                      fill={chartColors.predicted}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Traffic Growth Potential</AlertTitle>
            <AlertDescription>
              Based on our AI analysis, implementing all recommended changes could result in
              a {Math.round((data.trafficPredictions[data.trafficPredictions.length - 1].predicted / 
                data.trafficPredictions[0].actual - 1) * 100)}% 
              traffic increase over the next 3 months.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Opportunity Score</CardTitle>
                <CardDescription>
                  Overall growth potential
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{getAverageOpportunity()}</span>
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
                        stroke={chartColors.opportunity}
                        strokeWidth="3"
                        strokeDasharray={`${getAverageOpportunity()}, 100`}
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Out of 100 possible points
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Top Growth Opportunities</CardTitle>
                <CardDescription>
                  Areas with highest growth potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopGrowthOpportunities().map((opportunity, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{opportunity.category}</span>
                        <Badge 
                          variant="outline" 
                          className="bg-green-50"
                        >
                          {opportunity.opportunity}% Opportunity
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${opportunity.implementation}%`, 
                              backgroundColor: chartColors.implementation 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">{opportunity.implementation}% Implemented</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Keyword Opportunity Matrix</CardTitle>
              <CardDescription>
                Keyword opportunities mapped by difficulty, volume, and potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="difficulty" 
                      name="Difficulty" 
                      domain={[0, 100]}
                      label={{ value: 'Difficulty', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="opportunity" 
                      name="Opportunity" 
                      domain={[0, 100]}
                      label={{ value: 'Opportunity', angle: -90, position: 'left' }}
                    />
                    <ZAxis
                      type="number"
                      dataKey="volume"
                      range={[50, 400]}
                      name="Volume"
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'Difficulty') return [`${value}%`, name];
                        if (name === 'Opportunity') return [`${value}%`, name];
                        if (name === 'Volume') return [value, 'Monthly Volume'];
                        return [value, name];
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <p className="font-medium">{payload[0].payload.keyword}</p>
                              <p>Difficulty: {payload[0].payload.difficulty}%</p>
                              <p>Opportunity: {payload[0].payload.opportunity}%</p>
                              <p>Volume: {payload[0].payload.volume}/mo</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Keywords" 
                      data={data.opportunityScores} 
                      fill={chartColors.opportunity}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Growth Strategy Areas</CardTitle>
              <CardDescription>
                Comparative analysis of all growth areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.growthOpportunities}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="opportunity" 
                      name="Opportunity" 
                      fill={chartColors.opportunity} 
                    />
                    <Bar 
                      dataKey="implementation" 
                      name="Current Implementation" 
                      fill={chartColors.implementation} 
                    />
                    <Bar 
                      dataKey="impact" 
                      name="Potential Impact" 
                      fill={chartColors.impact} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Predictions
        </Button>
      </div>
    </div>
  );
}
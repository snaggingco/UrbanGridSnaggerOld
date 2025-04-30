import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AdSimulation } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Lightbulb,
  DollarSign,
  TrendingUp,
  MousePointer,
  Copy,
  Target,
  Maximize,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface AdAnalysisProps {
  simulation: AdSimulation;
}

export default function AdAnalysis({ simulation }: AdAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch ad analysis data
  const { data: adAnalysisData, isLoading } = useQuery({
    queryKey: [`/api/seo-intelligence/ad-simulations/${simulation.id}/analysis`],
    enabled: !!simulation.id,
  });
  
  // Sample data - would be replaced by actual API data
  const sampleData = {
    adCompetitorAnalysis: {
      totalAds: 8,
      yourPosition: 3,
      competitorBreakdown: [
        { name: "Competitor A", count: 3, ctr: 4.2 },
        { name: "Competitor B", count: 2, ctr: 3.8 },
        { name: "Competitor C", count: 1, ctr: 3.2 },
        { name: "Your Ad", count: 1, ctr: 3.9 },
        { name: "Others", count: 1, ctr: 2.8 },
      ],
      competitorAdCopy: [
        { 
          company: "Competitor A", 
          headline: "Expert Property Inspection | 24 Hour Service",
          description: "Professional inspectors. Detailed reports. Book now for same-day service.",
          strengths: ["Urgency", "Professional", "Clear CTA"]
        },
        { 
          company: "Competitor B", 
          headline: "Dubai's Top-Rated Property Inspection",
          description: "5-star rated inspectors. Comprehensive snagging reports. Trusted by 1000+ clients.",
          strengths: ["Social proof", "Comprehensive", "Trust indicators"]
        },
        { 
          company: "Your Ad", 
          headline: "Property Inspection Services in Dubai",
          description: "Expert property inspectors. Detailed snagging reports. Free consultation.",
          strengths: ["Expertise", "Value-add", "Free offer"]
        },
      ]
    },
    adPositionImpact: {
      positionData: [
        { position: 1, estimatedCTR: 4.8, costMultiplier: 1.5 },
        { position: 2, estimatedCTR: 4.2, costMultiplier: 1.3 },
        { position: 3, estimatedCTR: 3.9, costMultiplier: 1.1 },
        { position: 4, estimatedCTR: 3.1, costMultiplier: 0.9 },
        { position: 5, estimatedCTR: 2.3, costMultiplier: 0.8 },
      ],
      clickDistribution: [
        { position: "Top 3", percentage: 65 },
        { position: "4-6", percentage: 25 },
        { position: "7+", percentage: 10 },
      ]
    },
    adCopyAnalysis: {
      currentAd: {
        strength: 72,
        relevance: 85,
        cta: 68,
        usp: 70
      },
      recommendations: [
        "Add urgency elements to your headline (e.g., 'Same-Day Reports')",
        "Include specific numbers in your ad copy (e.g., '100+ 5-star reviews')",
        "Use more emotional triggers in description",
        "Add a stronger call-to-action"
      ],
      improvedHeadline: "Dubai Property Inspection | Same-Day Reports",
      improvedDescription: "⭐️ 100+ 5-Star Reviews. Expert inspectors deliver comprehensive reports within 24 hours. Book now for 15% off first inspection!"
    },
    estimatedCpcData: {
      keyword: simulation.keyword,
      averageCpc: 2.35,
      highPosition: 3.85,
      lowPosition: 1.20,
      monthlyTrends: [
        { month: "Jan", cpc: 2.10 },
        { month: "Feb", cpc: 2.15 },
        { month: "Mar", cpc: 2.25 },
        { month: "Apr", cpc: 2.30 },
        { month: "May", cpc: 2.35 },
        { month: "Jun", cpc: 2.40 },
      ]
    },
    bidStrategySuggestions: {
      recommended: {
        bid: 2.80,
        position: "Top 3",
        estimatedClicks: 124,
        estimatedConversions: 12,
        estimatedCpa: 29,
        roas: 320
      },
      strategies: [
        { 
          name: "Conservative", 
          bid: 2.00, 
          position: "4-6", 
          estimatedClicks: 65, 
          estimatedConversions: 6,
          estimatedCpa: 21,
          roas: 280
        },
        { 
          name: "Balanced", 
          bid: 2.80, 
          position: "Top 3", 
          estimatedClicks: 124, 
          estimatedConversions: 12,
          estimatedCpa: 29,
          roas: 320
        },
        { 
          name: "Aggressive", 
          bid: 3.50, 
          position: "1-2", 
          estimatedClicks: 165, 
          estimatedConversions: 16,
          estimatedCpa: 36,
          roas: 290
        },
      ]
    }
  };
  
  // Use the fetched data or sample data
  const data = adAnalysisData || sampleData;
  
  // Chart colors
  const chartColors = {
    primary: "#3b82f6",
    secondary: "#f97316",
    tertiary: "#8b5cf6",
    quaternary: "#ec4899",
    quinary: "#10b981",
    gray: "#64748b",
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
  };
  
  // Calculate average bid
  const getAverageBid = () => {
    return (data.estimatedCpcData.highPosition + data.estimatedCpcData.lowPosition) / 2;
  };
  
  // Get strategy color
  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "Conservative":
        return chartColors.green;
      case "Balanced":
        return chartColors.primary;
      case "Aggressive":
        return chartColors.red;
      default:
        return chartColors.gray;
    }
  };
  
  // Render the trend indicator
  const renderTrendIndicator = (value: number, baseline: number) => {
    if (value > baseline) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (value < baseline) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
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
        <h3 className="text-xl font-bold">Ad Effectiveness Analysis</h3>
        <p className="text-muted-foreground">
          AI-powered insights for optimizing your ad campaigns for "{simulation.keyword}"
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="copy">
            <Copy className="mr-2 h-4 w-4" />
            Ad Copy
          </TabsTrigger>
          <TabsTrigger value="position">
            <Target className="mr-2 h-4 w-4" />
            Position
          </TabsTrigger>
          <TabsTrigger value="bidding">
            <DollarSign className="mr-2 h-4 w-4" />
            Bidding
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ad Position</CardTitle>
                <CardDescription>
                  Your current ad position
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{data.adCompetitorAnalysis.yourPosition}</div>
                    <p className="text-sm text-muted-foreground">Current Position</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Position CTR</span>
                    <span>{data.adPositionImpact.positionData.find(p => p.position === data.adCompetitorAnalysis.yourPosition)?.estimatedCTR}%</span>
                  </div>
                  <Progress 
                    value={data.adPositionImpact.positionData.find(p => p.position === data.adCompetitorAnalysis.yourPosition)?.estimatedCTR * 20} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ad Copy Strength</CardTitle>
                <CardDescription>
                  Overall ad copy effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{data.adCopyAnalysis.currentAd.strength}</div>
                    <p className="text-sm text-muted-foreground">Out of 100</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Relevance</span>
                    <span>{data.adCopyAnalysis.currentAd.relevance}/100</span>
                  </div>
                  <Progress value={data.adCopyAnalysis.currentAd.relevance} className="h-1" />
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span>Call to Action</span>
                    <span>{data.adCopyAnalysis.currentAd.cta}/100</span>
                  </div>
                  <Progress value={data.adCopyAnalysis.currentAd.cta} className="h-1" />
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span>Unique Selling Points</span>
                    <span>{data.adCopyAnalysis.currentAd.usp}/100</span>
                  </div>
                  <Progress value={data.adCopyAnalysis.currentAd.usp} className="h-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Bid Strategy</CardTitle>
                <CardDescription>
                  Recommended bid strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">${data.bidStrategySuggestions.recommended.bid}</div>
                    <p className="text-sm text-muted-foreground">Optimal Bid</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estimated Position</span>
                    <Badge>{data.bidStrategySuggestions.recommended.position}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Est. Clicks/Month</span>
                    <span className="font-medium">{data.bidStrategySuggestions.recommended.estimatedClicks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Est. ROAS</span>
                    <span className="font-medium">{data.bidStrategySuggestions.recommended.roas}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Competitor Ad Analysis</CardTitle>
              <CardDescription>
                Analysis of competitor ads for "{simulation.keyword}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Ad Distribution</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.adCompetitorAnalysis.competitorBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.adCompetitorAnalysis.competitorBreakdown.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === "Your Ad" ? chartColors.primary : 
                                [chartColors.secondary, chartColors.tertiary, chartColors.quaternary, chartColors.quinary, chartColors.gray][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Ad Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Competitor CTR Comparison</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.adCompetitorAnalysis.competitorBreakdown}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'CTR']} />
                        <Bar 
                          dataKey="ctr" 
                          name="Click-Through Rate" 
                          fill={chartColors.primary}
                          radius={[4, 4, 0, 0]}
                        >
                          {data.adCompetitorAnalysis.competitorBreakdown.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === "Your Ad" ? chartColors.primary : 
                                [chartColors.secondary, chartColors.tertiary, chartColors.quaternary, chartColors.quinary, chartColors.gray][index % 5]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="copy" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Copy Analysis</CardTitle>
              <CardDescription>
                Evaluation of your current ad copy and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Your Current Ad</h4>
                    <div className="p-4 border rounded-md">
                      <div className="font-medium text-blue-600 mb-1">
                        {data.adCompetitorAnalysis.competitorAdCopy.find(a => a.company === "Your Ad")?.headline}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.adCompetitorAnalysis.competitorAdCopy.find(a => a.company === "Your Ad")?.description}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.adCompetitorAnalysis.competitorAdCopy
                          .find(a => a.company === "Your Ad")
                          ?.strengths.map((strength, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50">
                              {strength}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Ad Strength Assessment</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Strength</span>
                          <span className="font-medium">{data.adCopyAnalysis.currentAd.strength}/100</span>
                        </div>
                        <Progress value={data.adCopyAnalysis.currentAd.strength} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Relevance</span>
                          <span className="font-medium">{data.adCopyAnalysis.currentAd.relevance}/100</span>
                        </div>
                        <Progress value={data.adCopyAnalysis.currentAd.relevance} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Call to Action</span>
                          <span className="font-medium">{data.adCopyAnalysis.currentAd.cta}/100</span>
                        </div>
                        <Progress value={data.adCopyAnalysis.currentAd.cta} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Unique Selling Points</span>
                          <span className="font-medium">{data.adCopyAnalysis.currentAd.usp}/100</span>
                        </div>
                        <Progress value={data.adCopyAnalysis.currentAd.usp} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Competitor Ad Analysis</h4>
                  <div className="space-y-4">
                    {data.adCompetitorAnalysis.competitorAdCopy
                      .filter(ad => ad.company !== "Your Ad")
                      .map((ad, index) => (
                        <div key={index} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-600 mb-1">
                                {ad.headline}
                              </div>
                              <div className="text-sm text-gray-600">
                                {ad.description}
                              </div>
                            </div>
                            <Badge variant="outline">{ad.company}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ad.strengths.map((strength, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {data.adCopyAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Lightbulb className="h-4 w-4 mr-2 mt-1 text-yellow-500" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Optimized Ad Copy Example</h5>
                      <div className="p-4 border rounded-md bg-blue-50">
                        <div className="font-medium text-blue-600 mb-1">
                          {data.adCopyAnalysis.improvedHeadline}
                        </div>
                        <div className="text-sm text-gray-600">
                          {data.adCopyAnalysis.improvedDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="position" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Position Analysis</CardTitle>
              <CardDescription>
                Impact of ad position on performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Position Impact on CTR</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.adPositionImpact.positionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="position" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          if (name === "estimatedCTR") return [`${value}%`, "Estimated CTR"];
                          return [value, name];
                        }} />
                        <Bar 
                          dataKey="estimatedCTR" 
                          name="Estimated CTR" 
                          fill={chartColors.primary}
                          radius={[4, 4, 0, 0]}
                        >
                          {data.adPositionImpact.positionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.position === data.adCompetitorAnalysis.yourPosition ? 
                                chartColors.secondary : chartColors.primary} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Position vs. Cost Multiplier</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.adPositionImpact.positionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="position" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          if (name === "costMultiplier") return [`${value}x`, "Cost Multiplier"];
                          return [value, name];
                        }} />
                        <Line
                          type="monotone"
                          dataKey="costMultiplier"
                          name="Cost Multiplier"
                          stroke={chartColors.secondary}
                          strokeWidth={2}
                          dot={{ r: 6, fill: chartColors.secondary }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Ad Click Distribution by Position</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.adPositionImpact.clickDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        <Cell fill={chartColors.primary} />
                        <Cell fill={chartColors.secondary} />
                        <Cell fill={chartColors.gray} />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Click Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <Target className="h-4 w-4 text-blue-500" />
                <AlertTitle>Position Insight</AlertTitle>
                <AlertDescription>
                  Your current position ({data.adCompetitorAnalysis.yourPosition}) has an estimated CTR of {data.adPositionImpact.positionData.find(p => p.position === data.adCompetitorAnalysis.yourPosition)?.estimatedCTR}%. 
                  Moving up to position {Math.max(1, data.adCompetitorAnalysis.yourPosition - 1)} could increase CTR by 
                  {(data.adPositionImpact.positionData.find(p => p.position === Math.max(1, data.adCompetitorAnalysis.yourPosition - 1))?.estimatedCTR || 0) - 
                    (data.adPositionImpact.positionData.find(p => p.position === data.adCompetitorAnalysis.yourPosition)?.estimatedCTR || 0)}% 
                  but would require a cost multiplier of {data.adPositionImpact.positionData.find(p => p.position === Math.max(1, data.adCompetitorAnalysis.yourPosition - 1))?.costMultiplier}x.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bidding" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bid Strategy Analysis</CardTitle>
              <CardDescription>
                Bid recommendations and performance predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">CPC Trends for "{simulation.keyword}"</h4>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.estimatedCpcData.monthlyTrends}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[0, 'dataMax + 1']} />
                          <Tooltip formatter={(value) => [`$${value}`, 'CPC']} />
                          <Line
                            type="monotone"
                            dataKey="cpc"
                            name="Cost Per Click"
                            stroke={chartColors.primary}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">CPC Range Analysis</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Keyword</TableCell>
                          <TableCell className="font-medium">{data.estimatedCpcData.keyword}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Average CPC</TableCell>
                          <TableCell className="font-medium">${data.estimatedCpcData.averageCpc}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>High Position CPC</TableCell>
                          <TableCell className="font-medium">${data.estimatedCpcData.highPosition}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Low Position CPC</TableCell>
                          <TableCell className="font-medium">${data.estimatedCpcData.lowPosition}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Competitive Index</TableCell>
                          <TableCell className="font-medium">
                            {Math.round((data.estimatedCpcData.highPosition / getAverageBid()) * 100) / 100}x
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Bid Strategy Comparison</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Strategy</TableHead>
                          <TableHead>Bid Amount</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Est. Clicks</TableHead>
                          <TableHead>Est. Conversions</TableHead>
                          <TableHead>Est. CPA</TableHead>
                          <TableHead>Est. ROAS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.bidStrategySuggestions.strategies.map((strategy, index) => (
                          <TableRow key={index} className={strategy.name === "Balanced" ? "bg-blue-50" : ""}>
                            <TableCell>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: getStrategyColor(strategy.name) }}
                                ></div>
                                <span className="font-medium">{strategy.name}</span>
                                {strategy.name === "Balanced" && (
                                  <Badge variant="outline" className="ml-2">Recommended</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>${strategy.bid}</TableCell>
                            <TableCell>{strategy.position}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{strategy.estimatedClicks}</span>
                                {renderTrendIndicator(
                                  strategy.estimatedClicks, 
                                  data.bidStrategySuggestions.strategies.find(s => s.name === "Balanced")?.estimatedClicks || 0
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{strategy.estimatedConversions}</span>
                                {renderTrendIndicator(
                                  strategy.estimatedConversions, 
                                  data.bidStrategySuggestions.strategies.find(s => s.name === "Balanced")?.estimatedConversions || 0
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>${strategy.estimatedCpa}</span>
                                {renderTrendIndicator(
                                  data.bidStrategySuggestions.strategies.find(s => s.name === "Balanced")?.estimatedCpa || 0,
                                  strategy.estimatedCpa
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{strategy.roas}%</span>
                                {renderTrendIndicator(
                                  strategy.roas, 
                                  data.bidStrategySuggestions.strategies.find(s => s.name === "Balanced")?.roas || 0
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <AlertTitle>Bid Recommendation</AlertTitle>
                  <AlertDescription>
                    Based on your performance goals and competitive analysis, we recommend the {data.bidStrategySuggestions.recommended.position} position 
                    with a bid of ${data.bidStrategySuggestions.recommended.bid}. This balanced approach offers the best ROAS 
                    while maintaining competitive visibility.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}